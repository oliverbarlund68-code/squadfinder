import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { Users } from './collections/Users'
import { Folders } from './collections/Folders'
import { Media } from './collections/Media'
import { PlayerProfiles } from './collections/PlayerProfiles'
import { Swipes } from './collections/Swipes'
import { Tags } from './collections/Tags'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: dirname,
    },
  },
  collections: [Admins, Users, PlayerProfiles, Swipes, Media, Folders, Tags],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
  }),
})