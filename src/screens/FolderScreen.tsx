import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
  onAddFolder: (f: Folder) => void;
  onUpdateFolder: (f: Folder) => void;
  onDeleteFolder: (id: string) => void;
}

const FOLDER_ICONS = ['📖', '📐', '🔤', '🔬', '🌍', '📁', '🎨', '🎵', '⚽', '💻', '📝', '📊'];
const FOLDER_COLORS = [
  '#FDECEA', '#EAF0FD', '#EAF8EE', '#FDF8EA', '#F0EAFD', '#F2F0EF',
  '#FDEEF8', '#EFF8FD', '#FDF3EA', '#EAFDF6',
];

export default function FolderScreen({
  folders,
  prints,
  navigate,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [newColor, setNewColor] = useState(FOLDER_COLORS[5]);

  function openAdd() {
    setNewName('');
    setNewIcon('📁');
    setNewColor(FOLDER_COLORS[5]);
    setShowAddModal(true);
  }

  function openEdit(f: Folder) {
    setEditFolder(f);
    setNewName(f.name);
    setNewIcon(f.icon);
    setNewColor(f.color);
    setShowAddModal(true);
  }

  function handleSave() {
    if (!newName.trim()) return;
    if (editFolder) {
      onUpdateFolder({ ...editFolder, name: newName.trim(), icon: newIcon, color: newColor });
    } else {
      onAddFolder({
        id: `f${Date.now()}`,
        name: newName.trim(),
        icon: newIcon,
        color: newColor,
      });
    }
    setShowAddModal(false);
    setEditFolder(null);
  }

  function handleDelete(id: string) {
    if (confirm('このフォルダを削除しますか？\n中のプリントも削除されます。')) {
      onDeleteFolder(id);
    }
  }

  const getPrintCount = (folderId: string) =>
    prints.filter((p) => p.folderId === folderId).length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#8B8383' }}>
            整理する
          </p>
          <h1 className="text-2xl font-extrabold" style={{ color: '#3F3939' }}>
            フォルダ
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm active:scale-95 transition-all"
          style={{ backgroundColor: '#C8847A' }}
        >
          +
        </button>
      </div>

      {/* Folder Grid */}
      {folders.length === 0 ? (
        <div className="px-5">
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center">
            <p className="text-4xl mb-4">📂</p>
            <p className="font-bold mb-1" style={{ color: '#3F3939' }}>
              フォルダがありません
            </p>
            <button
              onClick={openAdd}
              className="mt-4 px-6 py-2.5 rounded-full text-white text-sm font-bold active:scale-95 transition-all"
              style={{ backgroundColor: '#C8847A' }}
            >
              フォルダを作成
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3">
          {folders.map((folder) => (
            <div key={folder.id} className="relative group">
              <button
                onClick={() => navigate({ name: 'folder-detail', folderId: folder.id })}
                className="w-full bg-white rounded-3xl p-5 shadow-sm text-left active:scale-95 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: folder.color }}
                >
                  {folder.icon}
                </div>
                <p className="font-extrabold text-sm leading-tight" style={{ color: '#3F3939' }}>
                  {folder.name}
                </p>
                <p className="text-xs mt-1" style={{ color: '#8B8383' }}>
                  {getPrintCount(folder.id)}件
                </p>
              </button>
              {/* Edit/Delete actions */}
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => openEdit(folder)}
                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-xs active:scale-95"
                  style={{ color: '#8B8383' }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(folder.id)}
                  className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-xs active:scale-95"
                  style={{ color: '#EF4444' }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => { setShowAddModal(false); setEditFolder(null); }}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom max-w-sm mx-auto">
            <div
              className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ backgroundColor: '#E0DADA' }}
            />
            <h2 className="text-lg font-extrabold mb-5" style={{ color: '#3F3939' }}>
              {editFolder ? 'フォルダを編集' : 'フォルダを作成'}
            </h2>

            {/* Preview */}
            <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl" style={{ backgroundColor: '#F8F5F3' }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: newColor }}
              >
                {newIcon}
              </div>
              <p className="font-extrabold text-base" style={{ color: '#3F3939' }}>
                {newName || 'フォルダ名'}
              </p>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: '#8B8383' }}>
                フォルダ名 *
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例: 数学Ⅱ"
                className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none"
                style={{
                  borderColor: '#F0EAE8',
                  backgroundColor: '#F8F5F3',
                  color: '#3F3939',
                }}
                maxLength={20}
              />
            </div>

            {/* Icon picker */}
            <div className="mb-4">
              <label className="text-xs font-bold mb-2 block" style={{ color: '#8B8383' }}>
                アイコン
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                    style={{
                      backgroundColor: newIcon === icon ? '#C8847A' : '#F8F5F3',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="mb-6">
              <label className="text-xs font-bold mb-2 block" style={{ color: '#8B8383' }}>
                カラー
              </label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      backgroundColor: color,
                      outline: newColor === color ? '2px solid #C8847A' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!newName.trim()}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition-all disabled:opacity-40"
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
