
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'SquadFinder',
    short_name: 'SquadFinder',
    description: 'Encontre jogadores e monte seu squad!',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0b0f',
    theme_color: '#0b0b0f',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      }
    ],
  }
}
