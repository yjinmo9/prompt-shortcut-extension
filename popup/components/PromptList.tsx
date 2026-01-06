import React from 'react';
import { Prompt } from '../../src/types';
import PromptItem from './PromptItem.tsx';

interface PromptListProps {
  prompts: Prompt[];
  onInsert: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onEdit: (prompt: Prompt, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

function PromptList({
  prompts,
  onInsert,
  onCopy,
  onToggleFavorite,
  onEdit,
  onDelete,
}: PromptListProps) {
  if (prompts.length === 0) {
    return (
      <div className="prompt-list">
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">No prompts yet</div>
          <div className="empty-state-hint">
            Click + to add your first prompt or right-click selected text
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-list">
      {prompts.map((prompt) => (
        <PromptItem
          key={prompt.id}
          prompt={prompt}
          onInsert={() => onInsert(prompt)}
          onCopy={(e) => onCopy(prompt, e)}
          onToggleFavorite={(e) => onToggleFavorite(prompt.id, e)}
          onEdit={(e) => onEdit(prompt, e)}
          onDelete={(e) => onDelete(prompt.id, e)}
        />
      ))}
    </div>
  );
}

export default PromptList;
