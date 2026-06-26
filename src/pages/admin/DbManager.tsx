import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/api/client';
import { toast } from 'react-toastify';

export default function AdminDbManager() {
  const [activeTable, setActiveTable] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sql, setSql] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState('');
  const [view, setView] = useState<'browse'|'sql'>('browse');

  const { data: tables } = useQuery({ queryKey: ['db-tables'], queryFn: () => api.get('/admin/db').then(r => r.data.data) });
  const { data: rows, isLoading } = useQuery({
    queryKey: ['db-browse', activeTable, page, search],
    queryFn: () => api.get(`/admin/db/${activeTable}/browse`, { params: { page, s: search } }).then(r => r.data),
    enabled: !!activeTable && view === 'browse',
  });

  const runSql = useMutation({
    mutationFn: () => api.post('/admin/db/query', { sql }),
    onSuccess: r => { setSqlResult(r.data.data); setSqlError(''); },
    onError: (e: any) => { setSqlError(e.response?.data?.error || 'Erro'); setSqlResult(null); },
  });

  const deleteRow = useMutation({
    mutationFn: ({ pk }: any) => api.post(`/admin/db/${activeTable}/delete/${pk}`),
    onSuccess: () => { toast.success('Eliminado.'); },
  });

  const cols = rows?.cols || [];
  const items = rows?.pag?.items || [];

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-database text-primary mr-3" />Gestor de Base de Dados</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {/* Table list */}
        <div className="card p-3 h-fit">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Tabelas</p>
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {tables?.map((t: any) => (
              <button key={t.name} onClick={() => { setActiveTable(t.name); setPage(1); setSearch(''); setView('browse'); }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${activeTable === t.name ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-elevated hover:text-white'}`}>
                {t.name}
                <span className="text-xs opacity-60 ml-2">{t.row_count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="md:col-span-3">
          {activeTable && (
            <>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setView('browse')} className={`btn-${view === 'browse' ? 'primary' : 'ghost'} text-sm py-2`}><i className="fa-solid fa-table mr-2" />Browse</button>
                <button onClick={() => setView('sql')} className={`btn-${view === 'sql' ? 'primary' : 'ghost'} text-sm py-2`}><i className="fa-solid fa-code mr-2" />SQL</button>
              </div>

              {view === 'browse' && (
                <>
                  <div className="mb-3">
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Pesquisar..." className="input text-sm py-2" />
                  </div>
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="border-b border-surface-border">
                          <tr>{cols.map((c: any) => <th key={c.name} className="px-3 py-2 text-left text-text-muted font-medium whitespace-nowrap">{c.name}</th>)}
                            <th className="px-3 py-2 text-right text-text-muted">Ações</th></tr>
                        </thead>
                        <tbody>
                          {isLoading ? <tr><td colSpan={cols.length+1} className="p-4"><div className="skeleton h-10 rounded" /></td></tr> :
                            items.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-surface-border/30 hover:bg-surface-elevated/20">
                                {cols.map((c: any) => (
                                  <td key={c.name} className="px-3 py-2 text-text-secondary max-w-32 truncate whitespace-nowrap">
                                    {row[c.name] === null ? <span className="text-text-muted italic">NULL</span> : String(row[c.name]).slice(0,60)}
                                  </td>
                                ))}
                                <td className="px-3 py-2 text-right">
                                  <button onClick={() => { if (confirm('Eliminar registo?')) deleteRow.mutate({ pk: row.id || row[cols[0]?.name] }); }}
                                    className="text-red-400 hover:text-red-300 text-xs"><i className="fa-solid fa-trash" /></button>
                                </td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                    {rows?.pag && (
                      <div className="p-3 border-t border-surface-border flex items-center justify-between">
                        <p className="text-xs text-text-muted">{rows.pag.total} registos</p>
                        <div className="flex gap-2">
                          <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-left"/></button>
                          <span className="text-xs text-text-muted px-2">{page}/{rows.pag.last}</span>
                          <button disabled={page === rows.pag.last} onClick={() => setPage(p=>p+1)} className="btn-ghost py-1 px-2 text-xs"><i className="fa-solid fa-chevron-right"/></button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {view === 'sql' && (
                <div className="card p-4 space-y-3">
                  <textarea rows={5} value={sql} onChange={e => setSql(e.target.value)}
                    placeholder={`SELECT * FROM ${activeTable} LIMIT 25`}
                    className="input resize-none font-mono text-xs" />
                  <button onClick={() => runSql.mutate()} disabled={!sql.trim() || runSql.isPending} className="btn-primary text-sm">
                    <i className="fa-solid fa-play" /> Executar
                  </button>
                  {sqlError && <div className="bg-red-950/30 border border-red-900/40 rounded p-3 text-red-400 text-xs font-mono">{sqlError}</div>}
                  {sqlResult && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr>{Object.keys(sqlResult[0] || {}).map(k => <th key={k} className="px-2 py-1 text-left text-text-muted">{k}</th>)}</tr></thead>
                        <tbody>{sqlResult.map((r: any, i: number) => (
                          <tr key={i} className="border-t border-surface-border/30">
                            {Object.values(r).map((v: any, j: number) => <td key={j} className="px-2 py-1 text-text-secondary">{v === null ? 'NULL' : String(v).slice(0,80)}</td>)}
                          </tr>
                        ))}</tbody>
                      </table>
                      <p className="text-xs text-text-muted mt-2">{sqlResult.length} resultado(s)</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {!activeTable && (
            <div className="text-center py-16 text-text-muted">
              <i className="fa-solid fa-database text-4xl mb-3 block" />
              <p>Selecciona uma tabela à esquerda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
