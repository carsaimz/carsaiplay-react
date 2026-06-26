import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

export default function AdminEpisodes() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasonForm, setSeasonForm] = useState({ season_number: '', title_pt: '', title_en: '' });
  const [epForm, setEpForm] = useState({ episode_number:'', title_pt:'', title_en:'', description_pt:'', embed_url:'', embed_url_dub:'', download_url:'', duration:'', season_id:'' });
  const [editEp, setEditEp] = useState<any>(null);

  const { data: content } = useQuery({ queryKey: ['admin-content-item', id], queryFn: () => api.get(`/admin/content/${id}`).then(r => r.data.data), enabled: !!id });
  const { data: seasons, refetch: refetchSeasons } = useQuery({ queryKey: ['admin-seasons', id], queryFn: () => api.get(`/admin/content/${id}/episodes`).then(r => r.data.data), enabled: !!id });

  const saveSeason = useMutation({
    mutationFn: () => api.post('/admin/api/season/save', { content_id: id, ...seasonForm }),
    onSuccess: () => { refetchSeasons(); setSeasonForm({ season_number:'', title_pt:'', title_en:'' }); toast.success('Temporada guardada!'); },
  });

  const deleteSeason = useMutation({
    mutationFn: (season_id: number) => api.post('/admin/api/season/delete', { season_id }),
    onSuccess: () => { refetchSeasons(); toast.success('Temporada eliminada.'); },
  });

  const saveEp = useMutation({
    mutationFn: () => api.post('/admin/api/episode/save', { ...epForm, season_id: activeSeason, ...(editEp ? { id: editEp.id } : {}) }),
    onSuccess: () => { refetchSeasons(); setEpForm({ episode_number:'',title_pt:'',title_en:'',description_pt:'',embed_url:'',embed_url_dub:'',download_url:'',duration:'',season_id:'' }); setEditEp(null); toast.success('Episódio guardado!'); },
  });

  const deleteEp = useMutation({
    mutationFn: (ep_id: number) => api.post('/admin/api/episode/delete', { ep_id }),
    onSuccess: () => { refetchSeasons(); toast.success('Episódio eliminado.'); },
  });

  const startEditEp = (ep: any) => {
    setEditEp(ep);
    setEpForm({ episode_number: ep.episode_number, title_pt: ep.title_pt||'', title_en: ep.title_en||'', description_pt: ep.description_pt||'', embed_url: ep.embed_url||'', embed_url_dub: ep.embed_url_dub||'', download_url: ep.download_url||'', duration: ep.duration||'', season_id: ep.season_id });
  };

  const currentSeason = seasons?.find((s: any) => s.id === activeSeason);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="btn-icon w-9 h-9"><i className="fa-solid fa-arrow-left" /></Link>
        <div>
          <h1 className="page-title">Temporadas & Episódios</h1>
          {content && <p className="text-text-muted text-sm">{content.title_pt}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Seasons column */}
        <div>
          <div className="card p-4 mb-4">
            <h3 className="font-semibold text-white mb-3">Nova Temporada</h3>
            <div className="space-y-2">
              <input type="number" placeholder="Nº Temporada *" value={seasonForm.season_number}
                onChange={e => setSeasonForm(f => ({...f, season_number: e.target.value}))} className="input text-sm" />
              <input placeholder="Título (PT)" value={seasonForm.title_pt}
                onChange={e => setSeasonForm(f => ({...f, title_pt: e.target.value}))} className="input text-sm" />
              <button onClick={() => saveSeason.mutate()} disabled={!seasonForm.season_number || saveSeason.isPending} className="btn-primary w-full text-sm py-2">
                <i className="fa-solid fa-plus" /> Criar
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {seasons?.map((s: any) => (
              <div key={s.id} onClick={() => setActiveSeason(s.id)}
                className={`card p-3 cursor-pointer flex items-center gap-3 ${activeSeason === s.id ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/20'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-elevated shrink-0">
                  <span className="text-xs font-bold text-white">{s.season_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.title_pt || `Temporada ${s.season_number}`}</p>
                  <p className="text-xs text-text-muted">{s.episodes?.length || 0} episódios</p>
                </div>
                <button onClick={e => { e.stopPropagation(); if (confirm('Eliminar temporada e todos os episódios?')) deleteSeason.mutate(s.id); }}
                  className="btn-icon w-7 h-7 text-xs text-red-400 shrink-0">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Episodes column */}
        <div className="md:col-span-2">
          {activeSeason ? (
            <>
              <div className="card p-4 mb-4">
                <h3 className="font-semibold text-white mb-3">{editEp ? `Editar Ep. ${editEp.episode_number}` : 'Novo Episódio'}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Nº Episódio *</label>
                    <input type="number" value={epForm.episode_number} onChange={e => setEpForm(f=>({...f,episode_number:e.target.value}))} className="input text-sm" />
                  </div>
                  <div>
                    <label className="label text-xs">Duração</label>
                    <input value={epForm.duration} onChange={e => setEpForm(f=>({...f,duration:e.target.value}))} className="input text-sm" placeholder="24 min" />
                  </div>
                  <div>
                    <label className="label text-xs">Título (PT)</label>
                    <input value={epForm.title_pt} onChange={e => setEpForm(f=>({...f,title_pt:e.target.value}))} className="input text-sm" />
                  </div>
                  <div>
                    <label className="label text-xs">Título (EN)</label>
                    <input value={epForm.title_en} onChange={e => setEpForm(f=>({...f,title_en:e.target.value}))} className="input text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label text-xs">Embed URL *</label>
                    <input value={epForm.embed_url} onChange={e => setEpForm(f=>({...f,embed_url:e.target.value}))} className="input text-sm font-mono" />
                  </div>
                  <div>
                    <label className="label text-xs">Embed Dublado</label>
                    <input value={epForm.embed_url_dub} onChange={e => setEpForm(f=>({...f,embed_url_dub:e.target.value}))} className="input text-sm font-mono" />
                  </div>
                  <div>
                    <label className="label text-xs">Download URL</label>
                    <input value={epForm.download_url} onChange={e => setEpForm(f=>({...f,download_url:e.target.value}))} className="input text-sm font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label text-xs">Descrição</label>
                    <textarea rows={2} value={epForm.description_pt} onChange={e => setEpForm(f=>({...f,description_pt:e.target.value}))} className="input resize-none text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <button onClick={() => saveEp.mutate()} disabled={!epForm.episode_number || saveEp.isPending} className="btn-primary text-sm py-2">
                    <i className="fa-solid fa-floppy-disk" /> {editEp ? 'Actualizar' : 'Adicionar'}
                  </button>
                  {editEp && <button onClick={() => { setEditEp(null); setEpForm({ episode_number:'',title_pt:'',title_en:'',description_pt:'',embed_url:'',embed_url_dub:'',download_url:'',duration:'',season_id:'' }); }} className="btn-ghost text-sm">Cancelar</button>}
                </div>
              </div>
              <div className="space-y-2">
                {currentSeason?.episodes?.map((ep: any) => (
                  <div key={ep.id} className="card flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded bg-surface-elevated flex items-center justify-center shrink-0 text-xs font-bold text-primary">{ep.episode_number}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{ep.title_pt || `Episódio ${ep.episode_number}`}</p>
                      {ep.duration && <p className="text-xs text-text-muted">{ep.duration}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEditEp(ep)} className="btn-icon w-7 h-7 text-xs"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => { if (confirm('Eliminar episódio?')) deleteEp.mutate(ep.id); }} className="btn-icon w-7 h-7 text-xs text-red-400"><i className="fa-solid fa-trash" /></button>
                    </div>
                  </div>
                ))}
                {!currentSeason?.episodes?.length && (
                  <div className="text-center py-8 text-text-muted text-sm">
                    <i className="fa-solid fa-film text-3xl mb-2 block" />Sem episódios. Adiciona acima.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-text-muted">
              <i className="fa-solid fa-chevron-left text-4xl mb-3 block" />
              <p>Selecciona uma temporada para gerir os episódios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
