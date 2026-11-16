import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// On Pages the site lives under /<repo-name>/; read it from the environment so a repo rename cannot break asset paths.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
})
