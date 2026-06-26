import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDate } from '@/utils/helpers';

export default function Notifications() {
  const { lang } = useSettingsStore();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => userApi.notifications().then(r => r.data.data) });
  const markRead = useMutation({ mutationFn: userApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-bell text-primary mr-3" />{lang === 'pt' ? 'Notificações' : 'Notifications'}
      </h1>
      <div className="space-y-2">
        {isLoading ? Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-20 rounded-xl"/>) :
          data?.map((n: any) => (
            <div key={n.id} onClick={() => !n.read && markRead.mutate(n.id)}
              className={`card p-4 cursor-pointer transition-colors ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}>
              <div className="flex items-start gap-3">
                <i className={`fa-solid fa-bell mt-0.5 ${n.read ? 'text-text-muted' : 'text-primary'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${n.read ? 'text-text-secondary' : 'text-white'}`}>{n.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                  <p className="text-xs text-text-muted mt-1">{formatDate(n.created_at, lang)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
              </div>
            </div>
          ))
        }
        {!isLoading && !data?.length && (
          <div className="text-center py-16 text-text-muted">
            <i className="fa-regular fa-bell text-4xl mb-3" />
            <p>{lang === 'pt' ? 'Sem notificações.' : 'No notifications.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
