export const globalErrorHandler = () => {
  return (error, req, res, next) => {
    const status = error.statusCode || 500;
    process.env.MODE == "dev"
      ? res.status(status).json({
          status: "failed",
          message: error.message,
          error,
          stack: error.stack,
        })
      : res.status(status).json({
          status: "failed",
          message: error.message,
          error,
        });
  };
};
