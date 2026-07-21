import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Input } from '@hanzo/gui'
import { Btn, Chip, Panel } from '../components/library'
import { type Status, STATUSES, SERIF, ink, inkSoft, accent, line } from '../lib/shelf'

/**
 * Add a book — shelve a new title. Writes one row to the org-scoped `books`
 * collection (useMutation create); Base stamps owner+org from the IAM token.
 * Progress starts at 0, or 100 when it goes straight onto the Finished shelf.
 */
export function AddBook({ onDone, onCancel }: { onDone: () => Promise<unknown> | void; onCancel: () => void }) {
  const create = useMutation('books', 'create')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<Status>('want')
  const [notes, setNotes] = useState('')

  const canSave = !!title.trim() && !create.isLoading

  async function save() {
    if (!canSave) return
    await create.mutate({
      title: title.trim(),
      author: author.trim(),
      status,
      progress: status === 'finished' ? 100 : 0,
      notes: notes.trim(),
    })
    await onDone()
  }

  const field = {
    backgroundColor: '#fffdf7',
    borderColor: line,
    color: ink,
    paddingHorizontal: 12,
  } as const

  return (
    <YStack gap="$4">
      <Btn label="← Back to shelf" onPress={onCancel} tone="ghost" textColor={inkSoft} />

      <Panel>
        <YStack gap="$1">
          <Text style={{ fontFamily: SERIF }} color={ink} fontSize={28} fontWeight="700">
            Add a book
          </Text>
          <Text color={inkSoft} fontSize={15}>
            Shelve something you’re reading, want to read, or have finished.
          </Text>
        </YStack>

        <YStack gap="$2" maxWidth={520}>
          <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
            Title
          </Text>
          <Input {...field} value={title} onChangeText={setTitle} placeholder="The Left Hand of Darkness" onSubmitEditing={save} focusStyle={{ borderColor: accent }} />
        </YStack>

        <YStack gap="$2" maxWidth={520}>
          <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
            Author
          </Text>
          <Input {...field} value={author} onChangeText={setAuthor} placeholder="Ursula K. Le Guin" onSubmitEditing={save} focusStyle={{ borderColor: accent }} />
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

        <YStack gap="$2" maxWidth={520}>
          <Text color={inkSoft} fontSize={13} textTransform="uppercase" letterSpacing={1}>
            Notes <Text color={inkSoft} opacity={0.7}>(optional)</Text>
          </Text>
          <Input
            {...field}
            multiline
            numberOfLines={4}
            height={110}
            value={notes}
            onChangeText={setNotes}
            placeholder="Why it’s on the shelf…"
            textAlignVertical="top"
            paddingVertical={10}
            focusStyle={{ borderColor: accent }}
          />
        </YStack>

        {create.error ? <Text color={STATUSES[0].tint}>{create.error.message}</Text> : null}

        <XStack gap="$3" alignItems="center">
          <Btn label={create.isLoading ? 'Shelving…' : 'Add to shelf'} onPress={save} disabled={!canSave} />
          <Btn label="Cancel" onPress={onCancel} tone="ghost" textColor={inkSoft} />
        </XStack>
      </Panel>
    </YStack>
  )
}
