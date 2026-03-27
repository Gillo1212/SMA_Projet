import { useState } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import EntrepriseSettings from './components/EntrepriseSettings';
import EmailSettings from './components/EmailSettings';
import NotificationsSettings from './components/NotificationsSettings';
import SecuritySettings from './components/SecuritySettings';
import AdminsSettings from './components/AdminsSettings';

type Tab = 'entreprise' | 'email' | 'notifications' | 'securite' | 'admins';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'entreprise', label: 'Entreprise', icon: 'ri-building-line' },
  { id: 'email', label: 'Email & SMTP', icon: 'ri-mail-settings-line' },
  { id: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
  { id: 'securite', label: 'Sécurité', icon: 'ri-lock-line' },
  { id: 'admins', label: 'Administrateurs', icon: 'ri-shield-user-line' },
];

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<Tab>('entreprise');
  const { settings, admins, isLoading, updateSettings, createAdmin, toggleAdmin, deleteAdmin } = useSettings();

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
