/// <reference types="astro/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly STRAPI_READ_TOKEN: string;
  readonly STRAPI_REQUEST_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
