export const buildProductQuery = (queryParams) => {
  const { category, subCategory, cursor ,bestseller} = queryParams;

  const query = {};

  if (cursor) {
    query._id = { $lt: cursor };
  }

  if (category) {
    query.category = { $in: category.split(",") };
  }

  if (subCategory) {
    query.subCategory = { $in: subCategory.split(",") };
  }

  if (bestseller && bestseller === "true") {
  query.bestseller = true;
  } 

  return query;
};
