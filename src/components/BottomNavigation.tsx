interface Props {
  activeTab: 'home' | 'folders' | 'schedule' | 'settings';
  onHome: () => void;
  onFolders: () => void;
  onAdd: () => void;
  onSchedule: () => void;
  onSettings: () => void;
}

export default function BottomNavigation({
  activeTab,
  onHome,
  onFolders,
  onAdd,
  onSchedule,
  onSettings,
}: Props) {
  return (
    <div className="relative flex-shrink-0">
      <div
        className="bg-white border-t flex items-end justify-around px-2 pt-2 pb-6"
        style={{ borderColor: '#F0EAE8' }}
      >
        <NavBtn
          label="ホーム"
          icon="🏠"
          active={activeTab === 'home'}
          onClick={onHome}
        />
        <NavBtn
          label="フォルダ"
          icon="📂"
          active={activeTab === 'folders'}
          onClick={onFolders}
        />
        <div className="w-16" />
        <NavBtn
          label="予定"
          icon="📅"
          active={activeTab === 'schedule'}
          onClick={onSchedule}
        />
        <NavBtn
          label="設定"
          icon="⚙️"
          active={activeTab === 'settings'}
          onClick={onSettings}
        />
      </div>
      <button
        onClick={onAdd}
        className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-3xl font-bold active:scale-95 transition-all"
        style={{ backgroundColor: '#C8847A' }}
      >
        +
      </button>
    </div>
  );
}

function NavBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 min-w-[3.5rem] py-1 transition-all active:scale-95"
      style={{ color: active ? '#C8847A' : '#8B8383' }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
