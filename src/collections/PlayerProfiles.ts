import type { Access, CollectionBeforeChangeHook, CollectionConfig, FieldAccess } from 'payload'

const isAdmin = (user: unknown) =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'admins')

const isAppUser = (user: unknown) =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'users')

const isOwnerOrAdmin: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { owner: { equals: req.user!.id } }
}

const ownerFieldAccess: FieldAccess = ({ req }) => isAdmin(req.user)

const assignOwner: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation === 'create' && isAppUser(req.user)) {
    return { ...data, owner: req.user!.id }
  }
  return data
}

export const PlayerProfiles: CollectionConfig = {
  slug: 'player-profiles',
  admin: {
    group: 'SquadFinder',
    useAsTitle: 'handle',
  },
  access: {
    create: ({ req }) => isAdmin(req.user) || isAppUser(req.user),
    delete: isOwnerOrAdmin,
    read: ({ req }) => 
      isAdmin(req.user) || isAppUser(req.user) ? true : { isActive: { equals: true } },
    update: isOwnerOrAdmin,
  },
  hooks: {
    beforeChange: [assignOwner],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: {
        create: ownerFieldAccess,
        update: ownerFieldAccess,
      },
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'handle',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'age',
      type: 'number',
      required: true,
      min: 18,
      max: 99,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'region',
      type: 'text',
      required: true,
    },
    {
      name: 'game',
      type: 'select',
      required: true,
      options: ['VALORANT', 'COUNTER-STRIKE 2', 'LEAGUE OF LEGENDS', 'FORTNITE'],
    },
    {
      name: 'rank',
      type: 'text',
      required: true,
    },
    {
      name: 'gameplayStyle',
      type: 'select',
      required: true,
      options: ['Competitivo', 'Casual', 'Casual + rank'],
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'PC',
      options: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'],
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      maxLength: 240,
    },
    {
      name: 'availability',
      type: 'text',
      required: true,
    },
    {
      name: 'matchScore',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#d7ff3f',
    },
    {
      name: 'isOnline',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
  ],
  versions: false,
}
