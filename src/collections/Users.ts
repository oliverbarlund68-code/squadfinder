import type { Access, CollectionConfig } from 'payload'

const isSelfOrAdmin: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'SquadFinder',
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  access: {
    create: () => true,
    delete: isSelfOrAdmin,
    read: isSelfOrAdmin,
    update: isSelfOrAdmin,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
  ],
  versions: false,
}
