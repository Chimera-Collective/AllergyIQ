/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLOUD_CREDENTIALS: "";
    readonly VITE_GOOGLE_CLOUD_PROJECT_ID: "";
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  