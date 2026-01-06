import React from 'react';
import { Prompt } from '../../src/types';

interface PromptItemProps {
  prompt: Prompt;
  onInsert: () => void;
  onCopy: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function PromptItem({
  prompt,
  onInsert,
  onCopy,
  onToggleFavorite,
  onEdit,
  onDelete,
}: PromptItemProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="prompt-item" onClick={onInsert}>
      <div className="prompt-item-header">
        <div className="prompt-item-title">
          {prompt.favorite && <span className="favorite-icon">⭐</span>}
          {prompt.title}
        </div>
        <div className="prompt-item-actions">
          <button
            className="action-btn"
            onClick={onCopy}
            title="Copy to clipboard"
          >
            📋
          </button>
          <button
            className="action-btn"
            onClick={onToggleFavorite}
            title={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {prompt.favorite ? '⭐' : '☆'}
          </button>
          <button
            className="action-btn"
            onClick={onEdit}
            title="Edit prompt"
          >
            ✏️
          </button>
          <button
            className="action-btn"
            onClick={onDelete}
            title="Delete prompt"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="prompt-item-content">{prompt.content}</div>

      <div className="prompt-item-footer">
        <div className="prompt-item-tags">
          {prompt.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="prompt-item-meta">
          <span>🔥 {prompt.usedCount}</span>
          <span>📅 {formatDate(prompt.lastUsedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default PromptItem;
