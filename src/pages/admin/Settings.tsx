import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

const TABS = [
  { id: 'general',    label: 'Geral',       icon: 'fa-gear' },
  { id: 'email',      label: 'Email/SMTP',  icon: 'fa-envelope' },
  { id: 'social',     label: 'Social',      icon: 'fa-share-nodes' },
  { id: 'appearance', label: 'Aparência',   icon: 'fa-palette' },
  { id: 'advanced',   label: 'Avançado',    icon: 'fa-code' },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings').then(r => r.data.data || {}),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/settings/save', data),
    onSuccess: () => toast.success('Configurações guardadas!'),
    onError: () => toast.error('Erro ao guardar.'),
  });

  const smtpTest = useMutation({
    mutationFn: () => api.post('/admin/settings/smtp-test'),
    onSuccess: () => toast.success('SMTP testado com sucesso!'),
    onError: () => toast.error('Erro no teste SMTP.'),
  });

  const sitemapMutation = useMutation({
    mutationFn: () => api.post('/admin/gen-sitemap'),
    onSuccess: () => toast.success('Sitemap gerado!'),
  });

  if (isLoading) return <div className="skeleton h-64 rounded-xl" />;

  const [form, setForm] = useState({ ...settings });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-gear text-primary mr-3" />Configurações do Site</h1>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-card border border-surface-border rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}>
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        {tab === 'general' && (<>
          <div className="grid md:grid-cols-2 gap-4">
            {[['site_name','Nome do Site','CarsaiPlay'],['site_tagline','Tagline','Cinema na Palma da sua Mão'],['site_url','URL do Site','https://'],['support_email','Email de Suporte','']].map(([k,l,ph])=>(
              <div key={k}><label className="label">{l}</label><input value={form[k]||''} onChange={e=>set(k,e.target.value)} className="input" placeholder={ph}/></div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {[['registration_open','Registo aberto'],['comment_moderation','Moderação de comentários'],['pwa_enabled','PWA activo'],['maintenance','Modo de manutenção']].map(([k,l])=>(
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={e=>set(k,e.target.checked)} className="accent-primary" />
                <span className="text-sm text-text-secondary">{l}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="label">Itens por página</label>
            <input type="number" min="6" max="100" value={form.items_per_page||24} onChange={e=>set('items_per_page',e.target.value)} className="input w-32" />
          </div>
        </>)}

        {tab === 'email' && (<>
          <div className="grid md:grid-cols-2 gap-4">
            {[['smtp_host','Host SMTP'],['smtp_port','Porta SMTP'],['smtp_user','Utilizador SMTP'],['smtp_pass','Password SMTP'],['smtp_from','Email de envio'],['smtp_from_name','Nome de envio']].map(([k,l])=>(
              <div key={k}><label className="label">{l}</label><input type={k.includes('pass')?'password':'text'} value={form[k]||''} onChange={e=>set(k,e.target.value)} className="input"/></div>
            ))}
          </div>
          <div>
            <label className="label">Encriptação</label>
            <select value={form.smtp_encryption||'tls'} onChange={e=>set('smtp_encryption',e.target.value)} className="input w-auto">
              <option value="tls">TLS</option><option value="ssl">SSL</option><option value="">Nenhuma</option>
            </select>
          </div>
          <button onClick={() => smtpTest.mutate()} disabled={smtpTest.isPending} className="btn-ghost text-sm">
            <i className="fa-solid fa-vial" /> Testar SMTP
          </button>
        </>)}

        {tab === 'social' && (<>
          {[['telegram_url','Telegram'],['whatsapp_url','WhatsApp'],['facebook_url','Facebook'],['instagram_url','Instagram'],['youtube_url','YouTube']].map(([k,l])=>(
            <div key={k}><label className="label">{l}</label><input value={form[k]||''} onChange={e=>set(k,e.target.value)} className="input" placeholder="https://..."/></div>
          ))}
        </>)}

        {tab === 'appearance' && (<>
          <div><label className="label">Cor principal (hex)</label><input type="color" value={form.theme_color||'#e50914'} onChange={e=>set('theme_color',e.target.value)} className="h-10 w-20 rounded cursor-pointer" /></div>
          <div><label className="label">Idioma padrão</label><select value={form.default_language||'pt'} onChange={e=>set('default_language',e.target.value)} className="input w-auto"><option value="pt">Português</option><option value="en">English</option></select></div>
        </>)}

        {tab === 'advanced' && (<>
          <div><label className="label">Código personalizado &lt;head&gt;</label><textarea rows={4} value={form.custom_head_code||''} onChange={e=>set('custom_head_code',e.target.value)} className="input resize-none font-mono text-xs" /></div>
          <div><label className="label">Código personalizado &lt;/body&gt;</label><textarea rows={4} value={form.custom_footer_code||''} onChange={e=>set('custom_footer_code',e.target.value)} className="input resize-none font-mono text-xs" /></div>
          <button onClick={() => sitemapMutation.mutate()} disabled={sitemapMutation.isPending} className="btn-ghost text-sm">
            <i className="fa-solid fa-sitemap" /> Gerar Sitemap
          </button>
        </>)}

        <div className="pt-4 border-t border-surface-border">
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-floppy-disk" />}
            Guardar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
