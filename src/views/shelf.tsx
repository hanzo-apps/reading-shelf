import { useState } from 'react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Spinner } from '@hanzo/gui'
import { Spine, Shelf, Chip, Panel, Btn } from '../components/library'
import { AddBook } from './add-book'
import { BookDetail } from './book-detail'
import { type Book, type Status, STATUSES, view, SERIF, ink, inkSoft, accent } from '../lib/shelf'

type Filter = Status | 'all'

/**
 * The signed-in library. Three views over the org-scoped `books` collection,
 * switched by local state (no router — one static SPA):
 *   grid    → shelves of spines, filtered by status
 *   detail  → open a book to read/edit progress, status and notes
 *   add     → shelve a new book
 * Each write refetches; realtime is off (one simple path for a static site).
 */
export function Bookshelf() {
  const { data, isLoading, error, refetch } = useQuery<Book>('books', { sort: '-created', realtime: false })
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const books = data.map(view)
  const selected = books.find((b) => b.id === selectedId) ?? null

  if (adding) {
    return (
      <AddBook
        onCancel={() => setAdding(false)}
        onDone={async () => {
          setAdding(false)
          await refetch()
        }}
      />
    )
  }

  if (selected) {
    return (
      <BookDetail
        book={selected}
        onBack={() => setSelectedId(null)}
        onChanged={refetch}
        onDeleted={async () => {
          setSelectedId(null)
          await refetch()
        }}
      />
    )
  }

  const groups = STATUSES.map((meta) => ({ meta, items: books.filter((b) => b.status === meta.key) }))
  const visible = filter === 'all' ? groups : groups.filter((g) => g.meta.key === filter)

  return (
    <YStack gap="$5">
      {/* toolbar: filters + add */}
      <XStack flexWrap="wrap" alignItems="center" justifyContent="space-between" gap="$3">
        <XStack flexWrap="wrap" alignItems="center" gap="$2">
          <Chip label={`All · ${books.length}`} active={filter === 'all'} onPress={() => setFilter('all')} />
          {STATUSES.map((s) => (
            <Chip
              key={s.key}
              label={`${s.label} · ${groups.find((g) => g.meta.key === s.key)?.items.length ?? 0}`}
              active={filter === s.key}
              tint={s.tint}
              onPress={() => setFilter(s.key)}
            />
          ))}
        </XStack>
        <Btn label="+ Add a book" onPress={() => setAdding(true)} />
      </XStack>

      {isLoading ? (
        <XStack alignItems="center" gap="$3" paddingVertical="$6">
          <Spinner color={accent} />
          <Text color={inkSoft}>Pulling books off the shelf…</Text>
        </XStack>
      ) : error ? (
        <Panel>
          <Text style={{ fontFamily: SERIF }} color={ink} fontSize={18} fontWeight="700">
            Couldn’t reach your shelf
          </Text>
          <Text color={inkSoft}>
            {error.message}. Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Text>
        </Panel>
      ) : books.length === 0 ? (
        <Panel>
          <YStack alignItems="center" gap="$4" paddingVertical="$6">
            <Text style={{ fontFamily: SERIF }} color={ink} fontSize={26} fontWeight="700" textAlign="center">
              Your shelf is empty
            </Text>
            <Text color={inkSoft} fontSize={16} textAlign="center" maxWidth={420}>
              Add the first book you’re reading — or one you’ve been meaning to start —
              and it’ll appear on the shelf below.
            </Text>
            <Btn label="Shelve your first book" onPress={() => setAdding(true)} size="lg" alignSelf="center" />
          </YStack>
        </Panel>
      ) : (
        <Panel>
          {visible.map((g) => (
            <Shelf
              key={g.meta.key}
              label={g.meta.shelf}
              hint={g.items.length ? `${g.items.length} ${g.items.length === 1 ? 'book' : 'books'}` : undefined}
              empty={
                g.items.length === 0 ? (
                  <YStack alignSelf="center" paddingVertical="$6">
                    <Text color={inkSoft} opacity={0.8}>
                      Nothing on this shelf yet.
                    </Text>
                  </YStack>
                ) : undefined
              }
            >
              {g.items.map((b) => (
                <Spine key={b.id} book={b} onPress={() => setSelectedId(b.id)} />
              ))}
            </Shelf>
          ))}
        </Panel>
      )}
    </YStack>
  )
}
