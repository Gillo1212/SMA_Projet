import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../../mocks/notifications';

interface NotificationsDropdownProps {
  notifications: AppNotification[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  order: { icon: 'ri-shopping-bag-3-line', color: 'text-[#1AAA3F]', bg: 'bg-[#EEFFF2]' },
  quote: { icon: 'ri-file-text-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  client: { icon: 'ri-user-add-line', color: 'text-[#1AAA3F]', bg: 'bg-[#EEFFF2]' },
  machine: { icon: 'ri-tools-line', color: 'text-orange-600', bg: 'bg-orange-50' },
  invoice: { icon: 'ri-bill-line', color: 'text-red-500', bg: 'bg-red-50' },
  support: { icon: 'ri-customer-service-2-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  system: { icon: 'ri-information-line', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function NotificationsDropdown({
  notifications,
  onMarkAllRead,
  onMarkRead,
}: NotificationsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [localNotifs, setLocalNotifs] = useState<AppNotification[]>(notifications);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = localNotifs.filter(n => !n.read).length;

  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = (id: string) => {
    setLocalNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    onMarkRead?.(id);
  };

  const handleMarkAllRead = () => {
    setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const handleNotifClick = (notif: AppNotification) => {
    handleMarkRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-[#00272B]/60 hover:bg-gray-50 cursor-pointer transition-colors"
        aria-label="Notifications"
      >
        <i className="ri-notification-3-line text-base"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#1AAA3F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl overflow-hidden z-50"
          style={{ boxShadow: '0 8px 32px rgba(0,39,43,0.12)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#00272B]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#1AAA3F]/10 text-[#1AAA3F] text-xs font-semibold rounded-full">
                  {unreadCount} nouvelles
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#1AAA3F] hover:underline cursor-pointer font-medium"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {localNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <i className="ri-notification-off-line text-gray-400 text-xl"></i>
                </div>
                <p className="text-sm text-[#00272B]/40 text-center">Aucune notification</p>
              </div>
            ) : (
              localNotifs.map(notif => {
                const cfg = typeConfig[notif.type] ?? typeConfig.system;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left border-b border-gray-50 last:border-b-0 ${
                      !notif.read ? 'bg-[#f7fffe]' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                      <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${!notif.read ? 'text-[#00272B]' : 'text-[#00272B]/70'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-[#1AAA3F] rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-xs text-[#00272B]/50 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-[#00272B]/30 mt-1">{notif.time}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {localNotifs.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-center text-[#00272B]/40">
                {localNotifs.filter(n => n.read).length} notification(s) déjà lue(s)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
