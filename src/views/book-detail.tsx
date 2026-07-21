import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Input } from '@hanzo/gui'
import { Btn, Chip, ProgressBar, StatusPill, Panel } from '../components/library'
import {
  type Book,
  type Status,
  STATUSES,
  STATUS_BY_KEY,
  spineColor,
  clampPct,
  SERIF,
  ink,
  inkSoft,
  accent,
  gold,
  line,
} from '../lib/shelf'

/**
 * Book detail — open a book to read and edit it. Status, progress and notes are
 * edited locally and saved together against the org-scoped `books` collection
 * (useMutation update); Delete removes it. Back returns to the shelf grid.
 */
export function BookDetail({
  book,
  onBack,
  onChanged,
  onDeleted,
}: {
  book: Book
  onBack: () => void
  onChanged: () => Promise<unknown> | void
  onDeleted: () => Promise<unknown> | void
}) {
  const update = useMutation('books', 'update')
  const remove = useMutation('books', 'delete')

  const [status, setStatus] = useState<Status>(book.status)
  const [progress, setProgress] = useState<number>(book.progress)
  const [notes, setNotes] = useState<string>(book.notes)

  const color = spineColor(book.title)
  const dirty = status !== book.status || progress !== book.progress || notes !== book.notes
  const step = (d: number) => setProgress((p) => clampPct(p + d))

  async function save() {
    if (!dirty || update.isLoading) return
    await update.mutate({ id: book.id, status, progress, notes })
    await onChanged()
  }

  async function finish() {
    setStatus('finished')
    setProgress(100)
  }

  async function del() {
    if (remove.isLoading) return
    await remove.mutate({ id: book.id })
    await onDeleted()
  }

  return (
    <YStack gap="$4">
      <XStack alignItems="center" justifyContent="space-between">
        <Btn label="← Back to shelf" onPress={onBack} tone="ghost" textColor={inkSoft} />
        <Btn label={remove.isLoading ? 'Removing…' : 'Remove'} onPress={del} tone="ghost" textColor={STATUS_BY_KEY.reading.tint} disabled={remove.isLoading} alignSelf="flex-end" />
      </XStack>

      <Panel>
        <XStack flexWrap="wrap" gap="$7" alignItems="flex-start">
          {/* cover */}
          <YStack alignItems="center" gap="$3" width={168}>
            <YStack
              width={168}
              height={244}
              backgroundColor={color}
              borderRadius={6}
              borderLeftWidth={6}
              borderLeftColor="rgba(0,0,0,0.18)"
              padding={16}
              justifyContent="space-between"
              shadowColor="#2a170b"
              shadowOpacity={0.34}
              shadowRadius={12}
              shadowOffset={{ width: 4, height: 8 }}
            >
              <YStack height={3} backgroundColor={gold} opacity={0.85} borderRadius={2} />
              <YStack gap="$2" alignItems="center">
                <Text style={{ fontFamily: SERIF }} color="#f6ecd6" fontSize={19} fontWeight="700" textAlign="center" numberOfLines={4}>
                  {book.title}
                </Text>
                <Text color="rgba(246,236,214,0.72)" fontSize={13} textAlign="center" numberOfLines={2}>
                  {book.author}
                </Text>
              </YStack>
              <YStack height={3} backgroundColor={gold} opacity={0.85} borderRadius={2} />
            </YStack>
            <StatusPill status={status} />
          </YStack>

          {/* fields */}
          <YStack flex={1} minWidth={280} gap="$5">
            <YStack gap="$1">
              <Text style={{ fontFamily: SERIF }} color={ink} fontSize={28} fontWeight="700">
                {book.title || 'Untitled'}
              </Text>
              {book.author ? (
                <Text color={inkSoft} fontSize={16}>
                  by {book.author}
                </Text>
              ) : null}
            </YStack>

            <YStack gap="$2">
              <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
                Shelf
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {STATUSES.map((s) => (
                  <Chip key={s.key} label={s.label} active={status === s.key} tint={s.tint} onPress={() => setStatus(s.key)} />
                ))}
              </XStack>
            </YStack>

            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
                  Progress
                </Text>
                <Text style={{ fontFamily: SERIF }} color={ink} fontSize={18} fontWeight="700">
                  {progress}%
                </Text>
              </XStack>
              <ProgressBar pct={progress} tint={STATUS_BY_KEY[status].tint} />
              <XStack flexWrap="wrap" alignItems="center" gap="$2">
                <Chip label="−10%" active={false} onPress={() => step(-10)} />
                <Chip label="+10%" active={false} onPress={() => step(10)} />
                {[0, 25, 50, 75, 100].map((v) => (
                  <Chip key={v} label={`${v}%`} active={progress === v} onPress={() => setProgress(v)} />
                ))}
                <Chip label="Mark finished" active onPress={finish} tint={STATUS_BY_KEY.finished.tint} />
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
                Notes
              </Text>
              <Input
                multiline
                numberOfLines={5}
                height={128}
                value={notes}
                onChangeText={setNotes}
                placeholder="Favourite lines, where you left off, what to read next…"
                textAlignVertical="top"
                backgroundColor="#fffdf7"
                borderColor={line}
                color={ink}
                paddingHorizontal={12}
                paddingVertical={10}
                focusStyle={{ borderColor: accent }}
              />
            </YStack>

            {update.error ? (
              <Text color={STATUS_BY_KEY.reading.tint}>{update.error.message}</Text>
            ) : null}

            <XStack gap="$3" alignItems="center">
              <Btn
                label={update.isLoading ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
                onPress={save}
                disabled={!dirty || update.isLoading}
              />
              {dirty ? (
                <Text color={inkSoft} fontSize={13}>
                  Unsaved changes
                </Text>
              ) : null}
            </XStack>
          </YStack>
        </XStack>
      </Panel>
    </YStack>
  )
}
