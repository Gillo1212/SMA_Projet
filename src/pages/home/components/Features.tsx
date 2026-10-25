import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation();
  return (
    <section className="py-20 sm:py-28 bg-[#F6F3EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <p className="eyebrow text-[#0D8C2E] mb-10">{t('features.eyebrow')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Produits locaux */}
          <article className="bg-[#00272B] rounded-2xl p-8 sm:p-10 flex flex-col">
            <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center mb-10">
              <i className="ri-plant-line text-[#4FD07A] text-xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl text-white mb-5">{t('features.localTitle')}</h3>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">{t('features.localText')}</p>
          </article>

          {/* Distribution */}
          <article className="relative rounded-2xl overflow-hidden min-h-[420px]">
            <img
              src="/images/machines/sen-coffee-distributeur-cafe-grains/3.webp"
              alt="Distributeur SEN Coffee installé dans un hall"
              className="absolute inset-0 w-full h-full object-cover object-center"
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

          {/* Paiements */}
          <article className="bg-white rounded-2xl p-8 sm:p-10 flex flex-col">
            <h3 className="text-2xl sm:text-3xl text-[#00272B] mb-5">{t('features.paymentTitle')}</h3>
            <p className="text-[#00272B]/65 text-sm sm:text-base leading-relaxed mb-10">{t('features.paymentText')}</p>
            <div className="mt-auto flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-[#00272B]/10 flex items-center justify-center bg-white">
                <img
                  src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/768bed2b-5283-47bc-b9e6-f4dae5cf304f_Wave.png?v=c76ba778473ee3601f42a6ffe67df37c"
                  alt="Wave"
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <div className="w-16 h-16 rounded-xl border border-[#00272B]/10 flex items-center justify-center bg-white">
                <img
                  src="https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/7601a307-e87f-40c7-84ba-40ace6edbf5e_Orange-money.png?v=e2d6d95468557e3a937a2d097b94b09e"
                  alt="Orange Money"
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
