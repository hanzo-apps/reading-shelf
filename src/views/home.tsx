import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { Mark, Btn } from '../components/library'
import { Bookshelf } from './shelf'
import { SERIF, ink, inkSoft, wood, line, parchment, parchmentDeep } from '../lib/shelf'

/** Signed-in shell: the library chrome (wordmark + who + sign out) over the shelf. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  return (
    <YStack
      flex={1}
      minHeight="100vh"
      backgroundColor={parchment}
      style={{ backgroundImage: `linear-gradient(180deg, ${parchment} 0%, ${parchmentDeep} 100%)` }}
    >
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$5" paddingVertical="$4" borderBottomWidth={1} borderColor={line} backgroundColor="rgba(253,247,234,0.55)">
          <XStack alignItems="center" gap="$3">
            <Mark size={22} />
            <Text style={{ fontFamily: SERIF }} color={ink} fontSize={22} fontWeight="700">
              Reading Shelf
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$3">
            <Text color={inkSoft} fontSize={13} numberOfLines={1}>
              {who}
            </Text>
            <Btn label="Sign out" onPress={() => logout()} tone="outline" tint={inkSoft} textColor={ink} size="sm" />
          </XStack>
        </XStack>

        <YStack flex={1} alignItems="center" paddingHorizontal="$4" paddingVertical="$6">
          <YStack width="100%" maxWidth={1040}>
            <Bookshelf />
          </YStack>
        </YStack>

        <XStack justifyContent="center" paddingVertical="$4">
          <Text color={wood} fontSize={12} opacity={0.7}>
            Kept on Hanzo Base · scoped to your org
          </Text>
        </XStack>
    </YStack>
  )
}
