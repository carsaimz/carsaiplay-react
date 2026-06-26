import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDate } from '@/utils/helpers';
import { toast } from 'react-toastify';

export default function Reminders() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['reminders'], queryFn: () => api.get('/user/reminders').then(r => r.data.data) });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.post(`/user/reminders/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reminders'] }); toast.success(t('Lembrete cancelado.', 'Reminder cancelled.')); },
  });

  const statusColor: Record<string, string> = {
    active:    'badge-green',
    sent:      'badge-blue',
    cancelled: 'badge-gray',
  };
  const statusLabel: Record<string, [string, string]> = {
    active:    ['Activo',    'Active'],
    sent:      ['Enviado',   'Sent'],
    cancelled: ['Cancelado', 'Cancelled'],
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-bell text-primary mr-3" />{t('Lembretes', 'Reminders')}
      </h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((r: any) => (
            <div key={r.id} className="card p-4 flex items-center gap-4">
              <i className="fa-solid fa-bell text-primary text-xl shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{r.content_title_pt || r.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  <i className="fa-regular fa-calendar mr-1" />{formatDate(r.remind_at, lang)}
                </p>
              </div>
              <span className={`${statusColor[r.status] || 'badge-gray'} text-xs`}>
                {statusLabel[r.status]?.[lang === 'en' ? 1 : 0] || r.status}
              </span>
              {r.status === 'active' && (
                <button onClick={() => cancelMutation.mutate(r.id)} className="btn-icon w-8 h-8 text-xs text-red-400">
                  <i className="fa-solid fa-times" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <i className="fa-regular fa-bell text-4xl mb-3" />
          <p>{t('Sem lembretes activos.', 'No active reminders.')}</p>
        </div>
      )}
    </div>
  );
}
