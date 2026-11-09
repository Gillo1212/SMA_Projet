import { useCallback, useEffect, useMemo, useState } from 'react';
import { newsletterService, type Subscriber, type SubscriberStatus } from '../../../services/newsletter.service';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';

type Filter = 'subscribed' | 'unsubscribed' | 'all';

const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminNewsletterPage() {
  const { user } = useAuthContext();
  const canDelete = user?.role === 'super_admin' || user?.role === 'admin';
  const { toasts, notify, dismiss } = useToasts();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('subscribed');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toDelete, setToDelete] = useState<Subscriber | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSubscribers(await newsletterService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Liste indisponible');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const subscribed = subscribers.filter(s => s.status === 'subscribed');
    return {
      subscribed: subscribed.length,
      unsubscribed: subscribers.length - subscribed.length,
      thisMonth: subscribed.filter(s => new Date(s.subscribedAt) >= monthStart).length,
    };
  }, [subscribers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter(s =>
      (filter === 'all' || s.status === filter) && (!q || s.email.toLowerCase().includes(q)));
  }, [subscribers, filter, search]);

  const setStatus = async (s: Subscriber, status: SubscriberStatus) => {
    setBusyId(s.id);
    try {
      const updated = await newsletterService.setStatus(s.id, status);
      setSubscribers(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      notify('success', status === 'subscribed' ? 'Adresse réinscrite' : 'Adresse désinscrite', s.email);
    } catch (err) {
      notify('error', 'Modification impossible', err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await newsletterService.remove(toDelete.id);
      setSubscribers(prev => prev.filter(x => x.id !== toDelete.id));
      notify('success', 'Adresse supprimée', toDelete.email);
      setToDelete(null);
    } catch (err) {
      notify('error', 'Suppression impossible', err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await newsletterService.downloadCsv('subscribed');
    } catch (err) {
      notify('error', 'Export impossible', err instanceof Error ? err.message : undefined);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <LoadingState label="Chargement des inscrits…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Inscrits', value: stats.subscribed, icon: 'ri-mail-check-line', color: 'text-[#1AAA3F]', bg: 'bg-[#1AAA3F]/10' },
          { label: 'Nouveaux ce mois-ci', value: stats.thisMonth, icon: 'ri-user-add-line', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Désinscrits', value: stats.unsubscribed, icon: 'ri-mail-close-line', color: 'text-gray-500', bg: 'bg-gray-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${s.icon} ${s.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-[#00272B]">{s.value}</p>
              <p className="text-xs text-[#00272B]/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
        <i className="ri-information-line text-sky-600 text-lg mt-0.5"></i>
        <p className="text-sm text-sky-900/80 leading-relaxed">
          Les visiteurs s'inscrivent depuis le bas de chaque page du site et reçoivent un email de bienvenue avec un lien de désinscription.
          Pour envoyer une newsletter, exportez la liste et importez-la dans un outil d'envoi (Brevo, Mailchimp…) :
          un envoi en masse depuis une messagerie classique est limité et risque d'être classé en spam.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#00272B]/30 text-sm"></i>
              <input
                type="search"
                placeholder="Rechercher une adresse…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Rechercher une adresse"
                className="w-full sm:w-64 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as Filter)}
              aria-label="Filtrer par statut"
              className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer"
            >
              <option value="subscribed">Inscrits</option>
              <option value="unsubscribed">Désinscrits</option>
              <option value="all">Tous</option>
            </select>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting || stats.subscribed === 0}
            className="h-9 px-4 rounded-lg bg-[#1AAA3F] text-white text-sm font-semibold hover:bg-[#158f35] disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <i className={`${exporting ? 'ri-loader-4-line animate-spin' : 'ri-download-2-line'} mr-1.5`}></i>
            Exporter les inscrits (CSV)
          </button>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon="ri-mail-send-line"
            title={subscribers.length === 0 ? 'Aucun inscrit pour le moment' : 'Aucune adresse dans cette vue'}
            description={subscribers.length === 0 ? 'Les inscriptions faites depuis le pied de page du site apparaîtront ici.' : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#00272B]/40 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 font-semibold">Adresse</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Langue</th>
                  <th className="px-5 py-3 font-semibold hidden sm:table-cell">Inscrit le</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-[#00272B] font-medium break-all">{s.email}</td>
                    <td className="px-5 py-3 text-[#00272B]/60 hidden md:table-cell uppercase">{s.locale ?? '-'}</td>
                    <td className="px-5 py-3 text-[#00272B]/60 hidden sm:table-cell whitespace-nowrap">{date(s.subscribedAt)}</td>
                    <td className="px-5 py-3">
                      {s.status === 'subscribed' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1AAA3F]/10 text-[#0D8C2E]">Inscrit</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500" title={s.unsubscribedAt ? `Le ${date(s.unsubscribedAt)}` : undefined}>Désinscrit</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {s.status === 'subscribed' ? (
                          <button type="button" onClick={() => setStatus(s, 'unsubscribed')} disabled={busyId === s.id}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-[#00272B]/60 hover:bg-gray-100 cursor-pointer disabled:opacity-50">
                            Désinscrire
                          </button>
                        ) : (
                          <button type="button" onClick={() => setStatus(s, 'subscribed')} disabled={busyId === s.id}
                            className="h-8 px-3 rounded-lg text-xs font-semibold text-[#1AAA3F] hover:bg-[#1AAA3F]/5 cursor-pointer disabled:opacity-50">
                            Réinscrire
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" onClick={() => setToDelete(s)} disabled={busyId === s.id}
                            aria-label={`Supprimer ${s.email}`} title="Supprimer définitivement"
                            className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cette adresse ?"
        message={`${toDelete?.email ?? ''} sera effacée définitivement (à faire sur demande de la personne). Pour simplement arrêter les envois, utilisez plutôt « Désinscrire ».`}
        confirmLabel="Supprimer"
        tone="danger"
        busy={busyId === toDelete?.id}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
