import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';
import { numberFormat } from '@/utils/helpers';

const ZONES = [
  { key: 'header_banner',     label: 'Banner Cabeçalho (728×90)',   desc: 'Topo de todas as páginas' },
  { key: 'before_player',     label: 'Antes do Player (336×280)',    desc: 'Antes do iframe de vídeo' },
  { key: 'after_description', label: 'Após Sinopse (728×90)',        desc: 'Após a sinopse do conteúdo' },
  { key: 'between_episodes',  label: 'Entre Episódios (300×250)',    desc: 'Na lista de episódios (a cada 8)' },
  { key: 'catalog_inline',    label: 'Inline no Catálogo',          desc: 'Card no catálogo (a cada 8)' },
  { key: 'footer_banner',     label: 'Banner Rodapé (728×90)',       desc: 'Antes do footer' },
  { key: 'interstitial',      label: 'Interstitial',                desc: 'Popup ao navegar (max 1×/hora)' },
  { key: 'blog_inline',       label: 'Inline no Blog',              desc: 'Após 2º parágrafo dos posts' },
];

const NETWORKS = [['html','HTML Personalizado'],['adsense','Google AdSense'],['adsterra','Adsterra'],['propellerads','PropellerAds'],['medianet','Media.net']];

export default function AdminAds() {
  const qc = useQueryClient();
  const [activeZone, setActiveZone] = useState('');
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: configs } = useQuery({ queryKey: ['admin-ads'], queryFn: () => api.get('/admin/ads').then(r => r.data.data || {}) });
  const { data: stats } = useQuery({ queryKey: ['admin-ads-stats'], queryFn: () => api.get('/admin/ads-stats').then(r => r.data.data) });

  const openZone = (zone: string) => {
    setActiveZone(zone);
    setForm(configs?.[zone] || { enabled: false, network: 'html' });
  };

  const saveMutation = useMutation({
    mutationFn: () => api.post('/admin/ads/save', { zone: activeZone, ...form }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ads'] }); toast.success('Guardado!'); setActiveZone(''); },
  });

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-rectangle-ad text-primary mr-3" />Gestão de Anúncios</h1>

      {/* Stats */}
      {stats?.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="section-title mb-4"><i className="fa-solid fa-chart-bar text-primary" />Estatísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s: any) => (
              <div key={s.zone} className="text-center">
                <p className="text-xs text-text-muted mb-1">{s.zone}</p>
                <p className="text-lg font-bold text-white">{numberFormat(s.impressions || 0)}</p>
                <p className="text-xs text-text-muted">imp · <span className="text-primary">{numberFormat(s.clicks || 0)}</span> cliques</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {ZONES.map(zone => {
          const cfg = configs?.[zone.key] || {};
          return (
            <div key={zone.key} className={`card p-4 ${cfg.enabled ? 'border-success/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white text-sm">{zone.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{zone.desc}</p>
                  {cfg.enabled && cfg.network && <span className="badge-green text-xs mt-1">{cfg.network}</span>}
                </div>
                <button onClick={() => openZone(zone.key)} className="btn-ghost text-xs py-1.5 shrink-0">
                  <i className="fa-solid fa-gear" /> Configurar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone form modal */}
      {activeZone && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-surface-border flex items-center justify-between">
              <h3 className="font-semibold text-white">{ZONES.find(z=>z.key===activeZone)?.label}</h3>
              <button onClick={() => setActiveZone('')} className="btn-icon w-8 h-8 text-sm"><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="p-5 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.enabled} onChange={e=>set('enabled',e.target.checked)} className="accent-primary" />
                <span className="text-sm text-text-secondary">Activar anúncio nesta zona</span>
              </label>
              <div>
                <label className="label">Rede Publicitária</label>
                <select value={form.network||'html'} onChange={e=>set('network',e.target.value)} className="input">
                  {NETWORKS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {form.network === 'html' && (
                <div><label className="label">Código HTML</label><textarea rows={5} value={form.html_code||''} onChange={e=>set('html_code',e.target.value)} className="input resize-none font-mono text-xs" /></div>
              )}
              {form.network === 'adsense' && (<>
                <div><label className="label">Client ID</label><input value={form.client||''} onChange={e=>set('client',e.target.value)} className="input text-sm" placeholder="ca-pub-..." /></div>
                <div><label className="label">Slot ID</label><input value={form.slot||''} onChange={e=>set('slot',e.target.value)} className="input text-sm" /></div>
              </>)}
              {activeZone === 'interstitial' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Delay (seg)</label><input type="number" value={form.delay_seconds||5} onChange={e=>set('delay_seconds',parseInt(e.target.value))} className="input" /></div>
                  <div><label className="label">Cooldown (h)</label><input type="number" value={form.cooldown_hours||1} onChange={e=>set('cooldown_hours',parseInt(e.target.value))} className="input" /></div>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.show_admins} onChange={e=>set('show_admins',e.target.checked)} className="accent-primary" />
                <span className="text-sm text-text-secondary">Mostrar a admins também</span>
              </label>
            </div>
            <div className="p-5 border-t border-surface-border flex gap-3">
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary flex-1">
                <i className="fa-solid fa-floppy-disk" /> Guardar
              </button>
              <button onClick={() => setActiveZone('')} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
