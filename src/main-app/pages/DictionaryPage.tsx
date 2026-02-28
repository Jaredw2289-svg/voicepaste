import React, { useState, useEffect, useRef } from 'react';
import type { DictionaryWord } from '../../shared/types';

const DictionaryPage: React.FC = () => {
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadWords = async () => {
    try {
      const list = await window.electronAPI.dictionaryList();
      setWords(list);
    } catch (err) {
      console.error('[Dictionary] Failed to load words:', err);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = async () => {
    const trimmed = newWord.trim();
    if (!trimmed) return;
    try {
      const added = await window.electronAPI.dictionaryAdd(trimmed);
      setWords(prev => [added, ...prev]);
      setNewWord('');
      setIsAdding(false);
    } catch (err) {
      console.error('[Dictionary] Failed to add word:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await window.electronAPI.dictionaryDelete(id);
      setWords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('[Dictionary] Failed to delete word:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setNewWord('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-[32px] p-[48px]">
      {/* Header with title + new word button */}
      <div className="flex items-center gap-[16px]">
        <h1 className="font-heading text-[32px] font-normal text-[var(--text-primary)]">
          Dictionary
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex h-[44px] items-center justify-center rounded-[22px] bg-[var(--text-primary)] px-[20px] py-[12px] font-sans text-[14px] text-white"
        >
          New word
        </button>
      </div>

      {/* Inline add input */}
      {isAdding && (
        <div className="flex items-center gap-[12px]">
          <input
            ref={inputRef}
            type="text"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a word or phrase…"
            className="h-[44px] w-[320px] rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-white)] px-[16px] font-sans text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-orange)]"
          />
          <button
            onClick={handleAdd}
            className="flex h-[44px] items-center justify-center rounded-[22px] bg-[var(--text-primary)] px-[20px] font-sans text-[14px] text-white"
          >
            Add
          </button>
          <button
            onClick={() => { setNewWord(''); setIsAdding(false); }}
            className="flex h-[44px] items-center justify-center rounded-[22px] bg-[var(--border-light)] px-[20px] font-sans text-[14px] text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Empty state */}
      {words.length === 0 && !isAdding && (
        <div className="flex flex-col items-center justify-center gap-[16px] py-[64px]">
          <span className="text-[48px]">✨</span>
          <p className="font-sans text-[16px] text-[var(--text-secondary)]">
            Add words and phrases to improve transcription accuracy.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="flex h-[44px] items-center justify-center rounded-[22px] bg-[var(--text-primary)] px-[20px] font-sans text-[14px] text-white"
          >
            Add your first word
          </button>
        </div>
      )}

      {/* Words Grid */}
      {words.length > 0 && (
        <div className="flex w-full flex-col gap-[16px]">
          {Array.from({ length: Math.ceil(words.length / 3) }, (_, rowIdx) => (
            <div key={rowIdx} className="flex w-full gap-[20px]">
              {words.slice(rowIdx * 3, rowIdx * 3 + 3).map(word => (
                <div
                  key={word.id}
                  className="group flex w-[310px] items-center gap-[8px]"
                >
                  <span className="text-[14px] text-[var(--accent-green)]">✨</span>
                  <span className="flex-1 font-sans text-[14px] text-[var(--text-primary)]">
                    {word.word}
                  </span>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] text-[var(--text-secondary)] opacity-0 transition-opacity hover:bg-[var(--border-light)] group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;
