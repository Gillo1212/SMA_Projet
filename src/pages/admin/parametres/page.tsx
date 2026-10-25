import { useState } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import EntrepriseSettings from './components/EntrepriseSettings';
import CommerceSettings from './components/CommerceSettings';
import PromoCodesSettings from './components/PromoCodesSettings';
import EmailSettings from './components/EmailSettings';
import NotificationsSettings from './components/NotificationsSettings';
import SecuritySettings from './components/SecuritySettings';
import AdminsSettings from './components/AdminsSettings';

type Tab = 'entreprise' | 'commerce' | 'promo' | 'email' | 'notifications' | 'securite' | 'admins';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'entreprise', label: 'Entreprise', icon: 'ri-building-line' },
  { id: 'commerce', label: 'TVA & livraison', icon: 'ri-truck-line' },
  { id: 'promo', label: 'Codes promo', icon: 'ri-coupon-3-line' },
  { id: 'email', label: 'Email & SMTP', icon: 'ri-mail-settings-line' },
  { id: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
  { id: 'securite', label: 'Sécurité', icon: 'ri-lock-line' },
  { id: 'admins', label: 'Administrateurs', icon: 'ri-shield-user-line' },
];

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<Tab>('entreprise');
  const { settings, admins, isLoading, error, refetch, updateSettings, createAdmin, toggleAdmin, deleteAdmin } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line text-3xl text-[#1AAA3F] animate-spin"></i>
          <p className="text-sm text-[#00272B]/50">Chargement des paramètres…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
        <i className="ri-error-warning-line text-red-500 text-xl"></i>
        <div>
          <p className="text-sm font-semibold text-red-700">Impossible de charger les paramètres</p>
          <p className="text-xs text-red-600/80 mt-0.5">{error}</p>
          <button onClick={refetch} className="mt-3 text-xs font-semibold text-red-700 underline cursor-pointer">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#00272B] text-white'
                : 'text-[#00272B]/55 hover:text-[#00272B] hover:bg-gray-50'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${tab.icon} text-base`}></i>
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'entreprise' && (
          <EntrepriseSettings settings={settings} onSave={updateSettings} />
        )}
        {activeTab === 'commerce' && (
          <CommerceSettings settings={settings} onSave={updateSettings} />
        )}
        {activeTab === 'promo' && <PromoCodesSettings />}
        {activeTab === 'email' && (
          <EmailSettings settings={settings} onSave={updateSettings} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsSettings settings={settings} onSave={updateSettings} />
        )}
        {activeTab === 'securite' && (
          <SecuritySettings />
        )}
        {activeTab === 'admins' && (
          <AdminsSettings
            admins={admins}
            onCreateAdmin={createAdmin}
            onToggleAdmin={toggleAdmin}
            onDeleteAdmin={deleteAdmin}
          />
        )}
      </div>
    </div>
  );
}
