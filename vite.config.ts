import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site under /papa-gym/
export default defineConfig({
  base: '/papa-gym/',
  plugins: [react()],
  test: { environment: 'node' },
});
