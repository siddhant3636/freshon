import { parseSearchIntent } from "./parseSearchIntent.js";

export const mergeSearchFilters = async (query) => {
  let mergedQuery = { ...query };

  if (!query.q) return mergedQuery;

  const parsed = await parseSearchIntent(query.q);

  if (!parsed) return mergedQuery;

  // UI filters take priority
  if (!query.category && parsed.category) {
    mergedQuery.category = parsed.category;
  }

  if (!query.subCategory && parsed.subCategory) {
    mergedQuery.subCategory = parsed.subCategory;
  }

  // Always refine search text
  if (parsed.text) {
    mergedQuery.q = parsed.text;
  }

  return mergedQuery;
};