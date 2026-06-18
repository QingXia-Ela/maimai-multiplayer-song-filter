import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

const background = '#dfe9f6'

export default defineConfig({
  images: ['assets/pwa-icon-source.png'],
  preset: {
    ...minimal2023Preset,
    transparent: {
      ...minimal2023Preset.transparent,
      padding: 0.04,
      resizeOptions: {
        fit: 'contain',
        background,
      },
    },
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.16,
      resizeOptions: {
        fit: 'contain',
        background,
      },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.12,
      resizeOptions: {
        fit: 'contain',
        background,
      },
    },
  },
  headLinkOptions: {
    preset: '2023',
  },
})
