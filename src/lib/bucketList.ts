import { getItem, setItem } from "@/lib/storage";

export interface BucketItem {
  id: string;
  text: string;
  done: boolean;
}

const BUCKET_KEY = "us:bucketList";

export function loadBucketList(): BucketItem[] {
  return getItem<BucketItem[]>(BUCKET_KEY, []);
}

export function addBucketItem(text: string): BucketItem[] {
  const next = [...loadBucketList(), { id: `${Date.now()}`, text, done: false }];
  setItem(BUCKET_KEY, next);
  return next;
}

export function toggleBucketItem(id: string): BucketItem[] {
  const next = loadBucketList().map((item) => (item.id === id ? { ...item, done: !item.done } : item));
  setItem(BUCKET_KEY, next);
  return next;
}

export function deleteBucketItem(id: string): BucketItem[] {
  const next = loadBucketList().filter((item) => item.id !== id);
  setItem(BUCKET_KEY, next);
  return next;
}
