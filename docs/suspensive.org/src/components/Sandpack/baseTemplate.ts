export const baseTemplate = {
  files: {
    '/hideReactErrorOverlay.css': {
      code: `body > iframe {
  display: none;
}`,
      hidden: true,
    },
    '/App.tsx': {
      code: `import { Example } from './Example'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './hideReactErrorOverlay.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}`,
      hidden: true,
    },
  },
  dependencies: {
    '@tanstack/react-query': '^4.0.0',
    '@suspensive/react': 'latest',
    '@suspensive/react-query': 'latest',
  },
  devDependencies: {},
}
