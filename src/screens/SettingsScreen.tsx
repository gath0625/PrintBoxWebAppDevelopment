import { useState } from 'react';
import type { Folder, Print, AppNotification, Route } from '../types';

interface Props {
  folders: Folder[];
  prints: Print[];
  notifications: AppNotification[];
  navigate: (r: Route) => void;
  goBack: () => void;
  fontSizeLevel: 1 | 2 | 3;
  setFontSizeLevel: (level: 1 | 2 | 3) => void;
}

const FONT_LABELS = {
  1: '小',
  2: '標準',
  3: '大',
} as const;

export default function SettingsScreen({ fontSizeLevel, setFontSizeLevel }: Props) {
  const [notify3days, setNotify3days] = useState(true);
  const [notifyDay, setNotifyDay] = useState(true);
  const [notifyToday, setNotifyToday] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  const fontSizeText = FONT_LABELS[fontSizeLevel];

  // スマホ本体への通知許可を求める関数
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザはプッシュ通知に対応していません。');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert('通知が許可されました！スマホのロック画面に通知が届くようになります。');
    } else {
      alert('通知が拒否されました。ブラウザの設定から許可を変更してください。');
    }
  };

  // スマホ本体にテスト通知を飛ばす関数
  const sendTestNotification = () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知に対応していません。');
      return;
    }

    if (Notification.permission === 'granted') {
      // スマホ本体のロック画面や通知センターに通知を飛ばす
      new Notification('PrintBox リマインダー', {
        body: '【数学】二次関数演習プリントの提出期限が明日です！',
        icon: '/favicon.ico', // 必要に応じてアイコンパス
      });
    } else {
      alert('まずは「通知の許可を有効にする」ボタンを押してください。');
    }
  };

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

      {/* 📱 スマホ本体へのプッシュ通知設定セクション */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          スマホ通知の連動
        </p>
        <div className="bg-white rounded-3xl shadow-sm p-4 flex flex-col gap-3">
          <button
            onClick={requestNotificationPermission}
            className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[#C8847A] active:opacity-80 transition-all shadow-sm"
          >
            🔔 スマホの通知を許可する
          </button>
          <button
            onClick={sendTestNotification}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-[#F8F5F3] active:opacity-80 transition-all shadow-sm"
            style={{ color: '#3F3939' }}
          >
            📲 テスト通知をスマホに送る
          </button>
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

      {/* Display */}
      <div className="px-5 mb-4">
        <p className="text-xs font-bold mb-2" style={{ color: '#8B8383' }}>
          表示
        </p>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <ToggleRow
            label="ダークモード"
            sub="画面を暗い色にする"
            checked={darkMode}
            onChange={setDarkMode}
          />
          <div className="border-t" style={{ borderColor: '#F8F5F3' }} />
          <SettingsRow
            icon="🔤"
            label="フォントサイズ"
            sub={fontSizeText}
            onClick={() => setShowFontModal(true)}
          />
        </div>
      </div>

      {/* Font Size Slider Modal */}
      {showFontModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-lg">
            <p className="font-extrabold text-base mb-2 text-center" style={{ color: '#3F3939' }}>
              フォントサイズ
            </p>
            <p className="text-xs text-center mb-6 font-bold" style={{ color: '#C8847A' }}>
              現在: {fontSizeText}
            </p>

            <div className="px-2 mb-6">
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={fontSizeLevel}
                onChange={(e) => setFontSizeLevel(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full accent-[#C8847A] cursor-pointer h-2 bg-[#F8F5F3] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-bold mt-3" style={{ color: '#8B8383' }}>
                <span>小</span>
                <span className="text-[#C8847A]">標準</span>
                <span>大</span>
              </div>
            </div>

            <button
              onClick={() => setShowFontModal(false)}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-[#C8847A] active:opacity-80 transition-all shadow-sm"
            >
              決定
            </button>
          </div>
        </div>
      )}
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
  onClick,
}: {
  icon: string;
  label: string;
  sub?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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