import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  const facts = [t('home.hero.fact1'), t('home.hero.fact2'), t('home.hero.fact3')];

  return (
    <section
      className="relative pt-20 bg-[#00272B] overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 70% at 78% 62%, rgba(26,170,63,0.22), transparent 70%), radial-gradient(ellipse 50% 40% at 10% 0%, rgba(255,255,255,0.05), transparent 70%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center lg:min-h-[620px] py-14 sm:py-20 lg:py-16">
          {/* Texte */}
          <div className="lg:col-span-6 xl:col-span-7">
            <p className="eyebrow text-[#4FD07A] mb-6">{t('home.hero.eyebrow')}</p>
            <h1 className="text-[38px] sm:text-[52px] xl:text-[60px] text-white leading-[1.05] mb-7">
              {t('home.hero.title')}{' '}
              <em className="italic text-[#4FD07A]">{t('home.hero.titleAccent')}</em>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mb-10">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/machines"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#1AAA3F] text-white font-semibold rounded-md hover:bg-[#0D8C2E] transition-colors"
              >
                {t('home.hero.ctaMachines')}
                <i className="ri-arrow-right-line"></i>
              </Link>
              <Link
                to="/machines/devis"
                className="inline-flex items-center justify-center px-7 py-4 border border-white/30 text-white font-semibold rounded-md hover:bg-white hover:text-[#00272B] transition-colors"
              >
                {t('home.hero.ctaQuote')}
              </Link>
            </div>
            <ul className="mt-12 pt-8 border-t border-white/10 grid sm:grid-cols-3 gap-4">
              {facts.map(fact => (
                <li key={fact} className="flex items-start gap-2.5 text-sm text-white/80">
                  <i className="ri-check-line text-[#4FD07A] mt-0.5"></i>
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Composition des machines réelles */}
          <div className="lg:col-span-6 xl:col-span-5 relative h-[380px] sm:h-[520px] lg:h-[600px]" aria-hidden="true">
            <div className="absolute inset-x-[6%] bottom-3 h-12 rounded-[50%] bg-black/50 blur-2xl"></div>
            <img
              src="/images/cutouts/nexx.webp"
              alt=""
              className="absolute bottom-8 left-[3%] h-[70%] w-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
            />
            <img
              src="/images/cutouts/sen-coffee.webp"
              alt=""
              className="absolute bottom-5 left-1/2 -translate-x-1/2 h-[92%] w-auto z-10 drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)]"
            />
            <img
              src="/images/cutouts/lecon-good-taste.webp"
              alt=""
              className="absolute bottom-3 right-[2%] h-[44%] w-auto z-20 drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
