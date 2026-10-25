import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  /** Fin du titre, affichée en italique dans la couleur d'accent */
  titleAccent?: string;
  subtitle?: string;
  /** Contenu sous le sous-titre : barre de recherche, boutons… */
  children?: ReactNode;
}

/**
 * En-tête des pages publiques : bandeau bleu nuit, titre en Fraunces.
 * Le décalage pt-20 laisse la place à la barre de navigation fixe.
 */
export default function PageHero({ eyebrow, title, titleAccent, subtitle, children }: PageHeroProps) {
  return (
    <section
      className="pt-20 bg-[#00272B]"
      style={{ backgroundImage: 'radial-gradient(ellipse 50% 90% at 90% 100%, rgba(26,170,63,0.22), transparent 70%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow text-[#4FD07A] mb-5">{eyebrow}</p>}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] text-white">
            {title}
            {titleAccent && (
              <>
                {' '}
                <em className="italic text-[#4FD07A]">{titleAccent}</em>
              </>
            )}
          </h1>
          {subtitle && (
            <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">{subtitle}</p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
