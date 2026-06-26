import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Faq() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const [open, setOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['faq'],
    queryFn: () => api.get('/faq').then(r => r.data.data).catch(() => null),
  });

  // FAQs hardcoded como fallback (podem vir da BD)
  const faqs = data || [
    { q: t('O CarsaiPlay é gratuito?', 'Is CarsaiPlay free?'), a: t('Sim, completamente gratuito. Sem subscrições.', 'Yes, completely free. No subscriptions.') },
    { q: t('Preciso de conta para assistir?', 'Do I need an account to watch?'), a: t('Pode navegar sem conta, mas para favoritos e pedidos precisa registar-se gratuitamente.', 'You can browse without an account, but for favorites and requests you need to register for free.') },
    { q: t('O conteúdo está hospedado no CarsaiPlay?', 'Is content hosted on CarsaiPlay?'), a: t('Não. Somos um índice de conteúdo. Os vídeos vêm de fontes externas.', 'No. We are a content index. Videos come from external sources.') },
    { q: t('Como pedir um conteúdo?', 'How do I request content?'), a: t('Crie uma conta e use a secção de Pedidos na sua área de utilizador.', 'Create an account and use the Requests section in your user area.') },
    { q: t('Posso instalar como aplicação?', 'Can I install as an app?'), a: t('Sim! Disponível na Google Play e como PWA no browser.', 'Yes! Available on Google Play and as a PWA in your browser.') },
    { q: t('Como reportar um link partido?', 'How do I report a broken link?'), a: t('Na página de cada conteúdo há um botão "Reportar problema".', 'On each content page there is a "Report problem" button.') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8">
        <i className="fa-solid fa-circle-question text-primary mr-3" />
        {t('Perguntas Frequentes', 'Frequently Asked Questions')}
      </h1>
      <div className="space-y-3">
        {faqs.map((faq: any, i: number) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-medium text-white">{faq.q}</span>
              <i className={`fa-solid fa-chevron-down text-primary transition-transform duration-200 shrink-0 ml-3 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
