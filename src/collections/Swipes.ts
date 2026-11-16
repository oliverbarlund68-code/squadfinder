import { CollectionConfig } from 'payload'

export const Swipes: CollectionConfig = {
  slug: 'swipes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['fromProfile', 'toProfile', 'action', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false, // Swipes não devem ser editados após criados
    delete: ({ req: { user } }) => Boolean(user), // Apenas administradores/utilizadores autenticados podem apagar
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Apenas validamos na criação de um novo swipe
        if (operation === 'create' && data) {
          const { fromProfile, toProfile } = data

          // 1. Impedir que um perfil dê swipe em si próprio
          if (fromProfile === toProfile) {
            throw new Error('Um perfil não pode dar swipe em si próprio.')
          }

          // 2. Verificar se já existe um swipe registado entre estes dois perfis
          const existingSwipes = await req.payload.find({
            collection: 'swipes',
            where: {
              and: [
                { fromProfile: { equals: fromProfile } },
                { toProfile: { equals: toProfile } },
              ],
            },
            limit: 1,
            req,
          })

          if (existingSwipes.docs.length > 0) {
            throw new Error('Já existe um registo de swipe deste perfil para o destino selecionado.')
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'fromProfile',
      type: 'relationship',
      relationTo: 'player-profiles',
      required: true,
      admin: {
        description: 'O perfil que está a realizar a ação de swipe.',
      },
    },
    {
      name: 'toProfile',
      type: 'relationship',
      relationTo: 'player-profiles',
      required: true,
      admin: {
        description: 'O perfil que está a receber o swipe.',
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Like',
          value: 'like',
        },
        {
          label: 'Pass',
          value: 'pass',
        },
      ],
      admin: {
        description: 'Ação escolhida (Like ou Pass).',
      },
    },
  ],
  timestamps: true,
}