import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Served from https://lunev.github.io/manage-x/, so assets need the repo name as base.
export default defineConfig({
  base: '/manage-x/',
  plugins: [react(), tailwindcss()],
});
