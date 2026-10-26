import { useState } from 'react';
import { useClientInvoices } from '../../../hooks/useClientPortal';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import { generateInvoicePDF } from '../../../utils/generatePDF';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../../../i18n/useStatusLabels';
import type { Invoice } from '../../../types/models';

const statusColors: Record<string, string> = {
  'Payée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'En retard': 'bg-red-50 text-red-700 border-red-200',
  'Brouillon': 'bg-gray-50 text-gray-600 border-gray-200',
  'Annulée': 'bg-gray-50 text-gray-500 border-gray-200',
};

const typeColors: Record<string, string> = {
  'Facture': 'text-sky-600 bg-sky-50',
  'Avoir': 'text-indigo-600 bg-indigo-50',
  'Proforma': 'text-amber-600 bg-amber-50',
};

const ALL = 'all';

export default function ClientFacturesPage() {
  const { t } = useTranslation();
  const status = useStatusLabels();
  const { invoices, isLoading, error, refetch } = useClientInvoices();
  const { client } = useClientAuth();
  const [filter, setFilter] = useState(ALL);
  const [downloading, setDownloading] = useState<string | null>(null);

  if (isLoading) return <LoadingState label={t('clientPortal.invoices.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filters = [ALL, 'Payée', 'En attente', 'En retard'];
  const filtered = filter === ALL ? invoices : invoices.filter(i => i.statut === filter);
  const totalDu = invoices
    .filter(i => i.statut === 'En attente' || i.statut === 'En retard')
    .reduce((s, i) => s + i.montant, 0);
  const totalPaye = invoices.filter(i => i.statut === 'Payée').reduce((s, i) => s + i.montant, 0);

  async function handleDownload(inv: Invoice) {
    setDownloading(inv.id);
    try {
      generateInvoicePDF({
        numero: inv.numero,
        date: inv.date,
        description: inv.description,
        type: inv.type,
        montant: inv.montant,
        montantHT: inv.montantHT,
        tauxTVA: inv.tauxTVA,
        statut: inv.statut,
        clientName: `${client?.prenom ?? ''} ${client?.nom ?? ''}`.trim(),
        clientEmail: client?.email ?? '',
        clientCompany: client?.entreprise ?? '',
      });
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: t('clientPortal.invoices.paid'), value: `${totalPaye.toLocaleString('fr-FR')} FCFA`, count: invoices.filter(i => i.statut === 'Payée').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'ri-checkbox-circle-line' },
          { label: t('clientPortal.invoices.awaitingPayment'), value: `${totalDu.toLocaleString('fr-FR')} FCFA`, count: invoices.filter(i => i.statut === 'En attente').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'ri-time-line' },
          { label: t('clientPortal.invoices.overdue'), value: `${invoices.filter(i => i.statut === 'En retard').reduce((s, i) => s + i.montant, 0).toLocaleString('fr-FR')} FCFA`, count: invoices.filter(i => i.statut === 'En retard').length, color: 'text-red-600', bg: 'bg-red-50', icon: 'ri-alert-line' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-xl`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[#00272B] truncate">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{t('clientPortal.invoices.countLabel', { count: s.count, label: s.label })}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]" role="tablist">
            {filters.map(f => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`px-3 h-8 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${filter === f ? 'bg-[#00272B] text-white' : 'bg-gray-50 text-[#00272B]/60 hover:bg-gray-100'}`}>{f === ALL ? t('clientPortal.common.all') : status.invoice(f)}</button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-bill-line"
            title={invoices.length === 0 ? t('clientPortal.invoices.emptyTitle') : t('clientPortal.invoices.noResultTitle')}
            description={
              invoices.length === 0
                ? t('clientPortal.invoices.emptyHint')
                : t('clientPortal.invoices.noResultHint')
            }
          />
        ) : (
        <>
        {/* Mobile : cartes */}
        <ul className="md:hidden divide-y divide-gray-50">
          {filtered.map((inv: Invoice) => (
            <li key={inv.id} className="px-4 py-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[#00272B]">{inv.numero}</p>
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${typeColors[inv.type]}`}>{status.invoiceType(inv.type)}</span>
                </div>
                <p className="text-xs text-[#00272B]/45 truncate mt-0.5">{inv.date} · {inv.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[inv.statut]}`}>{status.invoice(inv.statut)}</span>
                  <span className="text-sm font-bold text-[#00272B]">{inv.montant.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(inv)}
                disabled={downloading === inv.id}
                aria-label={`${t('clientPortal.invoices.pdf')} ${inv.numero}`}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-[#1AAA3F] hover:bg-[#1AAA3F]/5 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <i className={downloading === inv.id ? 'ri-loader-4-line animate-spin' : 'ri-download-2-line'}></i>
              </button>
            </li>
          ))}
        </ul>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50/60">
              <tr>
                {['colNumber', 'colDate', 'colDescription', 'colType', 'colAmount', 'colStatus', ''].map(h => (
                  <th key={h || 'actions'} className="px-5 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h && t(`clientPortal.invoices.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-[#00272B]">{inv.numero}</p></td>
                  <td className="px-5 py-4"><p className="text-sm text-[#00272B]/60">{inv.date}</p></td>
                  <td className="px-5 py-4"><p className="text-sm text-[#00272B]/70 max-w-xs truncate">{inv.description}</p></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${typeColors[inv.type]}`}>{status.invoiceType(inv.type)}</span>
                  </td>
                  <td className="px-5 py-4"><p className="text-sm font-bold text-[#00272B]">{inv.montant.toLocaleString('fr-FR')} F</p></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[inv.statut]}`}>{status.invoice(inv.statut)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDownload(inv)}
                      disabled={downloading === inv.id}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#1AAA3F] hover:underline cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {downloading === inv.id ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-download-line"></i>
                      )}
                      {t('clientPortal.invoices.pdf')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
