import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMachines } from '../../../hooks/useMachines';
import { revealDelay } from '../../../components/feature/RevealObserver';

export default function MachinesGrid() {
  const { t } = useTranslation();
  // Les machines mises en avant sont marquées is_featured côté backend
  const { machines, isLoading } = useMachines({ featured: true, limit: 4 });
  const featured = machines.slice(0, 4);

  // La section est masquée tant qu'il n'y a rien à montrer : c'est une
  // vitrine, un bloc vide ou un spinner y seraient plus gênants qu'utiles.
  if (isLoading || featured.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-6 items-end mb-12 sm:mb-16" data-reveal>
          <div className="lg:col-span-7">
            <p className="eyebrow text-[#0D8C2E] mb-5">{t('home.machines.eyebrow')}</p>
            <h2 className="text-4xl sm:text-5xl text-[#00272B]">
              {t('home.machines.title')}{' '}
              <em className="italic text-[#0D8C2E]">{t('home.machines.titleAccent')}</em>
            </h2>
          </div>
          <p className="lg:col-span-5 text-base text-[#00272B]/65 leading-relaxed">
            {t('home.machines.subtitle')}
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${featured.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {featured.map((machine, index) => (
            <Link
              key={machine.id}
              to={`/machines/${machine.slug}`}
              data-reveal
              style={revealDelay(index)}
              className="group card-lift flex flex-col bg-white rounded-2xl border border-[#00272B]/10 overflow-hidden hover:border-[#1AAA3F]/40"
            >
              <div className="media-stage h-72 flex items-center justify-center p-6">
                <img
                  src={machine.image}
                  alt={machine.name}
                  loading="lazy"
                  className="max-h-full w-auto object-contain group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex flex-col flex-1 p-6 border-t border-[#00272B]/8">
                <p className="eyebrow text-[#0D8C2E] mb-3">{machine.category}</p>
                <h3 className="text-2xl text-[#00272B] mb-3">{machine.name}</h3>
                <p className="text-sm text-[#00272B]/60 leading-relaxed mb-6 line-clamp-2">{machine.shortDescription}</p>
                <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#00272B]/8">
                  <div>
                    <p className="text-xs text-[#00272B]/50">{t('common.price')}</p>
                    <p className="font-semibold text-[#00272B]">
                      {machine.price > 0 ? machine.priceDisplay : t('common.onQuote')}
                    </p>
                  </div>
                  <span className="w-10 h-10 rounded-full border border-[#00272B]/15 flex items-center justify-center text-[#00272B] group-hover:bg-[#1AAA3F] group-hover:border-[#1AAA3F] group-hover:text-white group-hover:rotate-45 transition-all duration-300">
                    <i className="ri-arrow-right-up-line"></i>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/machines"
            className="group press inline-flex items-center gap-2 px-7 py-3.5 bg-[#00272B] text-white font-semibold rounded-md hover:bg-[#0D8C2E]"
          >
            {t('home.machines.seeAll')}
            <i className="ri-arrow-right-line arrow-slide"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
