# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Vite + React 19 + `@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it
minimal and real. `@hanzo/gui` needs the react-native-web alias + Tamagui
defines in `vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this);
`Button` takes no `color` prop, so custom-coloured controls are composed via the
`Btn` primitive (`XStack` + `Text`). Do NOT wrap content in `<LinearGradient>` —
it washes children out under Vite; use a `YStack` with a CSS `backgroundImage`
gradient. `schema.sql` is the Base data contract (`books`). Prove changes with
`npm run build` (tsc + vite). Never build a container image locally — Hanzo Cloud
owns deploys.
