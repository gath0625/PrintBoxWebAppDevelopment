import { useState, useCallback } from 'react';
import type { Folder, Print, AppNotification, Route, NavTab } from './types';
import { INITIAL_FOLDERS, INITIAL_PRINTS, INITIAL_NOTIFICATIONS } from './data/mockData';
import BottomNavigation from './components/BottomNavigation';
import HomeScreen from './screens/HomeScreen';
import FolderScreen from './screens/FolderScreen';
import FolderDetailScreen from './screens/FolderDetailScreen';
import AddPrintSheet from './screens/AddPrintSheet';
import PrintDetailScreen from './screens/PrintDetailScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [showAdd, setShowAdd] = useState(false);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [prints, setPrints] = useState<Print[]>(INITIAL_PRINTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  
  // フォントサイズの状態 (1:小, 2:標準, 3:大)
  const [fontSizeLevel, setFontSizeLevel] = useState<1 | 2 | 3>(2);

  const navigate = useCallback((r: Route) => {
    setShowAdd(false);
    setRoute(r);
  }, []);

  const goBack = useCallback(() => {
    if (route.name === 'folder-detail') return setRoute({ name: 'folders' });
    if (route.name === 'print-detail') {
      const print = prints.find((p) => p.id === route.printId);
      return setRoute(
        print ? { name: 'folder-detail', folderId: print.folderId } : { name: 'home' }
      );
    }
    setRoute({ name: 'home' });
  }, [route, prints]);

  const addPrint = useCallback((print: Print) => {
    setPrints((prev) => [print, ...prev]);
    setShowAdd(false);
  }, []);

  const updatePrint = useCallback((updated: Print) => {
    setPrints((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const deletePrint = useCallback(
    (id: string) => {
      setPrints((prev) => prev.filter((p) => p.id !== id));
      goBack();
    },
    [goBack]
  );

  const addFolder = useCallback((folder: Folder) => {
    setFolders((prev) => [...prev, folder]);
  }, []);

  const updateFolder = useCallback((updated: Folder) => {
    setFolders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setPrints((prev) => prev.filter((p) => p.folderId !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const activeTab: NavTab =
    route.name === 'folders' || route.name === 'folder-detail' || route.name === 'print-detail'
      ? 'folders'
      : route.name === 'schedule'
      ? 'schedule'
      : route.name === 'settings'
      ? 'settings'
      : 'home';

  // フォントサイズに応じた基本の文字サイズを定義
  const fontSizeStyle = 
    fontSizeLevel === 1 ? '13px' : 
    fontSizeLevel === 3 ? '17px' : '15px';

  const shared = { folders, prints, notifications, navigate, goBack };

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#e5e7eb', maxWidth: '430px', margin: '0 auto', fontSize: fontSizeStyle }}
    >
      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto relative">
        {route.name === 'home' && (
          <HomeScreen
            {...shared}
            onNotificationClick={() => navigate({ name: 'notifications' })}
            onSearchClick={() => navigate({ name: 'search' })}
            onAddClick={() => setShowAdd(true)}
          />
        )}
        {route.name === 'folders' && (
          <FolderScreen
            {...shared}
            onAddFolder={addFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
          />
        )}
        {route.name === 'folder-detail' && route.folderId && (
          <FolderDetailScreen {...shared} folderId={route.folderId} />
        )}
        {route.name === 'print-detail' && route.printId && (
          <PrintDetailScreen
            {...shared}
            printId={route.printId}
            onUpdate={updatePrint}
            onDelete={deletePrint}
          />
        )}
        {route.name === 'schedule' && <ScheduleScreen {...shared} />}
        {route.name === 'notifications' && (
          <NotificationsScreen {...shared} onMarkRead={markNotificationRead} />
        )}
        {route.name === 'search' && <SearchScreen {...shared} />}
        {route.name === 'settings' && (
          <SettingsScreen 
            {...shared} 
            fontSizeLevel={fontSizeLevel} 
            setFontSizeLevel={setFontSizeLevel} 
          />
        )}
      </div>

      {/* Bottom Navigation */}
      {!showAdd && (
        <BottomNavigation
          activeTab={activeTab}
          onHome={() => navigate({ name: 'home' })}
          onFolders={() => navigate({ name: 'folders' })}
          onAdd={() => setShowAdd(true)}
          onSchedule={() => navigate({ name: 'schedule' })}
          onSettings={() => navigate({ name: 'settings' })}
        />
      )}

      {/* Add Print Sheet */}
      {showAdd && (
        <AddPrintSheet
          folders={folders}
          onAdd={addPrint}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}