export type PrintStatus = 'pending' | 'submitted' | 'overdue';

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Print {
  id: string;
  folderId: string;
  title: string;
  subject: string;
  imageUrls: string[];
  dueDate?: string;
  dueTime?: string;
  memo?: string;
  status: PrintStatus;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  printId: string;
  printTitle: string;
  subject: string;
  message: string;
  type: '3days' | 'tomorrow' | 'today' | 'overdue';
  isRead: boolean;
  createdAt: string;
}

export type RouteName =
  | 'home'
  | 'folders'
  | 'folder-detail'
  | 'print-detail'
  | 'schedule'
  | 'notifications'
  | 'search'
  | 'settings';

export interface Route {
  name: RouteName;
  folderId?: string;
  printId?: string;
}

export type NavTab = 'home' | 'folders' | 'schedule' | 'settings';
