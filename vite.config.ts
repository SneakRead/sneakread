import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  ssr: {
    // The prerendered home now renders real Fluent icons (Word ribbon). Bundle
    // the icon pack into the SSR build so Node doesn't choke on its ESM export map.
    noExternal: ['@fluentui/react-icons'],
  },
})
