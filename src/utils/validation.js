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
  const isValidFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field),
  );
  if (isValidFields.length > 0) {
    throw new Error(`Invalid fields provided: ${inValidFields.join(", ")}`);
  }

  //4. Basic email format validation
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "lastName",
    "about",
    "profilePhoto",
    "age",
    "skills",
    "interests",
  ];

  const isValidUpdateFields = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field),
  );
  if (!isValidUpdateFields) {
    throw new Error(
      "Invalid update fields. Only lastName, about, profilePhoto, age, skills, and interests can be updated.",
    );
  }
};
module.exports = {
  validateSignupData,
  validateEditProfileData,
};
