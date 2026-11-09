import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6" data-reveal="left">
            <p className="eyebrow text-[#0D8C2E] mb-5">{t('about.eyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B] mb-8">
              {t('about.titleLine1')}{' '}
              <em className="italic text-[#0D8C2E]">{t('about.titleLine2')}</em>
            </h2>
            <p className="text-base sm:text-lg text-[#00272B]/70 leading-relaxed mb-8">
              {t('about.intro')}
            </p>
            <blockquote className="border-l-2 border-[#1AAA3F] pl-6 mb-8">
              <p className="eyebrow text-[#00272B]/50 mb-2">{t('about.missionLabel')}</p>
              <p className="font-serif italic text-xl sm:text-2xl text-[#00272B] leading-snug">
                {t('about.mission')}
              </p>
            </blockquote>
            <p className="text-base text-[#00272B]/70 leading-relaxed mb-10">
              {t('about.ecosystem')}
            </p>
            <Link
              to="/a-propos"
              className="group inline-flex items-center gap-2 text-[#00272B] font-semibold border-b border-[#00272B] pb-1 hover:text-[#0D8C2E] hover:border-[#0D8C2E] transition-colors"
            >
              {t('about.learnMore')}
              <i className="ri-arrow-right-line arrow-slide"></i>
            </Link>
          </div>
          <div className="lg:col-span-6" data-reveal="right">
            <div className="group rounded-2xl overflow-hidden bg-[#0B0B0B] shadow-[0_30px_60px_-30px_rgba(0,39,43,0.5)]">
              <img
                src="/images/machines/sapoe-avm/6.webp"
                alt="La gamme de machines à café SMALIM : Sapoe AVM, Lecon et Lecon Good Taste"
                loading="lazy"
                className="w-full h-auto transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
