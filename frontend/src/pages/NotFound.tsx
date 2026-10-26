import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen text-center px-4 bg-white overflow-hidden">
      <p className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-50 select-none pointer-events-none z-0">
        404
      </p>
      <div className="relative z-10">
        <Link to="/">
          <img src="/images/brand/logo-corporate.png" alt="SMALIM" className="h-12 w-auto mx-auto mb-10" />
        </Link>
        <h1 className="text-3xl md:text-4xl text-[#00272B]">{t('notFound.title')}</h1>
        <p className="mt-3 text-base text-[#00272B]/60">{t('notFound.hint')}</p>
        <p className="mt-2 text-sm text-gray-400 font-mono break-all">{location.pathname}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1AAA3F] text-white text-sm font-semibold rounded-md hover:bg-[#158f35] transition-colors"
          >
            <i className="ri-home-4-line"></i>
            {t('notFound.home')}
          </Link>
          <Link
            to="/machines"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#00272B]/20 text-[#00272B] text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors"
          >
            {t('notFound.catalog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
