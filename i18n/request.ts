import {notFound} from 'next/navigation'
import {getRequestConfig} from 'next-intl/server'

const locales = ['tr']

export default getRequestConfig(async ({locale}) => {
  const loc = locale ?? 'tr'
  if (!locales.includes(loc)) notFound()
  return {
    locale: loc,
    messages: (await import(`../messages/${loc}.json`)).default
  }
})
