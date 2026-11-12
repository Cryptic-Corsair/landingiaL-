import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import {
  IAL_UNITS,
  SEARCH_ITEMS,
  type IalUnit,
  type SearchEntry,
} from '../../data/ialData';
import { EASE_EXPO, filterSearchEntries } from '../../lib/motion';

interface CommandPaletteModalProps {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
  onJumpToAnchor: (anchor: string) => void;
}

export function CommandPaletteModal({
  open,
  initialQuery = '',
  onClose,
  onJumpToAnchor,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activePreview, setActivePreview] = useState<SearchEntry | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setActivePreview(null);
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(id);
    }
  }, [open, initialQuery]);

  const filtered = useMemo(() => filterSearchEntries(SEARCH_ITEMS, query), [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev + 1) % filtered.length : 0,
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0,
        );
        return;
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        setActivePreview(filtered[selectedIndex]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, selectedIndex, onClose]);

  const previewUnit: IalUnit | undefined = activePreview
    ? IAL_UNITS.find((u) => u.code === activePreview.unitCode)
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette and specification index"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_EXPO }}
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-16 sm:pt-24"
          style={{ backgroundColor: 'rgba(6, 5, 9, 0.72)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--ink)',
            }}
          >
            {/* Search Header */}
            <div
              className="flex items-center gap-3 border-b px-4 py-3.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <Search
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--accent)' }}
                aria-hidden="true"
              />
              <label htmlFor="ial-command-search" className="sr-only">
                Filter units and specification topics
              </label>
              <input
                ref={inputRef}
                id="ial-command-search"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActivePreview(null);
                }}
                placeholder="Jump to WCH11–WCH16, Hess's Law, Buffers, Practicals..."
                className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
                style={{ color: 'var(--ink)' }}
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:opacity-80 shrink-0"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--ink-muted)',
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Active Selection Preview OR Scrollable Filtered List */}
            {activePreview && previewUnit ? (
              <div className="p-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div
                      className="flex items-center gap-2 font-mono text-xs tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      <span>{activePreview.code}</span>
                      <span aria-hidden="true">·</span>
                      <span>{previewUnit.shortLabel}</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {activePreview.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                      {previewUnit.scope}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    className="rounded-full border px-3 py-1.5 font-mono text-xs whitespace-nowrap shrink-0"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    Back to index
                  </button>
                </div>

                <div
                  className="rounded-xl border p-4 space-y-2.5"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--ink-muted)' }}>
                    <span>Specification Coverage</span>
                    <span className="tabular-nums">
                      {previewUnit.topicsCount} topics · {previewUnit.minutes} min
                    </span>
                  </div>
                  <ul className="space-y-2 pt-1">
                    {previewUnit.sampleTopics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-center justify-between border-t pt-2 text-xs"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span style={{ color: 'var(--ink)' }}>{topic}</span>
                        <span className="font-mono text-[10px]" style={{ color: 'var(--ink-muted)' }}>
                          Indexed
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onJumpToAnchor('#workflow');
                    }}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--ink)',
                    }}
                  >
                    <span>Assemble in Pack Builder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onJumpToAnchor('#units');
                    }}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--ink)',
                      color: 'var(--bg)',
                    }}
                  >
                    <span>View {previewUnit.code} in Matrix</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto p-2" data-lenis-prevent>
                {filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-medium">No matching units or topics.</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
                      Try searching WCH11, Hess, Uncertainty, Equilibria, or Arenes.
                    </p>
                  </div>
                ) : (
                  <ul role="listbox" aria-label="Search results" className="space-y-1">
                    {filtered.map((entry, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <li key={entry.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => setActivePreview(entry)}
                            className="flex w-full items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-left transition-colors"
                            style={{
                              backgroundColor: active
                                ? 'var(--surface-elevated)'
                                : 'transparent',
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="font-mono text-xs font-medium tabular-nums shrink-0"
                                  style={{
                                    color: active ? 'var(--accent)' : 'var(--ink-muted)',
                                  }}
                                >
                                  {entry.code}
                                </span>
                                <span className="truncate text-sm font-medium">
                                  {entry.title}
                                </span>
                              </div>
                              <p
                                className="mt-0.5 truncate text-xs"
                                style={{ color: 'var(--ink-muted)' }}
                              >
                                {entry.unitTitle} · {entry.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className="font-mono text-[11px] tabular-nums"
                                style={{ color: 'var(--ink-muted)' }}
                              >
                                {entry.minutes} min
                              </span>
                              {active && (
                                <CornerDownLeft
                                  className="h-3.5 w-3.5"
                                  style={{ color: 'var(--accent)' }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Footer Key Hint */}
            <div
              className="flex items-center justify-between border-t px-4 py-2.5 font-mono text-[11px]"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--ink-muted)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <span>↑↓ Navigate · Enter Inspect</span>
              <span className="tabular-nums">{filtered.length} indexed entries · Esc</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
