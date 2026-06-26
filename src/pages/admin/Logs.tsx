import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export default function AdminLogs() {
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', level, page],
    queryFn: () => api.get('/admin/logs', { params: { level, page } }).then(r => r.data),
  });

  const levelColors: Record<string, string> = { ERROR:'text-red-400', WARNING:'text-yellow-400', INFO:'text-blue-400', DEBUG:'text-text-muted' };

  return (
    <div>
      <h1 className="page-title mb-6"><i className="fa-solid fa-terminal text-primary mr-3" />Logs do Sistema</h1>
      <div className="card p-3 mb-4 flex gap-2">
        {['','INFO','WARNING','ERROR','DEBUG'].map(l => (
          <button key={l} onClick={() => { setLevel(l); setPage(1); }}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${level === l ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}>
            {l || 'Todos'}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden font-mono text-xs">
        {isLoading ? <div className="p-4"><div className="skeleton h-40 rounded" /></div> : (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-1">
            {data?.data?.map((log: any, i: number) => (
              <div key={i} className="flex gap-3">
                <span className="text-text-muted shrink-0">{log.date}</span>
                <span className={`shrink-0 w-16 ${levelColors[log.level] || 'text-text-muted'}`}>{log.level}</span>
                <span className="text-text-secondary break-all">{log.message}</span>
              </div>
            ))}
            {!data?.data?.length && <p className="text-text-muted py-8 text-center text-sm font-sans">Sem logs.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
