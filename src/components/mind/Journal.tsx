"use client";

import { useEffect, useState } from "react";
import { dailySeed } from "@/lib/seed";
import {
  journalEntryFor,
  saveJournalEntry,
  searchJournalEntries,
  type JournalEntry,
} from "@/lib/journal";
import { MOOD_LABEL_EL, type MoodOption } from "@/lib/mood";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-lavender/60 focus:outline-none";

export function Journal({ todayMood }: { todayMood: MoodOption | null }) {
  const [text, setText] = useState("");
  const [linkMood, setLinkMood] = useState(true);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    async function init() {
      const today = journalEntryFor();
      if (today) {
        setText(today.text);
        setLinkMood(today.linkedMood);
      }
      setEntries(searchJournalEntries(""));
    }
    init();
  }, []);

  useEffect(() => {
    async function refresh() {
      setEntries(searchJournalEntries(query));
    }
    refresh();
  }, [query]);

  function handleSave() {
    if (!text.trim()) return;
    saveJournalEntry(text.trim(), linkMood, dailySeed());
    setSaved(true);
    setEntries(searchJournalEntries(query));
  }

  return (
    <Card tone="lavender" className="flex flex-col gap-3">
      <div>
        <p className="font-display text-sm font-semibold text-clay">Ημερολόγιο</p>
        <p className="text-xs text-ink/50">Ιδιωτικό, μόνο στη συσκευή σου. Μία καταχώρηση τη μέρα.</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Γράψε ό,τι θέλεις..."
        className={`${inputClass} resize-none`}
      />

      {todayMood && (
        <label className="flex items-center gap-2 text-xs text-ink/60">
          <input type="checkbox" checked={linkMood} onChange={(e) => setLinkMood(e.target.checked)} />
          Σύνδεση με τη σημερινή διάθεση ({MOOD_LABEL_EL[todayMood]})
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-lavender px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={!text.trim()}
        >
          Αποθήκευση
        </button>
        {saved && <p className="text-xs text-ink/40">Αποθηκεύτηκε.</p>}
        <button
          type="button"
          onClick={() => setShowArchive((v) => !v)}
          className="ml-auto text-xs text-clay/70 underline"
        >
          {showArchive ? "Απόκρυψη αρχείου" : "Παλιότερες καταχωρήσεις"}
        </button>
      </div>

      {showArchive && (
        <div className="flex flex-col gap-2 border-t border-lavender/30 pt-3">
          <input
            className={inputClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Αναζήτηση..."
          />
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {entries.length === 0 && <p className="text-xs text-ink/40">Καμία καταχώρηση ακόμα.</p>}
            {entries.map((entry) => (
              <div key={entry.date} className="rounded-xl bg-white/60 px-3 py-2">
                <p className="text-xs text-ink/40">{entry.date}</p>
                <p className="text-sm text-ink/80">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
