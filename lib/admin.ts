/**
 * Admin yetki kontrolü için tek kaynak.
 *
 * Production'da ADMIN_EMAILS env değişkeninden virgülle ayrılmış liste okunur.
 * Geliştirme ortamı veya env yoksa default olarak m.fatih.cakir@gmail.com kullanılır.
 *
 * Kullanım:
 *   import { isAdmin, isAdminEmail } from '@/lib/admin'
 *   if (isAdminEmail(user.email)) { ... }
 */

const DEFAULT_ADMINS = ['m.fatih.cakir@gmail.com']

function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS
  if (!env) return DEFAULT_ADMINS
  return env.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

interface UserLike {
  email?: string | null
  app_metadata?: { rol?: string } | null
}

export function isAdmin(user: UserLike | null | undefined): boolean {
  if (!user) return false
  return isAdminEmail(user.email)
}

export function isHekimOrAdmin(user: UserLike | null | undefined): boolean {
  if (!user) return false
  if (isAdmin(user)) return true
  return user.app_metadata?.rol === 'hekim'
}
