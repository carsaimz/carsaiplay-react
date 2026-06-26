import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

const AGE_RATINGS = ['L','10','12','14','16','18'];
const TYPES = [['movie','Filme'],['series','Série'],['animation','Animação'],['documentary','Documentário']];

export default function AdminContentForm() {
  const { id } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title_pt:'', title_en:'', original_title:'', slug:'',
    type:'movie', description_pt:'', description_en:'',
    release_year:'', duration:'', age_rating:'L',
    poster_url:'', banner_url:'', trailer_url:'',
    featured: false, status:'draft',
    embed_url:'', embed_url_dub:'', download_url:'',
    quality:'HD', audio_language:'pt', subtitle_language:'',
  });
  const [selCats, setSelCats] = useState<number[]>([]);

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/categories').then(r => r.data.data) });
  const { data: existing } = useQuery({
    queryKey: ['admin-content-item', id],
    queryFn: () => api.get(`/admin/content/${id}`).then(r => r.data.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm(f => ({ ...f, ...existing, ...existing.movie }));
      setSelCats(existing.categories?.map((c: any) => c.id) || []);
    }
  }, [existing]);

  const genSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () => isEdit
      ? api.put('/admin/content', { ...form, id: parseInt(id!), categories: selCats })
      : api.post('/admin/content', { ...form, categories: selCats }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-content'] }); toast.success('Guardado!'); nav('/admin/content'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Erro ao guardar.'),
  });

  const isSeries = ['series','animation'].includes(form.type);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => nav('/admin/content')} className="btn-icon w-9 h-9"><i className="fa-solid fa-arrow-left" /></button>
        <h1 className="page-title">{isEdit ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="md:col-span-2 space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-white"><i className="fa-solid fa-info-circle text-primary mr-2" />Informações Básicas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Título (PT) *</label>
                <input value={form.title_pt} onChange={e => { set('title_pt', e.target.value); if (!isEdit) set('slug', genSlug(e.target.value)); }} className="input" required />
              </div>
              <div>
                <label className="label">Título (EN)</label>
                <input value={form.title_en} onChange={e => set('title_en', e.target.value)} className="input" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Título Original</label>
                <input value={form.original_title} onChange={e => set('original_title', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input font-mono text-sm" />
              </div>
            </div>
            <div>
              <label className="label">Sinopse (PT)</label>
              <textarea rows={4} value={form.description_pt} onChange={e => set('description_pt', e.target.value)} className="input resize-none" />
            </div>
            <div>
              <label className="label">Sinopse (EN)</label>
              <textarea rows={3} value={form.description_en} onChange={e => set('description_en', e.target.value)} className="input resize-none" />
            </div>
          </div>

          {/* Embed / Movie links */}
          {!isSeries && (
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-white"><i className="fa-solid fa-play text-primary mr-2" />Links do Filme</h3>
              <div>
                <label className="label">URL Embed (player principal)</label>
                <input value={form.embed_url} onChange={e => set('embed_url', e.target.value)} className="input font-mono text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="label">URL Embed Dublado</label>
                <input value={form.embed_url_dub} onChange={e => set('embed_url_dub', e.target.value)} className="input font-mono text-sm" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">URL Download</label>
                  <input value={form.download_url} onChange={e => set('download_url', e.target.value)} className="input font-mono text-sm" />
                </div>
                <div>
                  <label className="label">Qualidade</label>
                  <select value={form.quality} onChange={e => set('quality', e.target.value)} className="input">
                    {['SD','HD','FHD','4K'].map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-white"><i className="fa-solid fa-image text-primary mr-2" />Imagens</h3>
            <div>
              <label className="label">Poster URL</label>
              <input value={form.poster_url} onChange={e => set('poster_url', e.target.value)} className="input font-mono text-sm" placeholder="https://..." />
              {form.poster_url && <img src={form.poster_url} alt="" className="mt-2 h-24 rounded object-cover" />}
            </div>
            <div>
              <label className="label">Banner URL</label>
              <input value={form.banner_url} onChange={e => set('banner_url', e.target.value)} className="input font-mono text-sm" />
              {form.banner_url && <img src={form.banner_url} alt="" className="mt-2 h-16 w-full rounded object-cover" />}
            </div>
            <div>
              <label className="label">Trailer (YouTube URL)</label>
              <input value={form.trailer_url} onChange={e => set('trailer_url', e.target.value)} className="input font-mono text-sm" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-white">Publicação</h3>
            <div>
              <label className="label">Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div>
              <label className="label">Tipo</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input">
                {TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ano</label>
                <input type="number" min="1900" max="2030" value={form.release_year} onChange={e => set('release_year', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Duração</label>
                <input value={form.duration} onChange={e => set('duration', e.target.value)} className="input" placeholder="1h 45min" />
              </div>
            </div>
            <div>
              <label className="label">Classificação Etária</label>
              <select value={form.age_rating} onChange={e => set('age_rating', e.target.value)} className="input">
                {AGE_RATINGS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="accent-primary" />
              <span className="text-sm text-text-secondary">Destaque na home</span>
            </label>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3">Categorias</h3>
            <div className="space-y-1 max-h-52 overflow-y-auto scrollbar-hide">
              {cats?.map((c: any) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <input type="checkbox" checked={selCats.includes(c.id)}
                    onChange={e => setSelCats(s => e.target.checked ? [...s, c.id] : s.filter(x => x !== c.id))}
                    className="accent-primary" />
                  <span className="text-sm text-text-secondary">{c.name_pt}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={!form.title_pt || !form.slug || saveMutation.isPending}
            className="btn-primary w-full">
            {saveMutation.isPending ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-floppy-disk" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
