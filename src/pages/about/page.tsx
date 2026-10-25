import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import CTABanner from '../../components/feature/CTABanner';
import PageHero from '../../components/feature/PageHero';
import { useTranslation } from 'react-i18next';

// Structure de la page ; les textes sont dans i18n/local/<lang>/about.ts
const ACTIVITIES = ['distribution', 'agrifood', 'tech', 'partnerships'];
const INNOVATIONS = ['digital', 'local', 'traceability', 'sustainability'];
const ROADMAP = [
  { key: 'international', icon: 'ri-global-line' },
  { key: 'app',           icon: 'ri-smartphone-line' },
  { key: 'supplyChain',   icon: 'ri-truck-line' },
  { key: 'ownBrand',      icon: 'ri-store-line' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const list = (key: string) => t(key, { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <PageHero
        eyebrow={t('aboutPage.eyebrow')}
        title={t('aboutPage.title')}
        titleAccent={t('aboutPage.titleAccent')}
        subtitle={t('aboutPage.subtitle')}
      />

      {/* Mission */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="eyebrow text-[#0D8C2E] mb-5">{t('aboutPage.missionEyebrow')}</p>
              <p className="font-serif italic text-3xl sm:text-4xl text-[#00272B] leading-tight mb-8">
                {t('aboutPage.missionQuote')}
              </p>
              <p className="text-base sm:text-lg text-[#00272B]/70 leading-relaxed mb-5">
                {t('aboutPage.missionText1')}
              </p>
              <p className="text-base sm:text-lg text-[#00272B]/70 leading-relaxed">
                {t('aboutPage.missionText2')}
              </p>
            </div>
            <div className="lg:col-span-6">
              <img
                src="/images/machines/sen-coffee-distributeur-cafe-grains/2.webp"
                alt={t('aboutPage.missionImageAlt')}
                className="w-full h-[460px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activités */}
      <section className="py-20 sm:py-28 bg-[#F6F3EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#0D8C2E] mb-5">{t('aboutPage.activitiesEyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B]">
              {t('aboutPage.activitiesTitle')} <em className="italic text-[#0D8C2E]">{t('aboutPage.activitiesTitleAccent')}</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {ACTIVITIES.map((key, i) => (
              <article key={key} className="bg-white rounded-2xl p-8 sm:p-10">
                <p className="font-serif text-2xl text-[#1AAA3F] mb-6">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="text-2xl text-[#00272B] mb-4">{t(`aboutPage.activities.${key}.title`)}</h3>
                <p className="text-[15px] text-[#00272B]/70 leading-relaxed mb-6">{t(`aboutPage.activities.${key}.text`)}</p>
                <div className="flex flex-wrap gap-2">
                  {list(`aboutPage.activities.${key}.tags`).map(tag => (
                    <span key={tag} className="px-3 py-1 border border-[#00272B]/10 text-[#00272B]/70 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, vision, engagements */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">{t('aboutPage.missionEyebrow')}</p>
            <p className="text-[15px] text-[#00272B]/70 leading-relaxed">
              {t('aboutPage.missionShort')}
            </p>
          </div>
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">{t('aboutPage.visionEyebrow')}</p>
            <p className="text-[15px] text-[#00272B]/70 leading-relaxed">
              {t('aboutPage.visionText')}
            </p>
          </div>
          <div>
            <p className="eyebrow text-[#0D8C2E] mb-4">{t('aboutPage.commitmentsEyebrow')}</p>
            <ul className="text-[15px] text-[#00272B]/70 space-y-2.5">
              {list('aboutPage.commitments').map(item => (
                <li key={item} className="flex items-start gap-2.5"><i className="ri-check-line text-[#0D8C2E] mt-0.5"></i>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Innovation et impact */}
      <section className="py-20 sm:py-28 bg-[#00272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#4FD07A] mb-5">{t('aboutPage.innovationEyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-white">
              {t('aboutPage.innovationTitle')} <em className="italic text-[#4FD07A]">{t('aboutPage.innovationTitleAccent')}</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {INNOVATIONS.map(key => (
              <div key={key} className="bg-[#00272B] p-8">
                <h3 className="text-xl text-white mb-2">{t(`aboutPage.innovations.${key}.axis`)}</h3>
                <p className="text-sm text-white/60 mb-5">{t(`aboutPage.innovations.${key}.desc`)}</p>
                <p className="eyebrow text-[#4FD07A]">
                  {t('aboutPage.impactLabel', { impact: t(`aboutPage.innovations.${key}.impact`) })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perspectives */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="eyebrow text-[#0D8C2E] mb-5">{t('aboutPage.roadmapEyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B]">
              {t('aboutPage.roadmapTitle')} <em className="italic text-[#0D8C2E]">{t('aboutPage.roadmapTitleAccent')}</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP.map(item => (
              <div key={item.key} className="border border-[#00272B]/10 rounded-2xl p-7">
                <i className={`${item.icon} text-2xl text-[#0D8C2E]`}></i>
                <h3 className="text-xl text-[#00272B] mt-6 mb-3">{t(`aboutPage.roadmap.${item.key}.title`)}</h3>
                <p className="text-sm text-[#00272B]/65 leading-relaxed">{t(`aboutPage.roadmap.${item.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        badge={t('aboutPage.ctaBadge')}
        title={t('aboutPage.ctaTitle')}
        subtitle={t('aboutPage.ctaSubtitle')}
        buttons={[
          { label: t('aboutPage.ctaQuote'), href: '/machines/devis', icon: 'ri-file-list-3-line', variant: 'white' },
          { label: t('aboutPage.ctaCall'), href: 'tel:+221331234567', icon: 'ri-phone-line', variant: 'primary' },
        ]}
      />

      <Footer />
    </div>
  );
}
