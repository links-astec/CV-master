// Web stand-in for push.ts (the browser build is only used for screenshots): no pushes there.
export const pushSupported = () => false
export const pushPreference = async (): Promise<'on' | 'off' | null> => null
export const wasAsked = async () => true
export const markAsked = () => Promise.resolve()
export const enablePush = async () => false
export const disablePush = async (_o?: { remember?: boolean }) => {}
export const refreshPush = async () => {}
export function usePushTaps(_signedIn: boolean) {}
