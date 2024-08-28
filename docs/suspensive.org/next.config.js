const { shouldUseFlatConfig } = require('eslint/use-at-your-own-risk')
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [require('remark-sandpack').remarkSandpack],
  },
})

/** @type {import('next').NextConfig} */
module.exports = withNextra({
  i18n: {
    locales: ['en', 'ko'],
    defaultLocale: 'en',
  },
})
