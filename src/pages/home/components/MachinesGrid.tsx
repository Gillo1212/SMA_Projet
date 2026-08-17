import { Link } from 'react-router-dom';
import { useMachines } from '../../../hooks/useMachines';

export default function MachinesGrid() {
  // Les machines mises en avant sont marquées is_featured côté backend
  const { machines, isLoading } = useMachines({ featured: true, limit: 4 });
  const featured = machines.slice(0, 4);

  // La section est masquée tant qu'il n'y a rien à montrer : c'est une
  // vitrine, un bloc vide ou un spinner y seraient plus gênants qu'utiles.
  if (isLoading || featured.length === 0) return null;

  return (
    <section className="py-16 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-black mb-4 md:mb-0">
            Nos Distributeurs<br />Automatiques
          </h2>
          <p className="text-sm sm:text-base text-[#666666] max-w-md leading-relaxed">
            Découvrez notre gamme complète de machines adaptées à tous les environnements professionnels et besoins spécifiques.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((machine) => (
            <div key={machine.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={machine.image}
                  alt={machine.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#0D8C2E] text-white px-3 py-1 rounded-xl text-xs font-semibold">
                  À partir de {machine.priceDisplay}
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 sm:mb-4">{machine.name}</h3>
                <div className="space-y-2 mb-4 sm:mb-6">
                  <div className="flex items-start text-xs sm:text-sm text-[#666666]">
                    <i className="ri-checkbox-circle-fill text-[#0D8C2E] mr-2 mt-0.5"></i>
                    <span>{machine.category}</span>
                  </div>
                  <div className="flex items-start text-xs sm:text-sm text-[#666666]">
                    <i className="ri-checkbox-circle-fill text-[#0D8C2E] mr-2 mt-0.5"></i>
                    <span>Livraison : {machine.deliveryTime}</span>
                  </div>
                  <div className="flex items-start text-xs sm:text-sm text-[#666666]">
                    <i className="ri-checkbox-circle-fill text-[#0D8C2E] mr-2 mt-0.5"></i>
                    <span>{machine.stock}</span>
                  </div>
                </div>
                <Link
                  to={`/machines/${machine.slug}`}
                  className="block w-full py-2.5 sm:py-3 text-center border-2 border-[#0D8C2E] text-[#0D8C2E] font-semibold rounded-lg hover:bg-[#0D8C2E] hover:text-white transition-colors text-sm whitespace-nowrap"
                >
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <Link to="/machines" className="inline-block px-8 py-3 bg-[#00272B] text-white font-semibold rounded-lg hover:bg-[#003840] transition-colors whitespace-nowrap">
            Voir Toutes les Machines
          </Link>
        </div>
      </div>
    </section>
  );
}
