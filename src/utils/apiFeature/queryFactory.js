import { addDataToDocs } from "../dataToDoc/dataToDoc.js";
import { APIFeatures } from "./apiFeature.js";

const queryFactory = async (query, req, res, next) => {
  // Create an APIFeatures instance to apply pagination, filtering, sorting, search, and selection
  let features = new APIFeatures(query, req.query)
    .pagination()
    .filter()
    .sort()
    .search()
    .select();

  let docs = await features.mongooseQuery;

  const collectionName =
    features.mongooseQuery.mongooseCollection.collectionName;
  const modelName = features.mongooseQuery.mongooseCollection.modelName;

  if (!docs.length)
    return features.page
      ? next(new AppError(`Page not found`, 404))
      : next(new AppError(`No ${collectionName} found.`, 404));

  if (modelName === "Post" || modelName === "Comment") {
    docs = addDataToDocs(docs);
  }

  return res.status(200).json({
    status: "success",
    page: features.page,
    limit: features.limit,
    results: docs.length,
    data: docs,
  });
};

export { queryFactory };
