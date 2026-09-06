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

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000);
}

export default function SearchScreen({ folders, prints, navigate, goBack }: Props) {
  const [query, setQuery] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'overdue'>('all');

  const results = prints.filter((p) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      (p.memo ?? '').toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchFav = !filterFavorite || p.isFavorite;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchQuery && matchFav && matchStatus;
  });

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
        <h1 className="text-2xl font-extrabold mb-3" style={{ color: '#3F3939' }}>
          検索
        </h1>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル、科目、メモ、タグで検索..."
            autoFocus
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-semibold outline-none"
            style={{ borderColor: '#F0EAE8', backgroundColor: '#FFFFFF', color: '#3F3939' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
              style={{ color: '#8B8383' }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { label: 'すべて', value: 'all' as const },
          { label: '未提出', value: 'pending' as const },
          { label: '提出済み', value: 'submitted' as const },
          { label: '期限切れ', value: 'overdue' as const },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: filterStatus === value ? '#C8847A' : '#FFFFFF',
              color: filterStatus === value ? '#FFFFFF' : '#8B8383',
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setFilterFavorite(!filterFavorite)}
          className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
          style={{
            backgroundColor: filterFavorite ? '#C8847A' : '#FFFFFF',
            color: filterFavorite ? '#FFFFFF' : '#8B8383',
          }}
        >
          ⭐ お気に入り
        </button>
      </div>

      {/* Results */}
      <div className="px-5">
        {query || filterFavorite || filterStatus !== 'all' ? (
          <>
            <p className="text-xs font-bold mb-3" style={{ color: '#8B8383' }}>
              {results.length}件の結果
            </p>
            {results.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
                <p className="text-3xl mb-3">🔎</p>
                <p className="font-bold" style={{ color: '#3F3939' }}>
                  見つかりませんでした
                </p>
                <p className="text-sm mt-1" style={{ color: '#8B8383' }}>
                  別のキーワードで試してみてください
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map((print) => {
                  const folder = folders.find((f) => f.id === print.folderId);
                  const days = print.dueDate ? daysUntil(print.dueDate) : null;
                  return (
                    <button
                      key={print.id}
                      onClick={() => navigate({ name: 'print-detail', printId: print.id })}
                      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left w-full active:scale-95 transition-all"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: print.imageUrls[0] || '#F0D8D5' }}
                      >
                        {print.imageUrls[0]?.startsWith('#') ? '📄' : (
                          <img src={print.imageUrls[0]} alt="" className="w-full h-full object-cover rounded-2xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: '#3F3939' }}>
                          {highlight(print.title, query)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                          {folder?.icon} {folder?.name}
                          {print.dueDate && days !== null && (
                            <span
                              className="ml-2 font-bold"
                              style={{ color: days < 0 ? '#DC2626' : days <= 3 ? '#C8847A' : '#8B8383' }}
                            >
                              {days < 0 ? '期限切れ' : days === 0 ? '今日' : `あと${days}日`}
                            </span>
                          )}
                        </p>
                        {print.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {print.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ backgroundColor: '#F0D8D5', color: '#C8847A' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {print.isFavorite && <span className="text-base">⭐</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recent / suggestions */}
            <p className="text-xs font-bold mb-3" style={{ color: '#8B8383' }}>
              最近追加されたプリント
            </p>
            <div className="flex flex-col gap-3">
              {prints.slice(0, 5).map((print) => {
                const folder = folders.find((f) => f.id === print.folderId);
                return (
                  <button
                    key={print.id}
                    onClick={() => navigate({ name: 'print-detail', printId: print.id })}
                    className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left w-full active:scale-95 transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                      style={{ backgroundColor: print.imageUrls[0] || '#F0D8D5' }}
                    >
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: '#3F3939' }}>
                        {print.title}
                      </p>
                      <p className="text-xs" style={{ color: '#8B8383' }}>
                        {folder?.icon} {folder?.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ backgroundColor: '#F0D8D5', color: '#C8847A', borderRadius: '4px', padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
