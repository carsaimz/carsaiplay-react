import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name_pt: '', name_en: '', slug: '' });
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: () => api.get('/admin/categories').then(r => r.data.data) });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/admin/categories/save', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setForm({ name_pt:'', name_en:'', slug:'' }); toast.success('Categoria guardada!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.get(`/admin/categories/${id}/delete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Eliminada.'); },
  });

  const genSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-tags text-primary mr-3" />Categorias / Géneros</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Nova Categoria</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Nome (PT)</label>
              <input value={form.name_pt} onChange={e => { setForm(f => ({ ...f, name_pt: e.target.value, slug: genSlug(e.target.value) })); }} className="input" placeholder="Ex: Ficção Científica" />
            </div>
            <div>
              <label className="label">Nome (EN)</label>
              <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} className="input" placeholder="Ex: Sci-Fi" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" />
            </div>
            <button onClick={() => saveMutation.mutate()} disabled={!form.name_pt || !form.slug || saveMutation.isPending} className="btn-primary w-full">
              <i className="fa-solid fa-floppy-disk" /> Guardar
            </button>
          </div>
        </div>
        {/* List */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Categorias existentes</h3>
          {isLoading ? <div className="skeleton h-40 rounded" /> : (
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {data?.map((cat: any) => (
                <div key={cat.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-white">{cat.name_pt}</p>
                    {cat.name_en && <p className="text-xs text-text-muted">{cat.name_en} · {cat.slug}</p>}
                  </div>
                  <span className="text-xs text-text-muted">{cat.content_count || 0}</span>
                  <button onClick={() => { if (confirm('Eliminar categoria?')) deleteMutation.mutate(cat.id); }} className="btn-icon w-7 h-7 text-xs text-red-400">
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
