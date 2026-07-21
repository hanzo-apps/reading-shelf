import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { Spine, Shelf, Panel, Mark, Btn } from '../components/library'
import { SAMPLE, SERIF, ink, inkSoft, parchment, parchmentDeep } from '../lib/shelf'

/**
 * Signed-out landing — the cozy library. One action: PKCE sign-in with Hanzo
 * (hanzo.id); there is no local credential form, IAM owns every credential
 * interaction. A sample shelf previews the app so the door is inviting.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()
  const reading = SAMPLE.filter((b) => b.status === 'reading')
  const wishlist = SAMPLE.filter((b) => b.status === 'want')
  const finished = SAMPLE.filter((b) => b.status === 'finished')

  return (
    <YStack
      flex={1}
      minHeight="100vh"
      backgroundColor={parchment}
      style={{ backgroundImage: `linear-gradient(180deg, ${parchment} 0%, ${parchmentDeep} 100%)` }}
      alignItems="center"
      paddingHorizontal="$4"
      paddingVertical="$8"
    >
      <YStack width="100%" maxWidth={1060} gap="$7">
        {/* hero */}
        <YStack alignItems="center" gap="$4">
          <XStack alignItems="center" gap="$3">
            <Mark size={26} />
            <Text style={{ fontFamily: SERIF }} color={inkSoft} fontSize={14} letterSpacing={3} textTransform="uppercase">
              A Hanzo Library
            </Text>
          </XStack>
          <Text style={{ fontFamily: SERIF }} color={ink} fontSize={56} fontWeight="700" textAlign="center" lineHeight={60}>
            Reading Shelf
          </Text>
          <Text color={inkSoft} fontSize={18} textAlign="center" maxWidth={620} lineHeight={27}>
            A warm, private home for your books. Track what you’re reading, what you
            want next, and everything you’ve finished — with progress and notes kept
            on your own shelf.
          </Text>
          <Btn label={isLoading ? 'Opening…' : 'Open your shelf'} onPress={() => login()} size="lg" alignSelf="center" disabled={isLoading} />
          <Text color={inkSoft} fontSize={13} opacity={0.85}>
            Sign in with Hanzo · your library stays scoped to you
          </Text>
        </YStack>

        {/* sample shelves preview */}
        <Panel>
          <Shelf label="Currently Reading" hint={`${reading.length} in progress`}>
            {reading.concat(wishlist).map((b) => (
              <Spine key={b.title} book={b} />
            ))}
          </Shelf>
          <Shelf label="Finished" hint="read this year">
            {finished.map((b) => (
              <Spine key={b.title} book={b} />
            ))}
          </Shelf>
        </Panel>
      </YStack>
    </YStack>
  )
}
