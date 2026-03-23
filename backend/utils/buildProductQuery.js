// buildProductQuery: ONLY handles filters (category, subCategory, bestseller, etc.)
// Do NOT apply cursor here — controller handles it.
export const buildProductQuery = (queryParams) => {
  const { category, subCategory, bestseller, q } = queryParams;

  const query = {};

  if (category) {
    // category can be comma separated
    query.category = { $in: category.split(",").map(s => s.trim()).filter(Boolean) };
  }

  if (subCategory) {
    query.subCategory = { $in: subCategory.split(",").map(s => s.trim()).filter(Boolean) };
  }

  if (bestseller && bestseller === "true") {
    query.bestseller = true;
  }

  // optional full-text-ish query (if you use name/description search)
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ];
  }

  return query;
};