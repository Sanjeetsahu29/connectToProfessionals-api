const validator = require("validator");
const validateSignupData = (req) => {
  //1. Request body validation
  if (!req.body || typeof req.body !== "object") {
    throw new Error("Request body is missing or not an object");
  }

  //2. Required fields for this API
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("All fields are required");
  }

  //3. Make sure the client isn't sending unexpected fields
  const allowedFields = ["firstName", "lastName", "email", "password"];
  const inValidFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field),
  );
  if (inValidFields.length > 0) {
    throw new Error(`Invalid fields provided: ${inValidFields.join(", ")}`);
  }

  //4. Basic email format validation
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
};

const validateUserUpdateData = (req) => {};

module.exports = {
  validateSignupData,
  validateUserUpdateData,
};
