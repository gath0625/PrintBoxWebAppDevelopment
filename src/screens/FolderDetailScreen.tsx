import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folderId: string;
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

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}提出`;
}

type SortType = 'newest' | 'oldest' | 'due-soon' | 'title';
type FilterTab = 'all' | 'pending' | 'submitted';

export default function FolderDetailScreen({
  folderId,
  folders,
  prints,
  navigate,
  goBack,
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [activeTab, setActiveTab] = useState<FilterTab>('all'); // タブ用のステート

  const folder = folders.find((f) => f.id === folderId);
  const folderPrints = prints.filter((p) => p.folderId === folderId);

  // ステータス（タブ）による絞り込み
  const filteredPrints = folderPrints.filter((p) => {
    const days = p.dueDate ? daysUntil(p.dueDate) : null;
    const isOverdue = p.status === 'overdue' || (days !== null && days < 0);
    
    if (activeTab === 'pending') {
      return p.status === 'pending' && !isOverdue;
    }
    if (activeTab === 'submitted') {
      return p.status === 'submitted';
    }
    return true; // 'all' の場合はすべて
  });

  // 並び替え処理
  const sortedPrints = [...filteredPrints].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'due-soon') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'ja');
    }
    return 0;
  });

  if (!folder) return null;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm font-bold mb-3 active:scale-95 transition-all"
          style={{ color: '#C8847A' }}
        >
          ‹ 戻る
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: folder.color }}
          >
            {folder.icon}
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: '#3F3939' }}>
              {folder.name}
            </h1>
            <p className="text-xs" style={{ color: '#8B8383' }}>
              {folderPrints.length}件のプリント
            </p>
          </div>
        </div>

        {/* タブ切り替え（すべて / 未提出 / 提出済み） */}
        <div className="flex gap-2 mt-4 bg-white p-1 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'all' ? '#C8847A' : 'transparent',
              color: activeTab === 'all' ? '#fff' : '#8B8383',
            }}
          >
            すべて ({folderPrints.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'pending' ? '#C8847A' : 'transparent',
              color: activeTab === 'pending' ? '#fff' : '#8B8383',
            }}
          >
            未提出
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              backgroundColor: activeTab === 'submitted' ? '#C8847A' : 'transparent',
              color: activeTab === 'submitted' ? '#fff' : '#8B8383',
            }}
          >
            提出済み
          </button>
        </div>

        {/* ツールバー（並び替え ＆ 表示切替） */}
        <div className="flex items-center justify-between mt-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-2 rounded-xl border text-xs font-semibold outline-none bg-white"
            style={{ borderColor: '#F0EAE8', color: '#3F3939' }}
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="due-soon">期限が近い順</option>
            <option value="title">名前順 (タイトル)</option>
          </select>

          <div className="flex items-center gap-2 bg-white rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
              style={{
                backgroundColor: viewMode === 'grid' ? '#C8847A' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : '#8B8383',
              }}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
              style={{
                backgroundColor: viewMode === 'list' ? '#C8847A' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#8B8383',
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Prints */}
      <div className="px-5">
        {sortedPrints.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
            <p className="text-4xl mb-4">📄</p>
            <p className="font-bold mb-1" style={{ color: '#3F3939' }}>
              プリントがありません
            </p>
            <p className="text-sm mb-5" style={{ color: '#8B8383' }}>
              条件に一致するプリントはありません。
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {sortedPrints.map((print) => (
              <PrintGridCard
                key={print.id}
                print={print}
                onClick={() => navigate({ name: 'print-detail', printId: print.id })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedPrints.map((print) => (
              <PrintListCard
                key={print.id}
                print={print}
                onClick={() => navigate({ name: 'print-detail', printId: print.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrintGridCard({ print, onClick }: { print: Print; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden shadow-sm text-left active:scale-95 transition-all"
    >
      <div
        className="h-28 flex items-center justify-center text-4xl"
        style={{ backgroundColor: print.imageUrls[0] || '#F0D8D5' }}
      >
        {print.imageUrls[0]?.startsWith('#') ? '📄' : (
          <img src={print.imageUrls[0]} alt={print.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-xs leading-tight truncate" style={{ color: '#3F3939' }}>
          {print.title}
        </p>
        <StatusBadge status={print.status} dueDate={print.dueDate} />
        {print.dueDate && print.status === 'pending' && (
          <p className="text-[10px] mt-1 font-semibold" style={{ color: '#8B8383' }}>
            {fmtDate(print.dueDate)}
          </p>
        )}
      </div>
    </button>
  );
}

function PrintListCard({ print, onClick }: { print: Print; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left w-full active:scale-95 transition-all"
    >
      <div
        className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
        style={{ backgroundColor: print.imageUrls[0] || '#F0D8D5' }}
      >
        {print.imageUrls[0]?.startsWith('#') ? '📄' : (
          <img src={print.imageUrls[0]} alt={print.title} className="w-full h-full object-cover rounded-2xl" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: '#3F3939' }}>
          {print.title}
        </p>
        <StatusBadge status={print.status} dueDate={print.dueDate} />
        {print.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {print.tags.slice(0, 2).map((tag) => (
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
      {print.isFavorite && <span className="text-lg">⭐</span>}
    </button>
  );
}

function StatusBadge({ status, dueDate }: { status: string; dueDate?: string }) {
  const today = TODAY;
  const days = dueDate ? Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000) : null;

  if (status === 'submitted') {
    return (
      <span className="inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
        提出済み
      </span>
    );
  }
  if (status === 'overdue' || (days !== null && days < 0)) {
    return (
      <span className="inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
        期限切れ
      </span>
    );
  }
  if (days !== null && days <= 3) {
    return (
      <span className="inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#FDECEA', color: '#C8847A' }}>
        もうすぐ期限
      </span>
    );
  }
  return (
    <span className="inline-flex mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#F8F5F3', color: '#8B8383' }}>
      未提出
    </span>
  );
}