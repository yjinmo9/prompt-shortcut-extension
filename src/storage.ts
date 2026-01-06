import { Prompt, Folder, PromptStorage, SortBy } from './types';

const STORAGE_KEY = 'prompt_shortcut_data';

export const promptStorage = {
  async getData(): Promise<PromptStorage> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    let data: PromptStorage = (result[STORAGE_KEY] as PromptStorage) || {
      prompts: [],
      folders: [],
      sortBy: 'favorite'
    };

    // Initialize with default folders if none exist
    if (data.folders.length === 0) {
      const defaultFolders: Folder[] = ['A', 'B', 'C', 'D'].map((name, index) => ({
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now() + index,
      }));
      data.folders = defaultFolders;
      await this.saveData(data);
    }

    return data;
  },

  async saveData(data: PromptStorage): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  },

  async getAll(): Promise<Prompt[]> {
    const data = await this.getData();
    return data.prompts;
  },

  async save(prompts: Prompt[]): Promise<void> {
    const data = await this.getData();
    data.prompts = prompts;
    await this.saveData(data);
  },

  async add(prompt: Omit<Prompt, 'id' | 'createdAt' | 'lastUsedAt' | 'usedCount'>): Promise<Prompt> {
    const prompts = await this.getAll();
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      usedCount: 0,
    };
    prompts.push(newPrompt);
    await this.save(prompts);
    return newPrompt;
  },

  async update(id: string, updates: Partial<Prompt>): Promise<void> {
    const prompts = await this.getAll();
    const index = prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates };
      await this.save(prompts);
    }
  },

  async delete(id: string): Promise<void> {
    const prompts = await this.getAll();
    const filtered = prompts.filter(p => p.id !== id);
    await this.save(filtered);
  },

  async incrementUsage(id: string): Promise<void> {
    const prompts = await this.getAll();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      prompt.usedCount += 1;
      prompt.lastUsedAt = Date.now();
      await this.save(prompts);
    }
  },

  async toggleFavorite(id: string): Promise<void> {
    const prompts = await this.getAll();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      prompt.favorite = !prompt.favorite;
      await this.save(prompts);
    }
  },

  sortPrompts(prompts: Prompt[], sortBy: SortBy): Prompt[] {
    const sorted = [...prompts];

    switch (sortBy) {
      case 'favorite':
        return sorted.sort((a, b) => {
          if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
          return b.lastUsedAt - a.lastUsedAt;
        });
      case 'recent':
        return sorted.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
      case 'frequency':
        return sorted.sort((a, b) => b.usedCount - a.usedCount);
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      default:
        return sorted;
    }
  },

  // Folder operations
  async getAllFolders(): Promise<Folder[]> {
    const data = await this.getData();
    return data.folders;
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    const data = await this.getData();
    data.folders = folders;
    await this.saveData(data);
  },

  async addFolder(name: string): Promise<Folder> {
    const folders = await this.getAllFolders();
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    folders.push(newFolder);
    await this.saveFolders(folders);
    return newFolder;
  },

  async deleteFolder(id: string): Promise<void> {
    const folders = await this.getAllFolders();
    const filtered = folders.filter(f => f.id !== id);
    await this.saveFolders(filtered);

    // Also remove folderId from prompts in this folder
    const prompts = await this.getAll();
    const updatedPrompts = prompts.map(p =>
      p.folderId === id ? { ...p, folderId: null } : p
    );
    await this.save(updatedPrompts);
  },

  async updateFolder(id: string, name: string): Promise<void> {
    const folders = await this.getAllFolders();
    const folder = folders.find(f => f.id === id);
    if (folder) {
      folder.name = name;
      await this.saveFolders(folders);
    }
  },

  async getPromptsByFolder(folderId: string | null): Promise<Prompt[]> {
    const prompts = await this.getAll();
    return prompts.filter(p => p.folderId === folderId);
  },
};
