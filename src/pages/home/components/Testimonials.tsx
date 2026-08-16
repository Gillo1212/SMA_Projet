export default function Testimonials() {
  const testimonials = [
    { id: 1, name: 'Amadou Diallo', company: 'Directeur, TechHub Dakar', avatar: '#FF6B6B', content: 'Les machines SMA ont transformé notre espace de coworking. Nos membres apprécient particulièrement la possibilité de payer avec Wave et Orange Money. Service impeccable !', rating: 5 },
    { id: 2, name: 'Fatou Sall', company: 'Responsable RH, Sonatel', avatar: '#4ECDC4', content: 'Installation rapide et professionnelle. Les distributeurs fonctionnent parfaitement et le service après-vente est très réactif. Nos employés sont ravis.', rating: 5 },
    { id: 3, name: 'Moussa Ndiaye', company: 'Gérant, Hôtel Teranga', avatar: '#95E1D3', content: 'Excellente qualité des produits et des machines. La gestion du stock est simplifiée et les rapports de vente sont très détaillés.', rating: 5 },
    { id: 4, name: 'Aïssatou Ba', company: 'Directrice, Clinique Mermoz', avatar: '#F38181', content: 'Parfait pour notre établissement de santé. Les machines sont silencieuses, hygiéniques et offrent une grande variété de produits sains.', rating: 5 },
    { id: 5, name: 'Ibrahima Sarr', company: 'PDG, Groupe Industriel Sénégalais', avatar: '#AA96DA', content: 'Nous avons équipé nos 5 sites avec SMA. La centralisation de la gestion et les statistiques en temps réel sont des atouts majeurs.', rating: 5 },
    { id: 6, name: 'Mariama Cissé', company: 'Responsable Achats, Université Cheikh Anta Diop', avatar: '#FCBAD3', content: 'Solution idéale pour notre campus. Les étudiants adorent la facilité de paiement mobile et la diversité des produits proposés.', rating: 5 },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 sm:mb-16">
          <div className="inline-block px-5 py-2 bg-[#EEFFF2] text-[#0D8C2E] text-sm font-semibold rounded-full mb-5 sm:mb-6">
            TÉMOIGNAGES CLIENTS
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black">
            Ce Que Disent<br />Nos Clients Professionnels
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-6 sm:p-8">
              <div className="flex items-center mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mr-4" style={{ backgroundColor: testimonial.avatar }}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-base sm:text-lg text-black">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-[#666666]">@{testimonial.company}</div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed mb-5 sm:mb-6">« {testimonial.content} »</p>
              <div className="flex space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-[#0D8C2E] text-base sm:text-lg"></i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
