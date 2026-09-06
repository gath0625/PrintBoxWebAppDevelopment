import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  printId: string;
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
  onUpdate: (print: Print) => void;
  onDelete: (id: string) => void;
}

const TODAY = '2026-09-05';

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000);
}

export default function PrintDetailScreen({
  printId,
  folders,
  prints,
  navigate,
  goBack,
  onUpdate,
  onDelete,
}: Props) {
  const print = prints.find((p) => p.id === printId);
  const [imgIdx, setImgIdx] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [editMemo, setEditMemo] = useState('');

  if (!print) return null;

  const folder = folders.find((f) => f.id === print.folderId);
  const days = print.dueDate ? daysUntil(print.dueDate) : null;

  function openEdit() {
    setEditTitle(print!.title);
    setEditFolderId(print!.folderId);
    setEditDueDate(print!.dueDate ?? '');
    setEditDueTime(print!.dueTime ?? '');
    setEditMemo(print!.memo ?? '');
    setShowEdit(true);
  }

  function saveEdit() {
    const updated: Print = {
      ...print!,
      title: editTitle.trim() || print!.title,
      folderId: editFolderId,
      subject: folders.find((f) => f.id === editFolderId)?.name ?? print!.subject,
      dueDate: editDueDate || undefined,
      dueTime: editDueTime || undefined,
      memo: editMemo.trim(),
    };
    onUpdate(updated);
    setShowEdit(false);
  }

  function toggleFavorite() {
    onUpdate({ ...print!, isFavorite: !print!.isFavorite });
  }

  function markSubmitted() {
    onUpdate({ ...print!, status: print!.status === 'submitted' ? 'pending' : 'submitted' });
  }

  function handleDelete() {
    if (confirm('このプリントを削除しますか？')) {
      onDelete(print!.id);
    }
  }

  const statusLabel =
    print.status === 'submitted'
      ? '提出済み'
      : print.status === 'overdue' || (days !== null && days! < 0)
      ? '期限切れ'
      : '未提出';
  const statusColor =
    print.status === 'submitted'
      ? { bg: '#DCFCE7', text: '#16A34A' }
      : print.status === 'overdue' || (days !== null && days! < 0)
      ? { bg: '#FEE2E2', text: '#DC2626' }
      : { bg: '#F8F5F3', text: '#8B8383' };

  return (
    <div className="pb-6">
      {/* Back */}
      <div className="px-5 pt-12 pb-2">
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm font-bold active:scale-95"
          style={{ color: '#C8847A' }}
        >
          ‹ 戻る
        </button>
      </div>

      {/* Image viewer */}
      <div
        className="mx-5 rounded-3xl overflow-hidden mb-4 relative"
        style={{ height: '220px' }}
      >
        {print.imageUrls[imgIdx]?.startsWith('#') ? (
          <div
            className="w-full h-full flex items-center justify-center text-6xl"
            style={{ backgroundColor: print.imageUrls[imgIdx] }}
          >
            📄
          </div>
        ) : (
          <img
            src={print.imageUrls[imgIdx]}
            alt={print.title}
            className="w-full h-full object-contain"
            style={{ backgroundColor: '#F8F5F3' }}
          />
        )}
        {/* Page indicators */}
        {print.imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {print.imageUrls.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === imgIdx ? '#C8847A' : 'rgba(255,255,255,0.7)' }}
              />
            ))}
          </div>
        )}
        {/* Page count */}
        {print.imageUrls.length > 1 && (
          <span
            className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-black/40 text-white"
          >
            {imgIdx + 1}/{print.imageUrls.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 space-y-4">
        {/* Title + actions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-lg font-extrabold leading-tight" style={{ color: '#3F3939' }}>
                {print.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ backgroundColor: folder?.color ?? '#F8F5F3', color: '#3F3939' }}
                >
                  {folder?.icon} {folder?.name}
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="text-2xl active:scale-95 transition-all"
            >
              {print.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        {/* Deadline */}
        {print.dueDate && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
              提出期限
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold" style={{ color: '#3F3939' }}>
                  {fmtDate(print.dueDate)}
                  {print.dueTime && ` ${print.dueTime}`}
                </p>
                {days !== null && print.status === 'pending' && (
                  <p
                    className="text-sm font-bold mt-0.5"
                    style={{
                      color:
                        days < 0 ? '#DC2626' : days <= 3 ? '#C8847A' : '#8B8383',
                    }}
                  >
                    {days < 0
                      ? `${Math.abs(days)}日超過`
                      : days === 0
                      ? '今日が期限です'
                      : days === 1
                      ? '明日が期限です'
                      : `あと${days}日`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Memo */}
        {print.memo && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
              メモ
            </p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: '#3F3939' }}>
              {print.memo}
            </p>
          </div>
        )}

        {/* Tags */}
        {print.tags.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
              タグ
            </p>
            <div className="flex flex-wrap gap-2">
              {print.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ backgroundColor: '#F0D8D5', color: '#C8847A' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Registered */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold mb-1" style={{ color: '#8B8383' }}>
            登録日
          </p>
          <p className="text-sm font-semibold" style={{ color: '#3F3939' }}>
            {fmtDate(print.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={markSubmitted}
            className="py-4 rounded-2xl font-extrabold text-sm active:scale-95 transition-all"
            style={
              print.status === 'submitted'
                ? { backgroundColor: '#F8F5F3', color: '#8B8383' }
                : { backgroundColor: '#DCFCE7', color: '#16A34A' }
            }
          >
            {print.status === 'submitted' ? '提出を取り消す' : '✓ 提出済みにする'}
          </button>
          <button
            onClick={openEdit}
            className="py-4 rounded-2xl font-extrabold text-sm active:scale-95 transition-all"
            style={{ backgroundColor: '#EAF0FD', color: '#3B82F6' }}
          >
            ✏️ 編集
          </button>
        </div>

        <button
          onClick={handleDelete}
          className="w-full py-4 rounded-2xl font-extrabold text-sm active:scale-95 transition-all"
          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
        >
          🗑 削除
        </button>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end max-w-sm mx-auto">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEdit(false)} />
          <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-10">
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ backgroundColor: '#E0DADA' }} />
            <h2 className="text-lg font-extrabold mb-4" style={{ color: '#3F3939' }}>
              プリントを編集
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>科目</label>
                <select
                  value={editFolderId}
                  onChange={(e) => setEditFolderId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none appearance-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>タイトル</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>提出期限</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border text-sm font-semibold outline-none"
                    style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>提出時刻</label>
                  <input
                    type="time"
                    value={editDueTime}
                    onChange={(e) => setEditDueTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border text-sm font-semibold outline-none"
                    style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>メモ</label>
                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none resize-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                />
              </div>
            </div>

            <button
              onClick={saveEdit}
              className="w-full mt-5 py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition-all"
              style={{ backgroundColor: '#C8847A' }}
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
