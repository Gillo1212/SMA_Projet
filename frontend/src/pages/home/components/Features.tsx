import { useTranslation } from 'react-i18next';
import { revealDelay } from '../../../components/feature/RevealObserver';
import { PAYMENT_LOGOS } from '../../../constants/paymentLogos';

export default function Features() {
  const { t } = useTranslation();
  return (
    <section className="py-20 sm:py-28 bg-[#F6F3EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <p className="eyebrow text-[#0D8C2E] mb-10" data-reveal>{t('features.eyebrow')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Produits locaux */}
          <article className="card-lift bg-[#00272B] rounded-2xl p-8 sm:p-10 flex flex-col" data-reveal style={revealDelay(0)}>
            <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center mb-10">
              <i className="ri-plant-line text-[#4FD07A] text-xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl text-white mb-5">{t('features.localTitle')}</h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">{t('features.localText')}</p>
          </article>

          {/* Distribution */}
          <article className="group card-lift relative rounded-2xl overflow-hidden min-h-[420px]" data-reveal style={revealDelay(1)}>
            <img
              src="/images/machines/sen-coffee-distributeur-cafe-grains/3.webp"
              alt="Distributeur SEN Coffee installé dans un hall"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00272B]/90 via-[#00272B]/10 to-transparent"></div>
            <span className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/90 text-[#00272B] rounded-full px-4 py-2 text-xs font-semibold">
              <i className="ri-wifi-line text-[#0D8C2E]"></i>
              {t('features.iotBadge')}
            </span>
            <h3 className="absolute bottom-8 left-8 right-8 text-2xl sm:text-3xl text-white">
              {t('features.distributionTitleLine1')}
              <span className="block text-base sm:text-lg font-sans text-white/75 mt-2" style={{ letterSpacing: 0 }}>
                {t('features.distributionTitleLine2')}
              </span>
            </h3>
          </article>

          {/* Paiements : les logos tels quels, sans cadre autour */}
          <article className="card-lift bg-white rounded-2xl p-8 sm:p-10 flex flex-col" data-reveal style={revealDelay(2)}>
            <h3 className="text-2xl sm:text-3xl text-[#00272B] mb-5">{t('features.paymentTitle')}</h3>
            <p className="text-[#00272B]/65 text-sm sm:text-base leading-relaxed mb-10">{t('features.paymentText')}</p>
            <ul className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-4" aria-label={t('features.paymentTitle')}>
              <li className="flex items-center gap-3">
                <img src={PAYMENT_LOGOS.wave} alt="" className="w-12 h-12 rounded-[14px] object-cover shadow-[0_6px_16px_-8px_rgba(29,200,255,0.9)]" />
                <span className="text-lg font-bold tracking-tight text-[#00272B]">Wave</span>
              </li>
              <li className="flex items-center gap-3">
                <img src={PAYMENT_LOGOS.orangeMoney} alt="" className="h-10 w-auto object-contain" />
                <span className="text-lg font-bold tracking-tight text-[#00272B]">Orange <span className="text-[#FF7900]">Money</span></span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
