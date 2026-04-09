/* ─────────────────────────────────────────────
   CSS MODULE TYPE DECLARATIONS
   Tells TypeScript that .css files are valid
   side-effect imports (used in Next.js App Router).
   ───────────────────────────────────────────── */
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
