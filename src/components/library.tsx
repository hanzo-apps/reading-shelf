import type { ReactNode } from 'react'
import { YStack, XStack, Text } from '@hanzo/gui'
import {
  type Spineable,
  type Status,
  STATUS_BY_KEY,
  spineColor,
  clampPct,
  SERIF,
  ink,
  inkSoft,
  cardCream,
  wood,
  woodDark,
  gold,
  accent,
  line,
} from '../lib/shelf'

/**
 * The Reading Shelf design kit — pure presentation, no data. A book renders as
 * a hardcover SPINE standing on a wooden LEDGE; titles run down the spine in
 * warm serif with foil bands, the way a real shelf reads. Reused by the
 * signed-out sample library and the signed-in app so both look identical.
 */

const SPINE_W = 66
const SPINE_H = 214

/** A single book, drawn as a hardcover spine standing on the shelf. */
export function Spine({ book, onPress }: { book: Spineable; onPress?: () => void }) {
  const color = spineColor(book.title)
  const pct = clampPct(Number(book.progress) || 0)
  const interactive = !!onPress
  return (
    <YStack
      width={SPINE_W}
      height={SPINE_H}
      backgroundColor={color}
      borderTopLeftRadius={4}
      borderTopRightRadius={4}
      borderBottomLeftRadius={2}
      borderBottomRightRadius={2}
      borderLeftWidth={4}
      borderLeftColor="rgba(255,255,255,0.14)"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      shadowColor="#2a170b"
      shadowOpacity={0.34}
      shadowRadius={7}
      shadowOffset={{ width: 3, height: 5 }}
      cursor={interactive ? 'pointer' : 'default'}
      hoverStyle={interactive ? { y: -8 } : undefined}
      pressStyle={interactive ? { y: -3 } : undefined}
      onPress={onPress}
    >
      {/* foil head/tail bands, like a bound hardcover */}
      <YStack position="absolute" top={14} left={9} right={9} height={2} backgroundColor={gold} opacity={0.85} />
      <YStack position="absolute" top={19} left={9} right={9} height={1} backgroundColor={gold} opacity={0.45} />
      <YStack position="absolute" bottom={24} left={9} right={9} height={2} backgroundColor={gold} opacity={0.85} />

      {/* the title reads down the spine */}
      <XStack width={SPINE_H} height={SPINE_W} alignItems="center" justifyContent="center" rotate="90deg">
        <YStack width={182} alignItems="center" gap={3}>
          <Text style={{ fontFamily: SERIF }} color="#f6ecd6" fontSize={15} fontWeight="700" textAlign="center" numberOfLines={2}>
            {book.title}
          </Text>
          <Text color="rgba(246,236,214,0.72)" fontSize={11} textAlign="center" numberOfLines={1}>
            {book.author}
          </Text>
        </YStack>
      </XStack>

      {/* foot: a progress rail while reading, a gilt dot once finished */}
      {book.status === 'reading' ? (
        <YStack position="absolute" bottom={0} left={0} right={0} height={6} backgroundColor="rgba(0,0,0,0.30)">
          <YStack height={6} width={`${pct}%`} backgroundColor={gold} />
        </YStack>
      ) : book.status === 'finished' ? (
        <YStack position="absolute" bottom={7} alignSelf="center" width={13} height={13} borderRadius={7} backgroundColor={gold} alignItems="center" justifyContent="center">
          <Text fontSize={9} fontWeight="900" color={color}>
            ✓
          </Text>
        </YStack>
      ) : null}
    </YStack>
  )
}

/** A labelled shelf: books stand in a row on a wooden ledge. */
export function Shelf({
  label,
  hint,
  children,
  empty,
}: {
  label?: string
  hint?: string
  children: ReactNode
  empty?: ReactNode
}) {
  return (
    <YStack gap="$3">
      {label ? (
        <XStack alignItems="flex-end" justifyContent="space-between" paddingHorizontal={4}>
          <Text style={{ fontFamily: SERIF }} color={ink} fontSize={20} fontWeight="700">
            {label}
          </Text>
          {hint ? (
            <Text color={inkSoft} fontSize={13}>
              {hint}
            </Text>
          ) : null}
        </XStack>
      ) : null}
      <YStack>
        <XStack flexWrap="wrap" gap="$4" alignItems="flex-end" minHeight={SPINE_H} paddingHorizontal={10} paddingBottom={2}>
          {children}
          {empty}
        </XStack>
        {/* the ledge the books stand on */}
        <YStack
          height={18}
          backgroundColor={wood}
          borderTopLeftRadius={2}
          borderTopRightRadius={2}
          borderBottomWidth={5}
          borderBottomColor={woodDark}
          shadowColor="#2a170b"
          shadowOpacity={0.3}
          shadowRadius={10}
          shadowOffset={{ width: 0, height: 8 }}
        />
        <YStack height={5} backgroundColor={woodDark} borderBottomLeftRadius={4} borderBottomRightRadius={4} opacity={0.85} />
      </YStack>
    </YStack>
  )
}

/** Framed cream card — the panel a shelf or form sits in. */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <YStack
      backgroundColor={cardCream}
      borderRadius={16}
      borderWidth={1}
      borderColor={line}
      padding="$5"
      gap="$5"
      shadowColor="#2a170b"
      shadowOpacity={0.12}
      shadowRadius={24}
      shadowOffset={{ width: 0, height: 12 }}
    >
      {children}
    </YStack>
  )
}

/** A reading-status badge with a colour dot. */
export function StatusPill({ status }: { status: Status }) {
  const meta = STATUS_BY_KEY[status]
  return (
    <XStack alignItems="center" gap="$2" paddingHorizontal={12} paddingVertical={5} borderRadius={999} backgroundColor={meta.wash} borderWidth={1} borderColor={meta.tint}>
      <YStack width={8} height={8} borderRadius={4} backgroundColor={meta.tint} />
      <Text color={meta.tint} fontSize={12} fontWeight="700">
        {meta.label}
      </Text>
    </XStack>
  )
}

/** A pill toggle used for filters and status/segment pickers. */
export function Chip({
  label,
  active,
  tint = accent,
  onPress,
}: {
  label: string
  active: boolean
  tint?: string
  onPress: () => void
}) {
  return (
    <XStack
      onPress={onPress}
      cursor="pointer"
      alignItems="center"
      gap="$2"
      paddingHorizontal={14}
      paddingVertical={8}
      borderRadius={999}
      backgroundColor={active ? tint : 'transparent'}
      borderWidth={1}
      borderColor={active ? tint : line}
      hoverStyle={{ backgroundColor: active ? tint : 'rgba(122,86,56,0.10)' }}
    >
      <Text color={active ? cardCream : ink} fontSize={13} fontWeight="600">
        {label}
      </Text>
    </XStack>
  )
}

/**
 * A button, composed from primitives so text + fill colours are fully under our
 * control (the gui Button frames its own text and takes design tokens only).
 */
export function Btn({
  label,
  onPress,
  tone = 'solid',
  tint = accent,
  size = 'md',
  textColor,
  disabled = false,
  alignSelf = 'flex-start',
}: {
  label: string
  onPress: () => void
  tone?: 'solid' | 'outline' | 'ghost'
  tint?: string
  size?: 'sm' | 'md' | 'lg'
  textColor?: string
  disabled?: boolean
  alignSelf?: 'flex-start' | 'center' | 'flex-end'
}) {
  const solid = tone === 'solid'
  const px = size === 'lg' ? 24 : size === 'sm' ? 12 : 17
  const py = size === 'lg' ? 12 : size === 'sm' ? 7 : 10
  const fs = size === 'lg' ? 17 : size === 'sm' ? 13 : 15
  return (
    <XStack
      onPress={disabled ? undefined : onPress}
      cursor={disabled ? 'default' : 'pointer'}
      opacity={disabled ? 0.55 : 1}
      alignSelf={alignSelf}
      alignItems="center"
      justifyContent="center"
      gap="$2"
      paddingHorizontal={tone === 'ghost' ? 4 : px}
      paddingVertical={py}
      borderRadius={999}
      backgroundColor={solid ? tint : 'transparent'}
      borderWidth={tone === 'outline' ? 1 : 0}
      borderColor={tone === 'outline' ? tint : 'transparent'}
      hoverStyle={disabled ? undefined : { opacity: solid ? 0.9 : 0.7, backgroundColor: solid ? tint : tone === 'outline' ? 'rgba(122,86,56,0.08)' : 'transparent' }}
      pressStyle={disabled ? undefined : { opacity: 0.72 }}
    >
      <Text color={textColor ?? (solid ? cardCream : tint)} fontSize={fs} fontWeight="700">
        {label}
      </Text>
    </XStack>
  )
}

/** A slim progress rail. */
export function ProgressBar({ pct, tint = accent }: { pct: number; tint?: string }) {
  return (
    <YStack height={10} borderRadius={999} backgroundColor="rgba(122,86,56,0.18)" overflow="hidden">
      <YStack height={10} width={`${clampPct(pct)}%`} backgroundColor={tint} borderRadius={999} />
    </YStack>
  )
}

/** The wordmark glyph — three little spines on a shelf. */
export function Mark({ size = 22 }: { size?: number }) {
  const bars = [accent, '#3f5e46', '#9a6a1e']
  return (
    <XStack alignItems="flex-end" gap={2}>
      {bars.map((c, i) => (
        <YStack key={i} width={size * 0.26} height={size * (i === 1 ? 1 : 0.82)} backgroundColor={c} borderRadius={2} />
      ))}
    </XStack>
  )
}
