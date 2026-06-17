import { nanoid } from 'nanoid';

export function generateId(prefix: string = ''): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'SUMO-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function calcShipping(subtotal: number): number {
  return subtotal >= 500 ? 0 : 60;
}

export function calcTax(subtotal: number): number {
  return Math.round(subtotal * 0.05 * 100) / 100;
}
