import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
}

export default function SettingsScreen({ prints }: Props) {
  const [notify3days, setNotify3days] = useState(true);
  const [notifyDay, setNotifyDay] = useState(true);
  const [notifyToday, setNotifyToday] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  const totalPrints = prints.length;
  const submittedPrints = prints.filter((p) => p.status === 'submitted').length;
  const favPrints = prints.filter((p) => p.isFavorite).length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <p className="text-sm font-semibold mb-1" style={{ color: '#8B8383' }}>
          カスタマイズ
        </p>
        <h1 className="text-2xl font-extrabold" style={{ color: '#3F3939' }}>
          設定
        </h1>
      </div>

      {/* Stats card */}
      <div className="mx-5 mb-5">
        <div
          className="rounded-3xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #C8847A 0%, #B06A62 100%)' }}
        >
          <p className="text-white/70 text-xs font-bold mb-3">PrintBox 利用状況</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-extrabold">{totalPrints}</p>
              <p className="text-white/70 text-[10px] font-bold mt-0.5">プリント合計</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-2xl font-extrabold">{submittedPrints}</p>
              <p className="text-white/70 text-[10px] font-bold mt-0.5">提出済み</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold">{favPrints}</p>
              <p className="text-white/70 text-[10px] font-bold mt-0.5">お気に入り</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          通知設定
        </p>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <ToggleRow
            label="3日前に通知"
            sub="提出期限の3日前"
            checked={notify3days}
            onChange={setNotify3days}
          />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <ToggleRow
            label="前日に通知"
            sub="提出期限の前日"
            checked={notifyDay}
            onChange={setNotifyDay}
          />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <ToggleRow
            label="当日に通知"
            sub="提出期限の当日"
            checked={notifyToday}
            onChange={setNotifyToday}
          />
        </div>
      </div>

      {/* Data */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          データ管理
        </p>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <SettingsRow icon="📤" label="データをエクスポート" sub="JSON形式で書き出す" />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <SettingsRow icon="📥" label="データをインポート" sub="バックアップから復元" />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <SettingsRow icon="🗑" label="提出済みをまとめて削除" sub="提出済みプリントを全て削除" danger />
        </div>
      </div>

      {/* Display */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          表示
        </p>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <SettingsRow icon="🌙" label="ダークモード" sub="近日公開予定" disabled />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <SettingsRow icon="🔤" label="フォントサイズ" sub="標準" />
        </div>
      </div>

      {/* About */}
      <div className="px-5">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          このアプリについて
        </p>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="flex items-center gap-3 px-5 py-4 w-full text-left active:opacity-70 transition-all"
          >
            <span className="text-xl">📦</span>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#3F3939' }}>PrintBox</p>
              <p className="text-xs" style={{ color: '#8B8383' }}>バージョン 1.0.0</p>
            </div>
            <span style={{ color: '#8B8383' }}>{showAbout ? '▲' : '▼'}</span>
          </button>
          {showAbout && (
            <div className="px-5 pb-5 border-t" style={{ borderColor: '#F8F5F3' }}>
              <p className="text-sm mt-3 leading-relaxed font-semibold" style={{ color: '#8B8383' }}>
                PrintBoxは、学校のプリントをスマートフォンで簡単に管理するアプリです。AI・OCR・外部サービスは一切使用していません。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex-1">
        <p className="font-bold text-sm" style={{ color: '#3F3939' }}>{label}</p>
        <p className="text-xs" style={{ color: '#8B8383' }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-12 h-7 rounded-full transition-all flex items-center px-0.5"
        style={{ backgroundColor: checked ? '#C8847A' : '#E0DADA' }}
      >
        <div
          className="w-6 h-6 bg-white rounded-full shadow-sm transition-all"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  sub,
  danger,
  disabled,
}: {
  icon: string;
  label: string;
  sub?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex items-center gap-3 px-5 py-4 w-full text-left active:opacity-70 transition-all"
      style={{ opacity: disabled ? 0.4 : 1 }}
      disabled={disabled}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p
          className="font-bold text-sm"
          style={{ color: danger ? '#DC2626' : '#3F3939' }}
        >
          {label}
        </p>
        {sub && <p className="text-xs" style={{ color: '#8B8383' }}>{sub}</p>}
      </div>
      <span style={{ color: '#8B8383' }}>›</span>
    </button>
  );
}
