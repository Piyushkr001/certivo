import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './config/schema.tsx',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_uXh1dlM6ocEx@ep-shiny-unit-a8bimois-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
});
