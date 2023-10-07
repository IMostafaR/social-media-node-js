import slugify from "slugify";
import { Category } from "../../../database/models/category.model.js";
import cloudinary from "../../utils/cloud/cloud.js";
import { AppError } from "../error/appError.js";
import { catchAsyncError } from "../error/asyncError.js";
import { APIFeatures } from "../apiFeature/apiFeature.js";

/**
 * Middleware for creating a new document of a specific model.
 *
 * @param {mongoose.Model} model - The Mongoose model to create a document for.
 * @returns {Function} - An Express middleware function for handling the creation request.
 *
 * @throws {AppError} - If a document with the same name already exists, it may throw a 409 Conflict error.
 */
const createOne = (model) => {
  return catchAsyncError(async (req, res, next) => {
    /**
     * The name of the new document to be created.
     * @type {string}
     */
    const { name } = req.body;

    // Check if a document with the same name already exists
    const existingDoc = await model.findOne({ name });

    if (existingDoc) {
      return next(new AppError(`${model.modelName} already exists`, 409));
    }

    /**
     * The slug generated from the name.
     * @type {string}
     */
    const slug = slugify(name);

    // Extract the current user's ID from the request
    const { id: createdBy, id: updatedBy } = req.user;

    /**
     * The result of cloud upload for the document's image.
     * @type {object}
     * @property {string} secure_url - The secure URL of the uploaded image.
     * @property {string} public_id - The public ID of the uploaded image.
     */
    const cloudUpload = await cloudinary.uploader.upload(req.file.path, {
      folder: `E-commerce-40/${model.collection.name}/${slug}`,
    });

    const { secure_url, public_id } = cloudUpload;

    // Create a new document
    const newDoc = await model.create({
      name,
      slug,
      image: { secure_url, public_id },
      createdBy,
      updatedBy,
    });

    // Send the response with the newly created document
    res.status(201).json({
      status: "success",
      message: `${model.modelName} added successfully`,
      data: newDoc,
    });
  });
};

/**
 * update existing document
 */
const updateOne = (model) => {
  return catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const existingDoc = await model.findById(id);

    if (!existingDoc) {
      return next(
        new AppError(
          `Sorry, the ${model.modelName} with id ${id}  cannot be found`,
          404
        )
      );
    }
    // TODO: update name and slug
    // TODO: when updating name and slug, you should also update folders names in clouninary
    if (req.file) {
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        public_id: existingDoc.image.public_id,
      });

      existingDoc.image.secure_url = secure_url;
    }

    // Update the updatedBy field with the current user's ID
    existingDoc.updatedBy = req.user.id;

    const updatedDoc = await existingDoc.save();

    res.status(200).json({
      status: "success",
      message: `${model.modelName} image updated successfully`,
      data: updatedDoc,
    });
  });
};

/**
 * Middleware for handling requests to list documents of a specific model.
 *
 * @param {mongoose.Model} model - The Mongoose model to query documents from.
 * @returns {Function} - An Express middleware function for handling the request.
 *
 * @throws {AppError} - If no documents are found, it may throw errors based on the situation:
 *   - 404 Not Found: If a category or page is not found.
 *   - 404 Not Found: If no documents of the specified model exist.
 */
const handleAll = (model, populateOptions) => {
  return catchAsyncError(async (req, res, next) => {
    // Create an empty query object
    let queryObj = {};

    // If a category ID is provided in the request params, add it to the query
    req.params && req.params.id ? (queryObj.category = req.params.id) : null;

    // Create an APIFeatures instance to apply pagination, filtering, sorting, search, and selection
    let features = new APIFeatures(
      model.find(queryObj).populate(populateOptions),
      req.query
    )
      .pagination()
      .filter()
      .sort()
      .search()
      .select();

    // Execute the Mongoose query
    const doc = await features.mongooseQuery;

    // Handle cases where no documents are found
    if (!doc.length)
      return req.params && req.params.id
        ? next(
            new AppError("Subcategories are not found for this category", 404)
          )
        : features.page // for pagination
        ? next(new AppError(`Page not found`, 404)) // for pagination
        : next(new AppError(`No ${model.collection.name} found.`, 404));

    // Send the response with the retrieved documents
    res.status(200).json({
      status: "success",
      page: features.page,
      limit: features.limit,
      results: doc.length,
      data: doc,
    });
  });
};

/**
 * Middleware for handling requests to retrieve or delete a document of a specific model by its ID.
 *
 * @param {mongoose.Model} model - The Mongoose model to query documents from.
 * @returns {Function} - An Express middleware function for handling the request.
 *
 * @throws {AppError} - If the requested document by ID is not found, it may throw a 404 Not Found error.
 */
const handleOne = (model, populateOptions) => {
  return catchAsyncError(async (req, res, next) => {
    /**
     * The ID of the document to be retrieved or deleted.
     * @type {string}
     */
    const { id } = req.params;
    /**
     * The retrieved document by ID.
     * @type {mongoose.Document}
     */
    let doc;

    if (req.method === "GET") {
      // Retrieve a document by its ID
      doc = await model.findById(id).populate(populateOptions);
    } else if (req.method === "DELETE") {
      // Delete a document by its ID
      doc = await model.findByIdAndDelete(id);
    }

    // Handle cases where the document by ID is not found
    if (!doc)
      return next(
        new AppError(`${model.modelName} with ID ${id} not found`, 404)
      );

    if (req.method === "GET") {
      // Send the response with the retrieved document
      return res.status(200).json({
        status: "success",
        data: doc,
      });
    } else if (req.method === "DELETE") {
      // Send the response after successfully deleting the document
      return res.status(200).json({
        status: "success",
        message: `Successfully deleted`,
      });
    }
  });
};

export { createOne, updateOne, handleAll, handleOne };
