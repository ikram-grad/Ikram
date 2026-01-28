/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
  // add other VITE_ env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
