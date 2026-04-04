import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en', 'ar', 'es', 'ru'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed'
})
