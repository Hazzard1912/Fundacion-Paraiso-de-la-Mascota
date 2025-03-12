// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import db from '@astrojs/db';
import vercel from '@astrojs/vercel';
import auth from 'auth-astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [tailwind(), sitemap(), db(), auth(), react()]
});