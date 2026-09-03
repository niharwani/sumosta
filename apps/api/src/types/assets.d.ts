// Ambient declarations for binary assets bundled by Wrangler's Data rule.
// Wrangler resolves these imports to an ArrayBuffer at build time.
declare module '*.ttf' {
  const bytes: ArrayBuffer;
  export default bytes;
}
