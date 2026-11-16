'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function recordSwipeAction({
  fromUserId,
  toPlayerProfileId,
  action,
}: {
  fromUserId?: string
  toPlayerProfileId: number | string
  action: 'like' | 'pass'
}) {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    const activeUserId = user?.collection === 'users' ? user.id : fromUserId

    if (!activeUserId) {
      return { success: false, error: 'Sessão não iniciada. Faça login como jogador.' }
    }

    const currentProfiles = await payload.find({
      collection: 'player-profiles',
      where: {
        owner: { equals: activeUserId },
      },
      limit: 1,
    })

    const currentProfile = currentProfiles.docs[0]
    if (!currentProfile) {
      return { success: false, error: 'Perfil de jogador não encontrado para este utilizador.' }
    }

    const currentProfileId = currentProfile.id

    const existingSwipes = await payload.find({
      collection: 'swipes',
      where: {
        and: [
          { fromProfile: { equals: currentProfileId } },
          { toProfile: { equals: toPlayerProfileId } },
        ],
      },
      limit: 1,
    })

    if (existingSwipes.docs.length > 0) {
      return { success: false, error: 'Já avaliou este perfil anteriormente.' }
    }

    await payload.create({
      collection: 'swipes',
      data: {
        fromProfile: Number(currentProfileId),
        toProfile: Number(toPlayerProfileId),
        action,
      },
    })

    let isMatch = false

    if (action === 'like') {
      const reciprocalSwipe = await payload.find({
        collection: 'swipes',
        where: {
          and: [
            { fromProfile: { equals: toPlayerProfileId } },
            { toProfile: { equals: currentProfileId } },
            { action: { equals: 'like' } },
          ],
        },
        limit: 1,
      })

      if (reciprocalSwipe.docs.length > 0) {
        isMatch = true
      }
    }

    return { success: true, isMatch }
  } catch (error) {
    console.error('Erro ao registar swipe:', error)
    return { success: false, error: 'Erro interno ao processar swipe.' }
  }
}

export async function getPlayerFeedAction({
  userId,
  selectedTagIds = [],
  limit = 10,
}: {
  userId?: string
  selectedTagIds?: string[]
  limit?: number
} = {}) {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    const activeUserId = user?.collection === 'users' ? user.id : userId
    let excludeProfileIds: (number | string)[] = []

    if (activeUserId) {
      const myProfiles = await payload.find({
        collection: 'player-profiles',
        where: { owner: { equals: activeUserId } },
        limit: 1,
      })

      if (myProfiles.docs.length > 0) {
        const myProfileId = myProfiles.docs[0].id
        excludeProfileIds.push(myProfileId)

        const mySwipes = await payload.find({
          collection: 'swipes',
          where: { fromProfile: { equals: myProfileId } },
          limit: 500,
        })

        mySwipes.docs.forEach((swipe) => {
          const targetId = typeof swipe.toProfile === 'object' ? swipe.toProfile?.id : swipe.toProfile
          if (targetId) excludeProfileIds.push(targetId)
        })
      }
    }

    const whereConditions: any[] = [{ isActive: { equals: true } }]

    if (excludeProfileIds.length > 0) {
      whereConditions.push({ id: { not_in: excludeProfileIds } })
    }

    if (selectedTagIds && selectedTagIds.length > 0) {
      whereConditions.push({ tags: { in: selectedTagIds } })
    }

    const profiles = await payload.find({
      collection: 'player-profiles',
      where: {
        and: whereConditions,
      },
      limit,
      depth: 2,
    })

    const formattedProfiles = profiles.docs.map((doc: any) => ({
      ...doc,
      id: String(doc.id),
      tags: Array.isArray(doc.tags)
        ? doc.tags.map((t: any) => (typeof t === 'object' && t !== null ? { ...t, id: String(t.id) } : t))
        : [],
    }))

    return {
      success: true,
      profiles: formattedProfiles,
    }
  } catch (error) {
    console.error('Erro ao buscar feed:', error)
    return {
      success: false,
      profiles: [],
    }
  }
}

export async function getAvailableTagsAction() {
  try {
    const payload = await getPayload({ config })
    const tags = await payload.find({
      collection: 'tags',
      limit: 100,
    })

    const formattedTags = tags.docs.map((tag: any) => ({
      ...tag,
      id: String(tag.id),
    }))

    return {
      success: true,
      tags: formattedTags,
    }
  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return {
      success: false,
      tags: [],
    }
  }
}