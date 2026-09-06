import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
  onMarkRead: (id: string) => void;
}

const TYPE_CONFIG = {
  today: { emoji: '🔴', label: '今日', color: '#FEE2E2', textColor: '#DC2626' },
  tomorrow: { emoji: '🟠', label: '明日', color: '#FEF3C7', textColor: '#D97706' },
  '3days': { emoji: '🟡', label: '3日以内', color: '#FDECEA', textColor: '#C8847A' },
  overdue: { emoji: '⚫', label: '期限切れ', color: '#F3F4F6', textColor: '#6B7280' },
};

export default function NotificationsScreen({
  notifications,
  navigate,
  goBack,
  onMarkRead,
}: Props) {
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  function handleClick(n: AppNotification) {
    onMarkRead(n.id);
    navigate({ name: 'print-detail', printId: n.printId });
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm font-bold mb-3 active:scale-95"
          style={{ color: '#C8847A' }}
        >
          ‹ 戻る
        </button>
        <h1 className="text-2xl font-extrabold" style={{ color: '#3F3939' }}>
          通知
        </h1>
        {unread.length > 0 && (
          <p className="text-sm mt-1" style={{ color: '#8B8383' }}>
            未読 {unread.length}件
          </p>
        )}
      </div>

      <div className="px-5 space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-bold" style={{ color: '#3F3939' }}>
              通知はありません
            </p>
            <p className="text-sm mt-1" style={{ color: '#8B8383' }}>
              提出期限が近づくと通知が届きます
            </p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <p className="text-xs font-bold" style={{ color: '#8B8383' }}>
                  未読
                </p>
                {unread.map((n) => (
                  <NotifCard key={n.id} notification={n} onClick={() => handleClick(n)} />
                ))}
              </>
            )}
            {read.length > 0 && (
              <>
                <p className="text-xs font-bold mt-4" style={{ color: '#8B8383' }}>
                  既読
                </p>
                {read.map((n) => (
                  <NotifCard key={n.id} notification={n} onClick={() => handleClick(n)} unread={false} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NotifCard({
  notification: n,
  onClick,
  unread = true,
}: {
  notification: AppNotification;
  onClick: () => void;
  unread?: boolean;
}) {
  const cfg = TYPE_CONFIG[n.type];
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 text-left active:scale-95 transition-all"
      style={{ opacity: unread ? 1 : 0.65 }}
    >
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
        style={{ backgroundColor: cfg.color }}
      >
        {cfg.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-extrabold text-sm truncate" style={{ color: '#3F3939' }}>
            {n.printTitle}
          </p>
          {!n.isRead && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#C8847A' }}
            />
          )}
        </div>
        <p className="text-xs font-semibold" style={{ color: '#8B8383' }}>
          {n.subject} · {n.message}
        </p>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.color, color: cfg.textColor }}
      >
        {cfg.label}
      </span>
    </button>
  );
}
