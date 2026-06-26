import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useSettingsStore } from '@/store/settingsStore';

export default function Achievements() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const { data, isLoading } = useQuery({ queryKey: ['achievements'], queryFn: () => userApi.achievements().then(r => r.data.data) });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-trophy text-primary mr-3" />{t('Conquistas', 'Achievements')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-24 rounded-xl"/>) :
          data?.map((a: any) => (
            <div key={a.id} className={`card p-4 flex items-center gap-4 ${a.unlocked ? 'border-primary/30' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${a.unlocked ? 'bg-primary/20 border border-primary/40' : 'bg-surface-elevated border border-surface-border'}`}>
                <i className={`fa-solid fa-${a.badge_icon} ${a.unlocked ? 'text-primary' : 'text-text-muted'} text-xl`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{lang === 'en' && a.name_en ? a.name_en : a.name_pt}</p>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{lang === 'en' && a.description_en ? a.description_en : a.description_pt}</p>
                <div className="flex items-center gap-2 mt-1">
                  <i className="fa-solid fa-coins text-yellow-400 text-xs" />
                  <span className="text-xs text-yellow-400">{a.points} pts</span>
                  {a.unlocked && <span className="badge-green text-[10px] ml-1">{t('Desbloqueado', 'Unlocked')}</span>}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
