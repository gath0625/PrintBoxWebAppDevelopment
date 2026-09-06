import { useState, useRef } from 'react';
import type { Folder, Print } from '../types';

interface Props {
  folders: Folder[];
  onAdd: (print: Print) => void;
  onClose: () => void;
}

type Step = 'pick' | 'form';

export default function AddPrintSheet({ folders, onAdd, onClose }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState(folders[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [memo, setMemo] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setImageUrls(urls);
    setStep('form');
  }

  function useNoImage() {
    const placeholders = ['#FFD1CC', '#C8DCFF', '#C8FFD8', '#FFF2C0', '#E8D4FF'];
    setImageUrls([placeholders[Math.floor(Math.random() * placeholders.length)]]);
    setStep('form');
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleSave() {
    const folder = folders.find((f) => f.id === folderId);
    onAdd({
      id: `p${Date.now()}`,
      folderId,
      title: title.trim() || '無題のプリント',
      subject: folder?.name ?? '',
      imageUrls: imageUrls.length > 0 ? imageUrls : ['#F0D8D5'],
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      memo: memo.trim(),
      status: 'pending',
      isFavorite: false,
      tags,
      createdAt: '2026-09-05',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end max-w-sm mx-auto">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#E0DADA' }} />
        </div>

        {step === 'pick' ? (
          <div className="p-6 pb-10">
            <h2 className="text-xl font-extrabold mb-6" style={{ color: '#3F3939' }}>
              プリントを追加
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex items-center gap-4 bg-white border-2 rounded-3xl p-5 active:scale-95 transition-all"
                style={{ borderColor: '#F0D8D5' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: '#FDECEA' }}
                >
                  📷
                </div>
                <div className="text-left">
                  <p className="font-extrabold" style={{ color: '#3F3939' }}>
                    撮影する
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                    カメラで撮影
                  </p>
                </div>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-4 bg-white border-2 rounded-3xl p-5 active:scale-95 transition-all"
                style={{ borderColor: '#F0D8D5' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: '#EAF0FD' }}
                >
                  🖼
                </div>
                <div className="text-left">
                  <p className="font-extrabold" style={{ color: '#3F3939' }}>
                    写真から選ぶ
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8B8383' }}>
                    ライブラリから選択
                  </p>
                </div>
              </button>

              <button
                onClick={useNoImage}
                className="text-center py-3 text-sm font-semibold active:opacity-70 transition-all"
                style={{ color: '#8B8383' }}
              >
                画像なしで登録
              </button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 pb-4">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setStep('pick')}
                className="text-sm font-bold active:scale-95"
                style={{ color: '#C8847A' }}
              >
                ‹ 戻る
              </button>
              <h2 className="text-lg font-extrabold" style={{ color: '#3F3939' }}>
                プリントを登録
              </h2>
            </div>

            {/* Image preview row */}
            {imageUrls.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {imageUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl"
                    style={{ backgroundColor: url.startsWith('#') ? url : undefined }}
                  >
                    {url.startsWith('#') ? (
                      '📄'
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed"
                  style={{ borderColor: '#E0DADA', color: '#8B8383' }}
                >
                  +
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const newUrls = Array.from(e.target.files ?? []).map((f) =>
                      URL.createObjectURL(f)
                    );
                    setImageUrls((prev) => [...prev, ...newUrls]);
                  }}
                />
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Subject / Folder */}
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                  科目 *
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none appearance-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.icon} {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                  タイトル
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 二次関数 演習プリント"
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  maxLength={50}
                />
              </div>

              {/* Due date & time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                    提出期限
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border text-sm font-semibold outline-none"
                    style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                    提出時刻
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border text-sm font-semibold outline-none"
                    style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                  メモ
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="メモを入力..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none resize-none"
                  style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  maxLength={200}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#8B8383' }}>
                  タグ
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1"
                      style={{ backgroundColor: '#F0D8D5', color: '#C8847A' }}
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="タグを入力して Enter"
                    className="flex-1 px-4 py-2.5 rounded-2xl border text-sm font-semibold outline-none"
                    style={{ borderColor: '#F0EAE8', backgroundColor: '#F8F5F3', color: '#3F3939' }}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2.5 rounded-2xl text-white text-sm font-bold"
                    style={{ backgroundColor: '#C8847A' }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 py-4 rounded-2xl text-white font-extrabold text-base active:scale-95 transition-all"
              style={{ backgroundColor: '#C8847A' }}
            >
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
