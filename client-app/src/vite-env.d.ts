/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLOUD_CREDENTIALS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}