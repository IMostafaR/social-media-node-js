/**
 * Wraps an asynchronous function to catch and forward errors to the next middleware.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} - A middleware function that catches errors and forwards them to the next middleware.
 */
export const catchAsyncError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      next(error);
    });
  };
};
