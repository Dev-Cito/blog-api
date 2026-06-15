'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Tag, ApiResponse } from '@/types';

interface TagSelectorProps {
  tags: Tag[];
  selectedIds: string[];
  onTagsChange: (tags: Tag[]) => void;
  onSelectionChange: (ids: string[]) => void;
}

export default function TagSelector({ tags, selectedIds, onTagsChange, onSelectionChange }: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((t) => t !== id)
        : [...selectedIds, id]
    );
  };

  const handleCreate = async () => {
    const name = input.trim();
    if (!name) return;

    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onSelectionChange([...selectedIds, existing.id]);
      }
      setInput('');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post<ApiResponse<Tag>>('/tags', { name });
      const newTag = res.data.data;
      onTagsChange([...tags, newTag]);
      onSelectionChange([...selectedIds, newTag.id]);
      setInput('');
    } catch {
      alert('Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              selectedIds.includes(tag.id)
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-gray-400">No tags yet — create one below.</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
          placeholder="New tag..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !input.trim()}
          className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition disabled:opacity-40"
        >
          {creating ? '...' : '+ Add'}
        </button>
      </div>
    </div>
  );
}
