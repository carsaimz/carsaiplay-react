import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';

export default function Dmca() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const { data } = useQuery({ queryKey: ['dmca'], queryFn: () => api.get('/dmca').then(r => r.data.data).catch(() => null) });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-scale-balanced text-primary mr-3" /> DMCA
      </h1>
      {data?.content_pt ? (
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.content_pt }} />
      ) : (
        <div className="card p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t('Aviso de Violação', 'Notice of Infringement')}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('O CarsaiPlay respeita os direitos de propriedade intelectual. Se o seu conteúdo foi incorporado sem autorização, contacte-nos com:', 'CarsaiPlay respects intellectual property rights. If your content was embedded without authorization, contact us with:')}
            </p>
            <ul className="mt-3 space-y-2">
              {[
                t('Identificação do trabalho protegido', 'Identification of the copyrighted work'),
                t('URL específica do conteúdo infrator', 'Specific URL of the infringing content'),
                t('Os seus dados de contacto', 'Your contact information'),
                t('Declaração de boa fé', 'Good faith declaration'),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <i className="fa-solid fa-check text-primary mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">{t('Contacto DMCA', 'DMCA Contact')}</h2>
            <a href="mailto:dmca@carsaiplay.mz" className="text-primary hover:underline text-sm">
              <i className="fa-solid fa-envelope mr-2" />dmca@carsaiplay.mz
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
