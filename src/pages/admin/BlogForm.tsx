import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

export default function AdminBlogForm() {
  const { id } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [form, setForm] = useState({ title_pt:'', title_en:'', slug:'', excerpt_pt:'', content_pt:'', featured_image:'', category_id:'', status:'draft' });
  const { data: cats } = useQuery({ queryKey: ['blog-cats'], queryFn: () => api.get('/admin/blog/categories').then(r => r.data.data) });
  const { data: existing } = useQuery({ queryKey: ['blog-post', id], queryFn: () => api.get(`/blog/${id}`).then(r => r.data.data), enabled: isEdit });

  useEffect(() => { if (existing) setForm(f => ({ ...f, ...existing })); }, [existing]);

  const genSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () => isEdit ? api.put(`/admin/blog/${id}`, form) : api.post('/admin/blog/save', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog'] }); toast.success('Post guardado!'); nav('/admin/blog'); },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => nav('/admin/blog')} className="btn-icon w-9 h-9"><i className="fa-solid fa-arrow-left" /></button>
        <h1 className="page-title">{isEdit ? 'Editar Post' : 'Novo Post'}</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <div><label className="label">Título (PT) *</label><input value={form.title_pt} onChange={e=>{set('title_pt',e.target.value); if(!isEdit)set('slug',genSlug(e.target.value));}} className="input" /></div>
            <div><label className="label">Título (EN)</label><input value={form.title_en} onChange={e=>set('title_en',e.target.value)} className="input" /></div>
            <div><label className="label">Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} className="input font-mono text-sm" /></div>
            <div><label className="label">Resumo (PT)</label><textarea rows={2} value={form.excerpt_pt} onChange={e=>set('excerpt_pt',e.target.value)} className="input resize-none" /></div>
            <div><label className="label">Conteúdo (HTML)</label><textarea rows={12} value={form.content_pt} onChange={e=>set('content_pt',e.target.value)} className="input resize-none font-mono text-xs" /></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div><label className="label">Estado</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></div>
            <div><label className="label">Categoria</label><select value={form.category_id} onChange={e=>set('category_id',e.target.value)} className="input"><option value="">Sem categoria</option>{cats?.map((c:any)=><option key={c.id} value={c.id}>{c.name_pt}</option>)}</select></div>
            <div><label className="label">Imagem de Destaque</label><input value={form.featured_image} onChange={e=>set('featured_image',e.target.value)} className="input text-sm font-mono" placeholder="https://..." />{form.featured_image&&<img src={form.featured_image} alt="" className="mt-2 w-full h-24 object-cover rounded"/>}</div>
            <button onClick={()=>saveMutation.mutate()} disabled={!form.title_pt||!form.slug||saveMutation.isPending} className="btn-primary w-full">
              <i className="fa-solid fa-floppy-disk" /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
