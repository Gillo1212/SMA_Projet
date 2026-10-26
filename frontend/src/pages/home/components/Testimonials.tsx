import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  const testimonials = [
    { id: 1, name: 'Amadou Diallo', company: 'Directeur, TechHub Dakar', content: t('testimonials.t1') },
    { id: 2, name: 'Fatou Sall', company: 'Responsable RH, Sonatel', content: t('testimonials.t2') },
    { id: 3, name: 'Moussa Ndiaye', company: 'Gérant, Hôtel Teranga', content: t('testimonials.t3') },
    { id: 4, name: 'Aïssatou Ba', company: 'Directrice, Clinique Mermoz', content: t('testimonials.t4') },
    { id: 5, name: 'Ibrahima Sarr', company: 'PDG, Groupe Industriel Sénégalais', content: t('testimonials.t5') },
    { id: 6, name: 'Mariama Cissé', company: 'Responsable achats, Université Cheikh Anta Diop', content: t('testimonials.t6') },
  ];

  const initials = (name: string) => name.split(' ').map(part => part[0]).join('').slice(0, 2);

  return (
    <section className="py-20 sm:py-28 bg-[#F6F3EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-12 sm:mb-16 max-w-2xl">
          <p className="eyebrow text-[#0D8C2E] mb-5">{t('testimonials.eyebrow')}</p>
          <h2 className="text-4xl sm:text-5xl text-[#00272B]">
            {t('testimonials.titleLine1')}{' '}
            <em className="italic text-[#0D8C2E]">{t('testimonials.titleLine2')}</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="bg-white rounded-2xl p-8 flex flex-col">
              <span className="font-serif text-6xl leading-[0.8] h-9 text-[#1AAA3F]/50" aria-hidden="true">“</span>
              <blockquote className="text-[15px] text-[#00272B]/80 leading-relaxed mb-8">
                {testimonial.content}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-4 pt-6 border-t border-[#00272B]/8">
                <span className="w-11 h-11 rounded-full bg-[#00272B] text-white text-sm font-semibold flex items-center justify-center">
                  {initials(testimonial.name)}
                </span>
                <span>
                  <span className="block font-semibold text-[#00272B]">{testimonial.name}</span>
                  <span className="block text-sm text-[#00272B]/55">{testimonial.company}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
