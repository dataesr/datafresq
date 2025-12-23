/**
 * Schema Index
 *
 * ⚠️ CONVENTION: Always import directly from schema files, not from this index.
 *
 * ✅ Good:
 *   import { userMeSchema } from '~/schemas/users';
 *   import { programSchema } from '~/schemas/programs';
 *   import { errorResponseSchema } from '~/schemas/common';
 *
 * ❌ Avoid:
 *   import { userMeSchema, programSchema } from '~/schemas';
 *
 * Direct imports are:
 * - More explicit about where things come from
 * - Better for IDE navigation (jump to definition)
 * - Better for tree-shaking in builds
 *
 * This index exists only for rare cases where you need to re-export everything.
 */

// Re-exports are intentionally NOT provided here.
// Import directly from the specific schema file you need.
