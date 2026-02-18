import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/vitepress-docs/',
  title: "KolyaLis Docs",
  description: "Showcase by KolyaLis",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Главная', link: '/' },
    ],

    sidebar: [
      {
        text: 'Примеры документации',
        items: [
          { text: 'Арт аксессориз Api', link: '/art-accessories' },
          { text: 'Api враппер', link: '/' },
          { text: 'Компонент и composable', link: '/ui-kit' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
