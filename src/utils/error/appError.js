/**
 * Custom error class for application-specific errors.
 */
export class AppError extends Error {
  /**
   * Creates a new application-specific error.
   *
   * @param {string | string[]} message - A descriptive error message.
   * @param {number} statusCode - The HTTP status code to be set when handling this error.
   */
  constructor(message, statusCode) {
    /**
     * A descriptive error message.
     * @type {string}
     */
    super(message);
    /**
     * The HTTP status code associated with the error.
     * @type {number}
     */
    this.statusCode = statusCode;
  }
}
