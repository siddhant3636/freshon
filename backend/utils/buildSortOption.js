export const buildSortOption = (sort) => {
  switch (sort) {
    case "low_high":
      return { price: 1, _id: 1 };

    case "high_low":
      return { price: -1, _id: -1 };

    case "newest":
      return { _id: -1 };

    case "oldest":
      return { _id: 1 };

    default:
      return { _id: -1 };
  }
};