import { useState } from 'react';
import { clientInvoices, ClientInvoice } from '../../../mocks/clientPortal';
import { generateInvoicePDF } from '../../../utils/generatePDF';

const statusColors: Record<string, string> = {
  'Payée': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'En retard': 'bg-red-50 text-red-700 border-red-200',
};

const typeColors: Record<string, string> = {
  'Commande': 'text-sky-600 bg-sky-50',
  'Location': 'text-indigo-600 bg-indigo-50',
  'Maintenance': 'text-amber-600 bg-amber-50',
};

export default function ClientFacturesPage() {
  const [filter, setFilter] = useState('Tous');
  const [downloading, setDownloading] = useState<string | null>(null);
  const filters = ['Tous', 'Payée', 'En attente', 'En retard'];
  const filtered = filter === 'Tous' ? clientInvoices : clientInvoices.filter(i => i.statut === filter);
  const totalDu = clientInvoices.filter(i => i.statut !== 'Payée').reduce((s, i) => s + i.montant, 0);
  const totalPaye = clientInvoices.filter(i => i.statut === 'Payée').reduce((s, i) => s + i.montant, 0);

  async function handleDownload(inv: ClientInvoice) {
    setDownloading(inv.id);
    await new Promise(r => setTimeout(r, 300));
    generateInvoicePDF({
      numero: inv.numero,
      date: inv.date,
      description: inv.description,
      type: inv.type,
      montant: inv.montant,
      statut: inv.statut,
      clientName: 'Amadou Traoré',
      clientEmail: 'amadou@sonatel.sn',
      clientCompany: 'Sonatel Orange Sénégal',
    });
    setDownloading(null);
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Factures réglées', value: `${(totalPaye / 1000000).toFixed(2)}M FCFA`, count: clientInvoices.filter(i => i.statut === 'Payée').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'ri-checkbox-circle-line' },
          { label: 'En attente de paiement', value: `${totalDu.toLocaleString('fr-FR')} FCFA`, count: clientInvoices.filter(i => i.statut === 'En attente').length, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'ri-time-line' },
          { label: 'En retard', value: `${clientInvoices.filter(i => i.statut === 'En retard').reduce((s, i) => s + i.montant, 0).toLocaleString('fr-FR')} FCFA`, count: clientInvoices.filter(i => i.statut === 'En retard').length, color: 'text-red-600', bg: 'bg-red-50', icon: 'ri-alert-line' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-xl`}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.count} facture(s) · {s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${filter === f ? 'bg-[#1AAA3F] text-white' : 'bg-gray-100 text-[#00272B]/60 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50/60">
              <tr>
                {['N° Facture', 'Date', 'Description', 'Type', 'Montant', 'Statut', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv: ClientInvoice) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-[#00272B]">{inv.numero}</p></td>
                  <td className="px-5 py-4"><p className="text-sm text-[#00272B]/60">{new Date(inv.date).toLocaleDateString('fr-FR')}</p></td>
                  <td className="px-5 py-4"><p className="text-sm text-[#00272B]/70 max-w-xs truncate">{inv.description}</p></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${typeColors[inv.type]}`}>{inv.type}</span>
                  </td>
                  <td className="px-5 py-4"><p className="text-sm font-bold text-[#00272B]">{inv.montant.toLocaleString('fr-FR')} F</p></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[inv.statut]}`}>{inv.statut}</span>
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
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
