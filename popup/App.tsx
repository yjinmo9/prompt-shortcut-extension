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

  const filteredPrompts = currentFolderId !== null
    ? prompts.filter(p => p.folderId === currentFolderId)
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="header-icon">P</div>
          <span>Promptly AI</span>
        </div>
        <div className="header-right">
          <span style={{ cursor: 'pointer' }}>📌</span>
          <span style={{ cursor: 'pointer' }}>✕</span>
        </div>
      </header>

      <nav className="tabs">
        <div
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Prompts
        </div>
        <div
          className={`tab ${activeTab === 'craft' ? 'active' : ''}`}
          onClick={() => setActiveTab('craft')}
        >
          Craft
        </div>
      </nav>

      <main className="content">
        {activeTab === 'saved' && (
          <>
            {currentFolderId === null ? (
              // Folder list view
              <>
                <div className="folder-header">
                  <h2 className="section-title">Your Folders</h2>
                  <div className="header-buttons">
                    <button
                      className="btn-new-folder"
                      onClick={() => setShowFolderForm(true)}
                    >
                      + Folder
                    </button>
                    <button
                      className="btn-new-folder"
                      onClick={() => setShowPromptForm(true)}
                    >
                      + Prompt
                    </button>
                  </div>
                </div>

                <div className="folder-grid">
                  {folders.length === 0 ? (
                    <div className="empty-state">No folders yet.</div>
                  ) : (
                    folders.map((folder) => {
                      const folderPromptCount = prompts.filter(p => p.folderId === folder.id).length;
                      return (
                        <div
                          key={folder.id}
                          className="folder-card"
                        >
                          <div onClick={() => handleFolderClick(folder.id)}>
                            <div className="folder-icon">📁</div>
                            <div className="folder-info">
                              <div className="folder-name">{folder.name}</div>
                              <div className="folder-count">{folderPromptCount} prompts</div>
                            </div>
                          </div>
                          <div className="folder-actions">
                            <button
                              className="action-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFolder(folder);
                              }}
                              title="Edit folder"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                              title="Delete folder"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Show uncategorized prompts */}
                {prompts.filter(p => p.folderId === null).length > 0 && (
                  <div className="uncategorized-section">
                    <h3 className="section-subtitle">Uncategorized</h3>
                    <div className="prompt-items">
                      {prompts
                        .filter(p => p.folderId === null)
                        .map((prompt) => (
                          <div
                            key={prompt.id}
                            className="prompt-card"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            <div className="prompt-card-title">{prompt.title}</div>
                            <div className="prompt-card-content">{prompt.content}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Prompt list view (inside a folder)
              <>
                <div className="folder-header">
                  <button className="btn-back" onClick={handleBackToFolders}>
                    ← Back
                  </button>
                  <h2 className="section-title">{getCurrentFolderName()}</h2>
                </div>

                <div className="prompt-items">
                  {filteredPrompts.length === 0 ? (
                    <div className="empty-state">No prompts in this folder yet.</div>
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
            <p>Crafting feature coming soon!</p>
          </div>
        )}
      </main>

      {/* Add Prompt Modal */}
      {showPromptForm && (
        <div className="modal-overlay" onClick={() => setShowPromptForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add New Prompt</h3>

            <div className="form-group">
              <label className="form-label">Prompt Content</label>
              <textarea
                className="input-area"
                placeholder="Enter your prompt..."
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="Give it a name..."
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Folder</label>
              <select
                className="input-field"
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
              >
                <option value="">Select a folder (optional)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowPromptForm(false)}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleAddPrompt}>
                Add Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showFolderForm && (
        <div className="modal-overlay" onClick={() => setShowFolderForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add New Folder</h3>

            <div className="form-group">
              <label className="form-label">Folder Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowFolderForm(false)}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleAddFolder}>
                Add Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {showEditFolderForm && editingFolder && (
        <div className="modal-overlay" onClick={() => setShowEditFolderForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Folder</h3>

            <div className="form-group">
              <label className="form-label">Folder Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditFolderForm(false)}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleUpdateFolder}>
                Save
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
                Close
              </button>
              <button className="btn-copy" onClick={handleCopyPrompt}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
