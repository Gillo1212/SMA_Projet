import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="px-4 sm:px-6 lg:px-10 pb-20 sm:pb-28 bg-white">
      <div
        className="max-w-7xl mx-auto rounded-3xl bg-[#00272B] overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(ellipse 55% 80% at 80% 100%, rgba(26,170,63,0.25), transparent 70%)' }}
      >
        <div className="grid lg:grid-cols-12 items-center gap-10 px-8 sm:px-14 pt-14 lg:py-16">
          <div className="lg:col-span-6">
            <p className="eyebrow text-[#4FD07A] mb-5">{t('home.cta.eyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-white mb-6">
              {t('home.cta.title')}{' '}
              <em className="italic text-[#4FD07A]">{t('home.cta.titleAccent')}</em>
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-lg">{t('home.cta.text')}</p>
            <Link
              to="/produits"
              className="inline-flex items-center gap-2 px-7 py-4 bg-white text-[#00272B] font-semibold rounded-md hover:bg-[#EEFFF2] transition-colors"
            >
              {t('home.cta.button')}
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="lg:col-span-6 relative h-[300px] sm:h-[380px]" aria-hidden="true">
            <img src="/images/cutouts/kingsmill-vanilla.webp" alt="" className="absolute bottom-0 left-[2%] h-[78%] w-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.4)]" />
            <img src="/images/cutouts/craft-roasters.webp" alt="" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[96%] w-auto z-10 drop-shadow-[0_22px_30px_rgba(0,0,0,0.45)]" />
            <img src="/images/cutouts/kingsmill-hot-chocolate.webp" alt="" className="absolute bottom-0 right-[2%] h-[80%] w-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
