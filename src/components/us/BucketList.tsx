"use client";

import { useEffect, useState } from "react";
import { loadBucketList, addBucketItem, toggleBucketItem, deleteBucketItem, type BucketItem } from "@/lib/bucketList";
import { Card } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-xl border border-sand bg-white/70 px-3 py-2 text-sm text-ink focus:border-blossom/60 focus:outline-none";

export function BucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function init() {
      setItems(loadBucketList());
    }
    init();
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setItems(addBucketItem(text.trim()));
    setText("");
  }

  return (
    <Card tone="blossom" className="flex flex-col gap-3">
      <p className="font-display text-sm font-semibold text-clay">Λίστα ονείρων</p>

      <div className="flex flex-col gap-1.5">
        {items.length === 0 && <p className="text-xs text-ink/50">Τίποτα ακόμα - πρόσθεσε κάτι που θέλετε να κάνετε μαζί.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => setItems(toggleBucketItem(item.id))}
            />
            <span className={`flex-1 text-sm ${item.done ? "text-ink/40 line-through" : "text-ink"}`}>{item.text}</span>
            <button
              type="button"
              onClick={() => setItems(deleteBucketItem(item.id))}
              className="text-xs text-ink/40"
              aria-label="Διαγραφή"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className={inputClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Κάτι που θέλουμε να ζήσουμε..."
        />
        <button type="submit" className="shrink-0 rounded-xl bg-blossom px-4 py-2 text-sm text-white">
          +
        </button>
      </form>
    </Card>
  );
}
