export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  folderId: string | null; // null means uncategorized
  createdAt: number;
  lastUsedAt: number;
  usedCount: number;
}

export type SortBy = 'favorite' | 'recent' | 'frequency' | 'newest';

export interface PromptStorage {
  prompts: Prompt[];
  folders: Folder[];
  sortBy: SortBy;
}
