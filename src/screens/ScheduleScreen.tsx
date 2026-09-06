import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
}

const TODAY = '2026-09-05';
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000);
}

export default function ScheduleScreen({ folders, prints, navigate }: Props) {
  const todayDate = new Date(TODAY);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startPad = firstDay.getDay();
  const totalCells = startPad + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  const deadlineDates = new Set(
    prints.filter((p) => p.dueDate && p.status !== 'submitted').map((p) => p.dueDate!)
  );

  const selectedPrints = prints.filter(
    (p) => p.dueDate === selectedDate && p.status !== 'submitted'
  );

  function fmtShort(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <p className="text-sm font-semibold mb-1" style={{ color: '#8B8383' }}>
          期限を確認する
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#3F3939' }}>
          予定
        </h1>
      </div>

      {/* Calendar */}
      <div className="mx-5 bg-white rounded-3xl p-4 shadow-sm mb-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-95 transition-all" style={{ backgroundColor: '#F8F5F3' }}>
            ‹
          </button>
          <p className="font-extrabold" style={{ color: '#3F3939' }}>
            {viewYear}年{viewMonth + 1}月
          </p>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-95 transition-all" style={{ backgroundColor: '#F8F5F3' }}>
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="text-center text-[11px] font-bold py-1"
              style={{ color: i === 0 ? '#F87171' : i === 6 ? '#60A5FA' : '#8B8383' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: rows * 7 }, (_, i) => {
            const dayNum = i - startPad + 1;
            if (dayNum < 1 || dayNum > lastDay.getDate()) {
              return <div key={i} />;
            }
            const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = ds === TODAY;
            const isSelected = ds === selectedDate;
            const hasDeadline = deadlineDates.has(ds);
            const col = i % 7;
            const isSun = col === 0;
            const isSat = col === 6;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <button
                  onClick={() => setSelectedDate(ds)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: isSelected ? '#C8847A' : isToday ? '#F0D8D5' : 'transparent',
                    color: isSelected ? '#fff' : isSun ? '#F87171' : isSat ? '#60A5FA' : '#3F3939',
                  }}
                >
                  {dayNum}
                </button>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: hasDeadline ? '#C8847A' : 'transparent' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day prints */}
      <div className="px-5">
        <h2 className="text-sm font-extrabold mb-3" style={{ color: '#3F3939' }}>
          {fmtShort(selectedDate)} の提出物
        </h2>
        {selectedPrints.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-sm font-semibold" style={{ color: '#8B8383' }}>
              この日の提出物はありません
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedPrints.map((print) => {
              const folder = folders.find((f) => f.id === print.folderId);
              const days = daysUntil(print.dueDate!);
              return (
                <button
                  key={print.id}
                  onClick={() => navigate({ name: 'print-detail', printId: print.id })}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left w-full active:scale-95 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                    style={{ backgroundColor: print.imageUrls[0] || '#F0D8D5' }}
                  >
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: '#3F3939' }}>
                      {print.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                      {folder?.icon} {folder?.name}
                    </p>
                  </div>
                  <div
                    className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: days < 0 ? '#FEE2E2' : days <= 1 ? '#FDECEA' : '#F8F5F3',
                      color: days < 0 ? '#DC2626' : days <= 1 ? '#C8847A' : '#8B8383',
                    }}
                  >
                    {days < 0 ? '期限切れ' : days === 0 ? '今日' : days === 1 ? '明日' : `あと${days}日`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming deadlines summary */}
      <div className="px-5 mt-5">
        <h2 className="text-sm font-extrabold mb-3" style={{ color: '#3F3939' }}>
          今後の期限
        </h2>
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          {prints
            .filter((p) => p.dueDate && p.status === 'pending')
            .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
            .slice(0, 5)
            .map((print) => {
              const folder = folders.find((f) => f.id === print.folderId);
              const days = daysUntil(print.dueDate!);
              const d = new Date(print.dueDate!);
              return (
                <button
                  key={print.id}
                  onClick={() => navigate({ name: 'print-detail', printId: print.id })}
                  className="flex items-center gap-3 py-3 border-b last:border-b-0 w-full text-left active:opacity-70 transition-all"
                  style={{ borderColor: '#F8F5F3' }}
                >
                  <div className="w-10 text-center">
                    <p className="text-lg font-extrabold leading-none" style={{ color: '#C8847A' }}>
                      {d.getDate()}
                    </p>
                    <p className="text-[10px] font-bold" style={{ color: '#8B8383' }}>
                      {d.getMonth() + 1}月
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: '#3F3939' }}>
                      {print.title}
                    </p>
                    <p className="text-xs" style={{ color: '#8B8383' }}>
                      {folder?.icon} {folder?.name}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: days <= 3 ? '#C8847A' : '#8B8383' }}
                  >
                    {days < 0 ? '超過' : days === 0 ? '今日' : `あと${days}日`}
                  </span>
                </button>
              );
            })}
          {prints.filter((p) => p.dueDate && p.status === 'pending').length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: '#8B8383' }}>
              期限のあるプリントはありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
