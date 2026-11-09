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
            <p className="eyebrow text-[#4FD07A] mb-6 motion-safe:animate-rise">{t('home.hero.eyebrow')}</p>
            <h1 className="text-[38px] sm:text-[52px] xl:text-[60px] text-white leading-[1.05] mb-7 motion-safe:animate-rise [animation-delay:120ms]">
              {t('home.hero.title')}{' '}
              <em className="italic text-[#4FD07A]">{t('home.hero.titleAccent')}</em>
            </h1>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mb-10 motion-safe:animate-rise [animation-delay:240ms]">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 motion-safe:animate-rise [animation-delay:360ms]">
              <Link
                to="/machines"
                className="group press inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#1AAA3F] text-white font-semibold rounded-md hover:bg-[#0D8C2E] hover:shadow-[0_12px_30px_-10px_rgba(26,170,63,0.7)]"
              >
                {t('home.hero.ctaMachines')}
                <i className="ri-arrow-right-line arrow-slide"></i>
              </Link>
              <Link
                to="/machines/devis"
                className="press inline-flex items-center justify-center px-7 py-4 border border-white/30 text-white font-semibold rounded-md hover:bg-white hover:text-[#00272B]"
              >
                {t('home.hero.ctaQuote')}
              </Link>
            </div>
            <ul className="mt-12 pt-8 border-t border-white/10 grid sm:grid-cols-3 gap-4 motion-safe:animate-rise [animation-delay:480ms]">
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
            {/* Halo vert qui respire derrière les machines */}
            <div className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[80%] aspect-square rounded-full bg-[#1AAA3F]/25 blur-3xl will-change-[opacity] motion-safe:animate-glow"></div>
            <div className="absolute inset-x-[6%] bottom-3 h-12 rounded-[50%] bg-black/50 blur-2xl"></div>
            <div className="absolute bottom-8 left-[3%] h-[70%] motion-safe:animate-rise [animation-delay:300ms]">
              <img
                src="/images/cutouts/nexx.webp"
                alt=""
                className="h-full w-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] will-change-transform motion-safe:animate-float-slow [animation-delay:-2s]"
              />
            </div>
            {/* Le bloc extérieur centre, l'intérieur anime : les deux transform ne se gênent pas */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-[92%] z-10">
              <div className="h-full motion-safe:animate-rise [animation-delay:150ms]">
                <img
                  src="/images/cutouts/sen-coffee.webp"
                  alt=""
                  className="h-full w-auto drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)] will-change-transform motion-safe:animate-float"
                />
              </div>
            </div>
            <div className="absolute bottom-3 right-[2%] h-[44%] z-20 motion-safe:animate-rise [animation-delay:450ms]">
              <img
                src="/images/cutouts/lecon-good-taste.webp"
                alt=""
                className="h-full w-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] will-change-transform motion-safe:animate-float-slow [animation-delay:-5s]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
