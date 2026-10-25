import { useClientMachines } from '../../../hooks/useClientPortal';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../../../i18n/useStatusLabels';

const statusColors: Record<string, { dot: string; badge: string }> = {
  'Opérationnelle': { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Maintenance': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Hors service': { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
};

export default function ClientMachinesPage() {
  const { t, i18n } = useTranslation();
  const status = useStatusLabels();
  const { machines, isLoading, error, refetch } = useClientMachines();

  if (isLoading) return <LoadingState label={t('clientPortal.machines.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const operational = machines.filter(m => m.statut === 'Opérationnelle').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('clientPortal.machines.installed'), value: machines.length, icon: 'ri-settings-2-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: t('clientPortal.machines.operational'), value: operational, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('clientPortal.machines.totalSales'), value: machines.reduce((s, m) => s + m.totalVentes, 0).toLocaleString('fr-FR'), icon: 'ri-bar-chart-line', color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-xl`}></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Machines */}
      {machines.length === 0 ? (
        <EmptyState
          icon="ri-settings-2-line"
          title={t('clientPortal.machines.emptyTitle')}
          description={t('clientPortal.machines.emptyHint')}
        />
      ) : (
      <div className="grid xl:grid-cols-3 gap-5">
        {machines.map(machine => {
          const sc = statusColors[machine.statut];
          const maintenanceDate = machine.prochaineMaintenance ? new Date(machine.prochaineMaintenance) : null;
          const daysLeft = maintenanceDate
            ? Math.ceil((maintenanceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          const maintenanceProche = daysLeft !== null && daysLeft <= 7;

          return (
            <div key={machine.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Image */}
              <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                {machine.image ? (
                  <img src={machine.image} alt={machine.nom} className="w-full h-full object-cover object-top" />
                ) : (
                  <i className="ri-image-line text-4xl text-[#00272B]/15"></i>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${sc.badge}`}>
                    <div className={`w-1.5 h-1.5 ${sc.dot} rounded-full`}></div>
                    {status.machine(machine.statut)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-[#00272B] mb-0.5">{machine.nom}</h3>
                <p className="text-xs text-[#00272B]/50 mb-1">{machine.type}</p>
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-map-pin-line text-[#00272B]/35 text-xs"></i>
                  </div>
                  <p className="text-xs text-[#00272B]/50">{machine.site}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-[#00272B]/40 mb-0.5">{t('clientPortal.machines.sales')}</p>
                    <p className="text-sm font-bold text-[#00272B]">{machine.totalVentes.toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-[#00272B]/40 mb-0.5">{t('clientPortal.machines.serialNumber')}</p>
                    <p className="text-sm font-bold text-[#00272B] truncate">{machine.numeroSerie ?? '-'}</p>
                  </div>
                </div>

                <div className={`mt-3 p-3 rounded-xl border ${maintenanceProche ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`ri-tools-line text-xs ${maintenanceProche ? 'text-amber-600' : 'text-[#00272B]/40'}`}></i>
                    </div>
                    <p className={`text-xs font-medium ${maintenanceProche ? 'text-amber-700' : 'text-[#00272B]/50'}`}>
                      {maintenanceDate
                        ? t('clientPortal.machines.nextMaintenance', { date: maintenanceDate.toLocaleDateString(i18n.language) })
                        : t('clientPortal.machines.noMaintenance')}
                      {maintenanceProche && daysLeft !== null && (
                        <span className="ml-1">
                          {daysLeft < 0 ? t('clientPortal.machines.overdue') : t('clientPortal.machines.inDays', { count: daysLeft })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {machine.dateInstallation && (
                  <div className="mt-3 text-xs text-[#00272B]/30">
                    {t('clientPortal.machines.installedOn', { date: new Date(machine.dateInstallation).toLocaleDateString(i18n.language) })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
