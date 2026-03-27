import { Link } from 'react-router-dom';

interface CTAButton {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: string;
  variant?: 'primary' | 'white' | 'whatsapp';
}

interface CTABannerProps {
  badge?: string;
  title: string;
  subtitle: string;
  buttons: CTAButton[];
}

export default function CTABanner({ badge, title, subtitle, buttons }: CTABannerProps) {
  const getButtonClass = (variant: CTAButton['variant'] = 'primary') => {
    const base = 'inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 whitespace-nowrap cursor-pointer';
    if (variant === 'white') return `${base} bg-white text-[#00272B] hover:bg-[#EEFFF2]`;
    if (variant === 'whatsapp') return `${base} bg-[#25D366] text-white hover:bg-[#1fb855]`;
    return `${base} bg-[#1AAA3F] text-white hover:bg-[#158f35]`;
  };

  const renderButton = (btn: CTAButton, idx: number) => {
    const cls = getButtonClass(btn.variant);
    const content = (
      <>
        {btn.icon && (
          <span className="w-6 h-6 flex items-center justify-center">
            <i className={`${btn.icon} text-xl`}></i>
          </span>
        )}
        {btn.label}
      </>
    );

    if (btn.isExternal) {
      return (
        <a key={idx} href={btn.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {content}
        </a>
      );
    }

    if (btn.href.startsWith('tel:') || btn.href.startsWith('mailto:')) {
      return (
        <a key={idx} href={btn.href} className={cls}>
          {content}
        </a>
      );
    }

    return (
      <Link key={idx} to={btn.href} className={cls}>
        {content}
      </Link>
    );
  };

  return (
    <div className="bg-white px-6 lg:px-10 pb-10">
      <section className="relative overflow-hidden rounded-3xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1AAA3F] via-[#0f7a2c] to-[#00272B]"></div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-[#1AAA3F]/20 rounded-full -translate-y-1/2"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 py-12 sm:py-20 px-4 sm:px-8 text-center max-w-3xl mx-auto">
          {badge && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-5 sm:mb-6">
              <span className="w-2 h-2 bg-[#1AAA3F] rounded-full animate-pulse"></span>
              {badge}
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 leading-tight">
            {title}
          </h2>

          <p className="text-base sm:text-lg text-white/75 mb-7 sm:mb-10 leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center">
            {buttons.map((btn, idx) => renderButton(btn, idx))}
          </div>
        </div>
      </section>
    </div>
  );
}
