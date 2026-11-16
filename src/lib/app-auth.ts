import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'

const APP_SESSION_COOKIE = 'app-session'
const SESSION_SECONDS = 60 * 60 * 24 * 7

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayload({ config })
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })

  if (!user || user.collection !== 'users') return null
  return user as User
}

export async function setAppSession(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearAppSession() {
  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
