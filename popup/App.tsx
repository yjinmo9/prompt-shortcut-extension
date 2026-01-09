import React, { useState, useEffect } from 'react';
import { Prompt, Folder } from '../src/types';
import { promptStorage } from '../src/storage';

function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'craft'>('saved');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);


  // Form state
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showEditFolderForm, setShowEditFolderForm] = useState(false);
  const [showPromptDetail, setShowPromptDetail] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // Translations
  const t = {
    ko: {
      savedPrompts: '저장된 프롬프트',
      craft: '작성하기',
      searchPlaceholder: '프롬프트 또는 폴더 검색...',
      yourFolders: '내 폴더',
      addFolder: '+ 폴더',
      addPrompt: '+ 프롬프트',
      noFolders: '아직 폴더가 없습니다.',
      prompts: '개 프롬프트',
      uncategorized: '분류되지 않음',
      searchResults: '검색 결과',
      noResults: '에 대한 결과가 없습니다',
      back: '← 뒤로',
      noPromptsInFolder: '이 폴더에 아직 프롬프트가 없습니다.',
      craftingSoon: '작성 기능은 곧 출시됩니다!',
      addNewPrompt: '새 프롬프트 추가',
      promptContent: '프롬프트 내용',
      promptPlaceholder: '프롬프트를 입력하세요...',
      title: '제목',
      titlePlaceholder: '제목을 입력하세요...',
      folder: '폴더',
      selectFolder: '폴더 선택 (선택사항)',
      cancel: '취소',
      add: '추가',
      addNewFolder: '새 폴더 추가',
      editFolder: '폴더 수정',
      folderName: '폴더 이름',
      folderPlaceholder: '폴더 이름을 입력하세요...',
      save: '저장',
      close: '닫기',
      copy: '복사',
    },
    en: {
      savedPrompts: 'Saved Prompts',
      craft: 'Craft',
      searchPlaceholder: 'Search prompts or folders...',
      yourFolders: 'Your Folders',
      addFolder: '+ Folder',
      addPrompt: '+ Prompt',
      noFolders: 'No folders yet.',
      prompts: ' prompts',
      uncategorized: 'Uncategorized',
      searchResults: 'Search Results',
      noResults: 'No results found for',
      back: '← Back',
      noPromptsInFolder: 'No prompts in this folder yet.',
      craftingSoon: 'Crafting feature coming soon!',
      addNewPrompt: 'Add New Prompt',
      promptContent: 'Prompt Content',
      promptPlaceholder: 'Enter your prompt...',
      title: 'Title',
      titlePlaceholder: 'Give it a name...',
      folder: 'Folder',
      selectFolder: 'Select a folder (optional)',
      cancel: 'Cancel',
      add: 'Add',
      addNewFolder: 'Add New Folder',
      editFolder: 'Edit Folder',
      folderName: 'Folder Name',
      folderPlaceholder: 'Enter folder name...',
      save: 'Save',
      close: 'Close',
      copy: 'Copy',
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedFolders, loadedPrompts] = await Promise.all([
      promptStorage.getAllFolders(),
      promptStorage.getAll()
    ]);
    setFolders(loadedFolders);
    setPrompts(loadedPrompts);
  };

  const handleAddPrompt = async () => {
    if (!newPromptTitle.trim() || !newPromptContent.trim()) return;

    await promptStorage.add({
      title: newPromptTitle,
      content: newPromptContent,
      tags: [],
      favorite: false,
      folderId: selectedFolderId
    });

    // Reset form
    setNewPromptTitle('');
    setNewPromptContent('');
    setSelectedFolderId(null);
    setShowPromptForm(false);
    loadData();
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    await promptStorage.addFolder(newFolderName.trim());
    setNewFolderName('');
    setShowFolderForm(false);
    loadData();
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowEditFolderForm(true);
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    await promptStorage.updateFolder(editingFolder.id, newFolderName.trim());
    setEditingFolder(null);
    setNewFolderName('');
    setShowEditFolderForm(false);
    loadData();
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Prompts inside will become uncategorized.')) return;

    await promptStorage.deleteFolder(folderId);
    loadData();
  };

  const handlePromptClick = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptDetail(true);
  };

  const handleCopyPrompt = async () => {
    if (!selectedPrompt) return;
    await navigator.clipboard.writeText(selectedPrompt.content);
    setShowPromptDetail(false);
    setSelectedPrompt(null);
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleBackToFolders = () => {
    setCurrentFolderId(null);
  };

  const getCurrentFolderName = () => {
    if (!currentFolderId) return '';
    const folder = folders.find(f => f.id === currentFolderId);
    return folder?.name || '';
  };

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrompts = currentFolderId !== null
    ? prompts.filter(p => p.folderId === currentFolderId &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())))
    : prompts.filter(p => p.folderId === null &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())));

  const searchResults = searchQuery.trim() !== ''
    ? prompts.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="header-icon">P</div>
          <span>PromptDash</span>
        </div>
        <div className="header-right">
          <button
            className="lang-toggle"
            onClick={toggleLanguage}
            title="언어 전환 / Toggle Language"
          >
            {language === 'ko' ? 'KO' : 'EN'}
          </button>
        </div>
      </header>

      <nav className="tabs">
        <div
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          {t[language].savedPrompts}
        </div>
        <div
          className={`tab ${activeTab === 'craft' ? 'active' : ''}`}
          onClick={() => setActiveTab('craft')}
        >
          {t[language].craft}
        </div>
      </nav>

      <main className="content">
        {activeTab === 'saved' && (
          <>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder={t[language].searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {currentFolderId === null ? (
              // Folder list view
              <>
                <div className="folder-header">
                  <h2 className="section-title">{t[language].yourFolders}</h2>
                  <div className="header-buttons">
                    <button
                      className="btn-new-folder"
                      onClick={() => setShowFolderForm(true)}
                    >
                      {t[language].addFolder}
                    </button>
                    <button
                      className="btn-new-folder"
                      onClick={() => setShowPromptForm(true)}
                    >
                      {t[language].addPrompt}
                    </button>
                  </div>
                </div>

                <div className="folder-grid">
                  {searchQuery === '' ? (
                    folders.length === 0 ? (
                      <div className="empty-state">{t[language].noFolders}</div>
                    ) : (
                      folders.map((folder) => {
                        const folderPromptCount = prompts.filter(p => p.folderId === folder.id).length;
                        return (
                          <div key={folder.id} className="folder-card">
                            <div onClick={() => handleFolderClick(folder.id)}>
                              <div className="folder-icon">📁</div>
                              <div className="folder-info">
                                <div className="folder-name">{folder.name}</div>
                                <div className="folder-count">
                                  {language === 'ko' ? `${folderPromptCount}${t[language].prompts}` : `${folderPromptCount}${t[language].prompts}`}
                                </div>
                              </div>
                            </div>
                            <div className="folder-actions">
                              <button className="action-icon" onClick={(e) => { e.stopPropagation(); handleEditFolder(folder); }} title="Edit folder">✏️</button>
                              <button className="action-icon" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} title="Delete folder">🗑️</button>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    <>
                      {filteredFolders.map((folder) => {
                        const folderPromptCount = prompts.filter(p => p.folderId === folder.id).length;
                        return (
                          <div key={folder.id} className="folder-card">
                            <div onClick={() => handleFolderClick(folder.id)}>
                              <div className="folder-icon">📁</div>
                              <div className="folder-info">
                                <div className="folder-name">{folder.name}</div>
                                <div className="folder-count">
                                  {language === 'ko' ? `${folderPromptCount}${t[language].prompts}` : `${folderPromptCount}${t[language].prompts}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Show prompts based on search or uncategorized */}
                {searchQuery !== '' ? (
                  searchResults.length > 0 && (
                    <div className="uncategorized-section">
                      <h3 className="section-subtitle">{t[language].searchResults} ({searchResults.length})</h3>
                      <div className="prompt-items">
                        {searchResults.map((prompt) => (
                          <div key={prompt.id} className="prompt-card" onClick={() => handlePromptClick(prompt)}>
                            <div className="prompt-card-title">{prompt.title}</div>
                            <div className="prompt-card-content">{prompt.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  prompts.filter(p => p.folderId === null).length > 0 && (
                    <div className="uncategorized-section">
                      <h3 className="section-subtitle">{t[language].uncategorized}</h3>
                      <div className="prompt-items">
                        {prompts.filter(p => p.folderId === null).map((prompt) => (
                          <div key={prompt.id} className="prompt-card" onClick={() => handlePromptClick(prompt)}>
                            <div className="prompt-card-title">{prompt.title}</div>
                            <div className="prompt-card-content">{prompt.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {searchQuery !== '' && filteredFolders.length === 0 && searchResults.length === 0 && (
                  <div className="empty-state">
                    {language === 'ko' ? `"${searchQuery}"${t[language].noResults}` : `${t[language].noResults} "${searchQuery}"`}
                  </div>
                )}
              </>
            ) : (
              // Prompt list view (inside a folder)
              <>
                <div className="folder-header">
                  <button className="btn-back" onClick={handleBackToFolders}>
                    {t[language].back}
                  </button>
                  <h2 className="section-title">{getCurrentFolderName()}</h2>
                </div>

                <div className="prompt-items">
                  {filteredPrompts.length === 0 ? (
                    <div className="empty-state">{t[language].noPromptsInFolder}</div>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="prompt-card"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        <div className="prompt-card-title">{prompt.title}</div>
                        <div className="prompt-card-content">{prompt.content}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'craft' && (
          <div className="empty-state">
            <p>작성 기능은 곳 출시됩니다!</p>
          </div>
        )}
      </main>

      {/* Add Prompt Modal */}
      {showPromptForm && (
        <div className="modal-overlay" onClick={() => setShowPromptForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t[language].addNewPrompt}</h3>

            <div className="form-group">
              <label className="form-label">{t[language].promptContent}</label>
              <textarea
                className="input-area"
                placeholder={t[language].promptPlaceholder}
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t[language].title}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t[language].titlePlaceholder}
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t[language].folder}</label>
              <select
                className="input-field"
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
              >
                <option value="">{t[language].selectFolder}</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowPromptForm(false)}>
                취소
              </button>
              <button className="btn-add" onClick={handleAddPrompt}>
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showFolderForm && (
        <div className="modal-overlay" onClick={() => setShowFolderForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t[language].addNewFolder}</h3>

            <div className="form-group">
              <label className="form-label">{t[language].folderName}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t[language].folderPlaceholder}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowFolderForm(false)}>
                취소
              </button>
              <button className="btn-add" onClick={handleAddFolder}>
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {showEditFolderForm && editingFolder && (
        <div className="modal-overlay" onClick={() => setShowEditFolderForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{t[language].editFolder}</h3>

            <div className="form-group">
              <label className="form-label">{t[language].folderName}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t[language].folderPlaceholder}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditFolderForm(false)}>
                취소
              </button>
              <button className="btn-add" onClick={handleUpdateFolder}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      {showPromptDetail && selectedPrompt && (
        <div className="modal-overlay prompt-detail-modal" onClick={() => setShowPromptDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="prompt-detail-title">{selectedPrompt.title}</h3>

            <div className="prompt-detail-content">
              {selectedPrompt.content}
            </div>

            <div className="prompt-detail-actions">
              <button className="btn-secondary" onClick={() => setShowPromptDetail(false)}>
                닫기
              </button>
              <button className="btn-copy" onClick={handleCopyPrompt}>
                복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
