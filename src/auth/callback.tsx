import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner, Text } from '@hanzo/gui'
import { Btn } from '../components/library'
import { parchment, inkSoft, accent } from '../lib/shelf'

/**
 * The PKCE return leg. hanzo.id redirects here with `?code=&state=`; the SDK
 * exchanges the code for tokens, then we land on the app root. On failure we
 * show the error and a way back rather than a blank spinner.
 */
export function Callback() {
  const { handleCallback } = useIam()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => window.location.replace('/'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sign-in failed'))
  }, [handleCallback])

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" gap="$4" backgroundColor={parchment}>
      {error ? (
        <>
          <Text color={accent}>{error}</Text>
          <Btn label="Back to sign in" onPress={() => window.location.replace('/')} alignSelf="center" />
        </>
      ) : (
        <>
          <Spinner size="large" color={accent} />
          <Text color={inkSoft}>Opening your shelf…</Text>
        </>
      )}
    </YStack>
  )
}
