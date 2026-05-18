import React from 'react';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onNavigate: (id: string) => void;
}

const FEATURES = [
  {
    titleKey: 'landing.feature1.title',
    descriptionKey: 'landing.feature1.description',
    icon: '📓',
  },
  {
    titleKey: 'landing.feature2.title',
    descriptionKey: 'landing.feature2.description',
    icon: '📡',
  },
  {
    titleKey: 'landing.feature3.title',
    descriptionKey: 'landing.feature3.description',
    icon: '🩺',
  },
  {
    titleKey: 'landing.feature4.title',
    descriptionKey: 'landing.feature4.description',
    icon: '🗺️',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';
  const faqs = t('landing.faqs', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_35%),#0b1520] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-farm-accent">{t('landing.heroTagline')}</p>
          <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5 text-sm font-semibold shadow-sm shadow-black/20">
            <button
              type="button"
              onClick={() => i18n.changeLanguage('en')}
              className={`px-4 py-2 transition ${currentLang === 'en' ? 'bg-white text-slate-950' : 'text-gray-300 hover:bg-white/10'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => i18n.changeLanguage('vi')}
              className={`px-4 py-2 transition ${currentLang === 'vi' ? 'bg-white text-slate-950' : 'text-gray-300 hover:bg-white/10'}`}
            >
              VI
            </button>
          </div>
        </div>

        <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="lg:w-7/12 space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.24em] text-farm-accent font-semibold shadow-sm shadow-farm-accent/10">
                {t('landing.heroTagline')}
              </div>

              <div className="space-y-6">
                <h2 className="text-5xl font-semibold leading-tight sm:text-6xl">{t('landing.heroTitle')}</h2>
                <p className="max-w-3xl text-lg text-gray-300 sm:text-xl">{t('landing.heroDescription')}</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => onNavigate('notebook')}
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-primary-500/20 transition hover:bg-primary-500"
                >
                  {t('landing.launchNotebook')}
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:border-primary-400 hover:text-primary-300"
                >
                  {t('landing.explorePlatform')}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-sm shadow-black/10">
                  <div className="text-3xl font-bold text-farm-accent">96%</div>
                  <p className="mt-2 text-sm text-gray-400 uppercase tracking-[0.2em]">{t('landing.alertAccuracy')}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-sm shadow-black/10">
                  <div className="text-3xl font-bold text-primary-400">120k+</div>
                  <p className="mt-2 text-sm text-gray-400 uppercase tracking-[0.2em]">{t('landing.animalsMonitored')}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-sm shadow-black/10">
                  <div className="text-3xl font-bold text-[#60a5fa]">24/7</div>
                  <p className="mt-2 text-sm text-gray-400 uppercase tracking-[0.2em]">{t('landing.operationalCoverage')}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-sm shadow-black/10">
                  <div className="text-3xl font-bold text-[#f59e0b]">4x</div>
                  <p className="mt-2 text-sm text-gray-400 uppercase tracking-[0.2em]">{t('landing.fasterDecisions')}</p>
                </div>
              </div>
            </div>

            <div className="lg:w-5/12">
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c1724] p-6 shadow-2xl shadow-black/50">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-400 via-farm-accent to-primary-600" />
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{t('landing.walkthroughLabel')}</p>
                    <h2 className="text-2xl font-semibold text-white">{t('landing.walkthroughTitle')}</h2>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-gray-400">
                    {t('landing.previewTag')}
                  </span>
                </div>

                <div className="aspect-[16/9] overflow-hidden rounded-[28px] border border-white/10 bg-[#07101c] shadow-inner shadow-black/50">
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/20 text-4xl text-primary-300 shadow-lg shadow-primary-500/20">
                      ▶️
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{t('landing.walkthroughTitle')}</p>
                      <p className="mt-2 text-sm text-gray-400">{t('landing.walkthroughSubtitle')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-[#081522] p-4">
                    <p className="text-sm font-semibold text-white">{t('landing.smartSummaries')}</p>
                    <p className="mt-2 text-sm text-gray-400">{t('landing.smartSummariesDescription')}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#081522] p-4">
                    <p className="text-sm font-semibold text-white">{t('landing.actionReadyAlerts')}</p>
                    <p className="mt-2 text-sm text-gray-400">{t('landing.actionReadyAlertsDescription')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.titleKey} className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary-400">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-2xl text-farm-accent">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{t(feature.titleKey)}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-[32px] border border-white/10 bg-[#0c1726] p-8 shadow-2xl shadow-black/40">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">{t('landing.faqTitle')}</h2>
              <p className="mt-3 max-w-2xl text-gray-400">{t('landing.faqSubtitle')}</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/10">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0c1726] p-8 shadow-2xl shadow-black/40">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-farm-accent">{t('landing.whySectionLabel')}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{t('landing.decisionTitle')}</h2>
              <p className="mt-4 max-w-2xl text-gray-400">{t('landing.decisionDescription')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-semibold text-primary-400">AI</p>
                <p className="mt-2 text-sm text-gray-400">{t('landing.aiSummary')}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-semibold text-farm-accent">Ops</p>
                <p className="mt-2 text-sm text-gray-400">{t('landing.opsSummary')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
