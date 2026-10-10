// Everything that changes with a rebrand lives here (plus the icons in assets/images and
// the name, ids and splash colour in app.json).
export const BRAND = {
  name: 'CVMaster',
  website: 'https://www.cvmaster.live',
  api: process.env.EXPO_PUBLIC_API_URL || 'https://api.cvmaster.live',
  support: 'support@cvmaster.live',
}

export const COLORS = {
  light: {
    bg: '#F7F7FB', surface: '#FFFFFF', surface2: '#F1F1F7', border: '#E4E4EE',
    text: '#14142B', text2: '#4A4A63', text3: '#8A8AA3',
    accent: '#4338CA', accentText: '#FFFFFF', accentSoft: '#EEF0FF',
    danger: '#DC2626', success: '#16A34A',
    canvas: '#E9E9F1',
  },
  dark: {
    bg: '#0E0E16', surface: '#171722', surface2: '#1F1F2C', border: '#2A2A3A',
    text: '#F1F1F7', text2: '#B9B9CC', text3: '#7E7E96',
    accent: '#8B85FF', accentText: '#0E0E16', accentSoft: '#1F1D3D',
    danger: '#F87171', success: '#4ADE80',
    canvas: '#0A0A10',
  },
} as const

export type Palette = { [K in keyof typeof COLORS.light]: string }
