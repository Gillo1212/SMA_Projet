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
    const base = 'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-semibold text-sm sm:text-base transition-colors whitespace-nowrap cursor-pointer';
    if (variant === 'white') return `${base} bg-white text-[#00272B] hover:bg-[#EEFFF2]`;
    if (variant === 'whatsapp') return `${base} bg-[#25D366] text-white hover:bg-[#1fb855]`;
    return `${base} border border-white/30 text-white hover:bg-white hover:text-[#00272B]`;
  };

  const renderButton = (btn: CTAButton, idx: number) => {
    const cls = getButtonClass(btn.variant);
    const content = (
      <>
        {btn.icon && (
          <i className={`${btn.icon} text-lg`}></i>
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
    <div className="bg-white px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
      <section
        className="max-w-7xl mx-auto rounded-3xl bg-[#00272B] overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(ellipse 50% 90% at 85% 100%, rgba(26,170,63,0.25), transparent 70%)' }}
      >
        <div className="grid lg:grid-cols-12 gap-8 items-center px-8 sm:px-14 py-12 sm:py-16">
          <div className="lg:col-span-7">
            {badge && <p className="eyebrow text-[#4FD07A] mb-4">{badge}</p>}
            <h2 className="text-3xl sm:text-4xl md:text-[44px] text-white mb-4">{title}</h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">{subtitle}</p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end flex-wrap gap-3">
            {buttons.map((btn, idx) => renderButton(btn, idx))}
          </div>
        </div>
      </section>
    </div>
  );
}
