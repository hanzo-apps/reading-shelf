import type { BaseRecord } from '@hanzo/base/react'

/**
 * Reading Shelf — the domain in one place: the `books` row shape, the three
 * reading statuses, the cozy-library palette, and the deterministic spine
 * colour every book is drawn with. Views and the presentational kit import
 * from here so the data contract (schema.sql) and the look stay in lockstep.
 */

export type Status = 'reading' | 'want' | 'finished'

/** One row of the `books` collection provisioned from schema.sql. */
export interface Book extends BaseRecord {
  title: string
  author: string
  status: Status
  progress: number
  notes: string
}

/** Enough of a book to draw a spine — satisfied by a Book and by SAMPLE. */
export interface Spineable {
  title: string
  author: string
  status: Status
  progress: number
}

export interface StatusMeta {
  key: Status
  label: string
  shelf: string
  tint: string
  wash: string
}

/** The three shelves, in reading order. */
export const STATUSES: StatusMeta[] = [
  { key: 'reading', label: 'Reading', shelf: 'Currently Reading', tint: '#8c3b2b', wash: 'rgba(140,59,43,0.12)' },
  { key: 'want', label: 'Want to Read', shelf: 'Want to Read', tint: '#9a6a1e', wash: 'rgba(154,106,30,0.12)' },
  { key: 'finished', label: 'Finished', shelf: 'Finished', tint: '#3f5e46', wash: 'rgba(63,94,70,0.12)' },
]

export const STATUS_BY_KEY: Record<Status, StatusMeta> = {
  reading: STATUSES[0],
  want: STATUSES[1],
  finished: STATUSES[2],
}

// --- Cozy-library palette (explicit, so the look is fixed independent of theme) ---
export const ink = '#3a2a1c'
export const inkSoft = '#7c6650'
export const parchment = '#f7efdd'
export const parchmentDeep = '#e9d7b6'
export const cardCream = '#fdf7ea'
export const wood = '#7c5636'
export const woodDark = '#553621'
export const gold = '#c39a4d'
export const accent = '#8c3b2b'
export const line = 'rgba(122,86,56,0.22)'

/** Warm serif stack for the wordmark, shelf labels and book titles. */
export const SERIF =
  'Georgia, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif'

/** Rich book-cloth colours a spine is drawn in, chosen deterministically. */
const SPINES = [
  '#7c3a2d', // brick red
  '#3f5e46', // forest green
  '#33475e', // slate navy
  '#8a6320', // ochre leather
  '#6a4a5b', // plum
  '#a2542f', // terracotta
  '#4a5340', // olive
  '#514a6b', // muted indigo
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** A stable spine colour for a title (same book, same colour, every render). */
export function spineColor(seed: string): string {
  return SPINES[hash(seed || 'book') % SPINES.length]
}

/** 0..100, rounded — reading progress is always a clean percentage. */
export const clampPct = (n: number): number => Math.max(0, Math.min(100, Math.round(n)))

/** Coerce a raw Base row into a display-safe book (values, not trust). */
export function view(b: Book): Book {
  const status: Status =
    b.status === 'reading' || b.status === 'finished' ? b.status : 'want'
  return {
    ...b,
    title: typeof b.title === 'string' ? b.title : '',
    author: typeof b.author === 'string' ? b.author : '',
    status,
    progress: clampPct(Number(b.progress) || 0),
    notes: typeof b.notes === 'string' ? b.notes : '',
  }
}

/** A sample library for the signed-out landing (decorative only). */
export const SAMPLE: Spineable[] = [
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', status: 'reading', progress: 62 },
  { title: 'Piranesi', author: 'Susanna Clarke', status: 'reading', progress: 28 },
  { title: 'The Overstory', author: 'Richard Powers', status: 'reading', progress: 45 },
  { title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', status: 'want', progress: 0 },
  { title: 'The Name of the Rose', author: 'Umberto Eco', status: 'want', progress: 0 },
  { title: 'Circe', author: 'Madeline Miller', status: 'want', progress: 0 },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', status: 'finished', progress: 100 },
  { title: 'Dune', author: 'Frank Herbert', status: 'finished', progress: 100 },
  { title: 'Norwegian Wood', author: 'Haruki Murakami', status: 'finished', progress: 100 },
]
