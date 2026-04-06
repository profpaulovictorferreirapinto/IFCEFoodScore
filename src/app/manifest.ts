
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IFCE FoodScore',
    short_name: 'FoodScore',
    description: 'Sistema de avaliação de refeições do IFCE Campus Itapipoca',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#379936',
    icons: [
      {
        src: 'https://picsum.photos/seed/ifce/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/ifce/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
