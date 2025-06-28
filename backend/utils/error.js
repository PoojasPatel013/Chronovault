// backend/utils/error.js
export const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
