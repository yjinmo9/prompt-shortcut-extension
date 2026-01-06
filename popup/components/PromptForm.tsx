import React, { useState, useEffect } from 'react';
import { Prompt } from '../../src/types';

interface PromptFormProps {
  prompt: Prompt | null;
  initialContent?: string;
  onSave: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}

function PromptForm({ prompt, initialContent = '', onSave, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || initialContent);
  const [tagsInput, setTagsInput] = useState(prompt?.tags.join(', ') || '');

  useEffect(() => {
    if (initialContent && !prompt) {
      setContent(initialContent);
    }
  }, [initialContent, prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    onSave({ title, content, tags });
  };

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-title">
          {prompt ? 'Edit Prompt' : 'New Prompt'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Code Review Request"
              autoFocus={!initialContent}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt text..."
              rows={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., coding, review, ai"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {prompt ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromptForm;
