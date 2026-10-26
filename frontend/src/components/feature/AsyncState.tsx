import { useTranslation } from 'react-i18next';

/**
 * États de chargement / erreur / vide
 * ────────────────────────────────────
 * Utilisés par les pages branchées sur les hooks de données, pour éviter de
 * redéfinir le même bloc dans chaque page.
 *
 *   if (isLoading) return <LoadingState label="Chargement des commandes…" />;
 *   if (error)     return <ErrorState message={error} onRetry={refetch} />;
 */

interface LoadingStateProps {
  label?: string;
  /** Hauteur réduite pour un usage dans une carte plutôt qu'en pleine page */
  compact?: boolean;
}

export function LoadingState({ label, compact = false }: LoadingStateProps) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center justify-center ${compact ? 'h-32' : 'h-64'}`}>
      <div className="flex flex-col items-center gap-3">
        <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
        <p className="text-sm text-[#00272B]/50">{label ?? t('common.loading')}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center justify-center ${compact ? 'h-32' : 'h-64'}`}>
      <div className="flex flex-col items-center gap-3 text-center max-w-sm px-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <i className="ri-error-warning-line text-2xl text-red-500"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#00272B]">{t('common.loadError')}</p>
          <p className="text-sm text-[#00272B]/50 mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] transition-all cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-1.5"></i>
            {t('common.retry')}
          </button>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  compact?: boolean;
}

export function EmptyState({
  icon = 'ri-inbox-line',
  title,
  description,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center ${compact ? 'h-32' : 'h-64'}`}>
      <div className="flex flex-col items-center gap-2 text-center max-w-sm px-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
          <i className={`${icon} text-2xl text-[#00272B]/25`}></i>
        </div>
        <p className="text-sm font-semibold text-[#00272B]/70">{title}</p>
        {description && <p className="text-sm text-[#00272B]/40">{description}</p>}
      </div>
    </div>
  );
}
