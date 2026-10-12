// Each Vitest project must have exactly one configuration. The ArtCraft app
// ships both Vite and Vitest configs; select only the dedicated test config.
export default [
  "apps/artcraft/vitest.config.{mjs,js,ts,mts}",
  "libs/**/vite.config.{mjs,js,ts,mts}",
  "libs/**/vitest.config.{mjs,js,ts,mts}",
];
