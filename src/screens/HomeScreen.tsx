import type { Folder, Print, AppNotification, Route } from '../types';
import { 
  Search, 
  Bell, 
  Camera, 
  Edit3, 
  Star, 
  Clock, 
  Folder as FolderIcon, 
  FileText 
} from 'lucide-react';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
  onNotificationClick: () => void;
  onSearchClick: () => void;
  onAddClick: () => void;
}

// 本日の日付を自動で取得する (YYYY-MM-DD形式)
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TODAY = toDateStr(new Date());

function daysUntil(dateStr: string): number {
  const today = new Date(TODAY);
  const due = new Date(dateStr);
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

function fmtShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function HomeScreen({
  folders,
  prints,
  notifications,
  navigate,
  onNotificationClick,
  onSearchClick,
  onAddClick,
}: Props) {
  const today = new Date(TODAY);

  // 今日を基準にして前後30日分の日付を生成（今日が左〜中央に見えるように調整）
  const daysRange = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    return d;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const upcomingPrints = prints
    .filter((p) => p.dueDate && p.status === 'pending')
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 4);

  const getFolderCount = (folderId: string) =>
    prints.filter((p) => p.folderId === folderId).length;

  const favoriteCount = prints.filter((p) => p.isFavorite).length;
  const pendingCount = prints.filter((p) => p.status === 'pending' && p.dueDate).length;

  // 現在の年月をカレンダーのタイトル用に取得
  const currentYearMonth = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold" style={{ color: '#3F3939' }}>
            ホーム
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={onSearchClick}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3F3939] active:scale-95 transition-all"
            >
              <Search size={18} />
            </button>
            <button
              onClick={onNotificationClick}
              className="relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3F3939] active:scale-95 transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#C8847A' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Calendar */}
      <div className="px-5 mb-5">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-bold mb-3" style={{ color: '#8B8383' }}>
            {currentYearMonth} カレンダー
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none">
            {daysRange.map((day, i) => {
              const ds = toDateStr(day);
              const isToday = ds === TODAY;
              const dayPrints = prints.filter((p) => p.dueDate === ds);
              
              // ドットの色分けロジック
              let dotColor = 'transparent';
              if (dayPrints.length > 0) {
                const hasUrgent = dayPrints.some(p => p.status === 'pending' && daysUntil(ds) <= 1);
                const hasPending = dayPrints.some(p => p.status === 'pending');
                const allSubmitted = dayPrints.every(p => p.status === 'submitted');

                if (hasUrgent) {
                  dotColor = '#EF4444'; // 期限間近（赤）
                } else if (hasPending) {
                  dotColor = '#C8847A'; // 通常の期限（テーマカラー）
                } else if (allSubmitted) {
                  dotColor = '#10B981'; // 提出済み（緑）
                }
              }

              const isSun = day.getDay() === 0;
              const isSat = day.getDay() === 6;

              return (
                <button
                  key={i}
                  onClick={() => navigate({ name: 'schedule' })}
                  className="flex flex-col items-center gap-1 flex-shrink-0 w-12 py-2 rounded-2xl transition-all active:scale-95 hover:bg-[#F8F5F3]"
                  style={{
                    backgroundColor: isToday ? '#F8F5F3' : 'transparent',
                    border: isToday ? '1px solid #C8847A' : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color: isSun ? '#F87171' : isSat ? '#60A5FA' : '#8B8383',
                    }}
                  >
                    {DAY_LABELS[day.getDay()]}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      backgroundColor: isToday ? '#C8847A' : 'transparent',
                      color: isToday ? '#FFFFFF' : '#3F3939',
                    }}
                  >
                    {day.getDate()}
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: dotColor,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-extrabold mb-3" style={{ color: '#3F3939' }}>
          クイックアクション
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Camera size={20} className="text-[#C8847A]" />, label: '撮影', action: onAddClick },
            { icon: <Edit3 size={20} className="text-[#C8847A]" />, label: '作成', action: onAddClick },
            {
              icon: <Star size={20} className="text-[#EAB308]" />,
              label: `お気に入り (${favoriteCount})`,
              action: () => navigate({ name: 'search' }),
            },
            {
              icon: <Clock size={20} className="text-[#EF4444]" />,
              label: `期限 (${pendingCount})`,
              action: () => navigate({ name: 'schedule' }),
            },
          ].map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-3 shadow-sm active:scale-95 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#F8F5F3] flex items-center justify-center">
                {icon}
              </div>
              <span
                className="text-[9px] font-bold text-center leading-tight"
                style={{ color: '#8B8383' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Folders */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold" style={{ color: '#3F3939' }}>
            フォルダ
          </h2>
          <button
            onClick={() => navigate({ name: 'folders' })}
            className="text-xs font-bold"
            style={{ color: '#C8847A' }}
          >
            すべて見る
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {folders.slice(0, 4).map((folder) => (
            <button
              key={folder.id}
              onClick={() => navigate({ name: 'folder-detail', folderId: folder.id })}
              className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-all"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm"
                style={{ backgroundColor: folder.color }}
              >
                <FolderIcon size={20} className="text-white drop-shadow-sm" />
              </div>
              <p className="font-extrabold text-sm" style={{ color: '#3F3939' }}>
                {folder.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                {getFolderCount(folder.id)}件
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="px-5">
        <h2 className="text-sm font-extrabold mb-3" style={{ color: '#3F3939' }}>
          期限が近いプリント
        </h2>
        {upcomingPrints.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
            <p className="text-sm" style={{ color: '#8B8383' }}>
              期限が近いプリントはありません
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingPrints.map((print) => {
              const days = daysUntil(print.dueDate!);
              const folder = folders.find((f) => f.id === print.folderId);
              const urgentColor =
                days <= 0 ? '#EF4444' : days <= 1 ? '#EF4444' : days <= 3 ? '#C8847A' : '#8B8383';
              const urgentLabel =
                days < 0 ? '期限切れ' : days === 0 ? '今日' : days === 1 ? '明日' : `あと${days}日`;
              return (
                <button
                  key={print.id}
                  onClick={() => navigate({ name: 'print-detail', printId: print.id })}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left w-full active:scale-95 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-[#C8847A]"
                    style={{ backgroundColor: '#F8F5F3' }}
                  >
                    <FileText size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: '#3F3939' }}
                    >
                      {print.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                      {folder?.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs" style={{ color: '#8B8383' }}>
                      {fmtShort(print.dueDate!)}
                    </p>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: urgentColor }}
                    >
                      {urgentLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}