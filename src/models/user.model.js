const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxLength: [50, "First name should not exceed 50 characters"],
      minLength: [2, "First name should be at least 2 characters long"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxLength: [50, "Last name should not exceed 50 characters"],
      minLength: [2, "Last name should be at least 2 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      minLength: [12, "Email should be at least 12 characters long"],
      maxLength: [50, "Email should not exceed 50 characters"],
      unique: true, //Since unique is true for email then mongoDB implicitly marked this field as Indexed field
      trim: true,
      lowercase: true,
      immutable: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: (props) =>
          `${props.value} is not a valid email address and should be between 12 and 50 characters long!`,
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          "Password is not strong enough. It should be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
      },
    },
    age: {
      type: Number,
      min: [15, "Age should be at least 15"],
      max: [100, "Age should not exceed 100"],
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender should be either 'male', 'female', or 'other'",
      },
      immutable: true,
    },
    about: {
      type: String,
      trim: true,
      maxLength: [500, "About section should not exceed 500 characters"],
      default: `Hi, I am a new user of this app.`,
    },
    profilePhoto: {
      type: String,
      default:
        "https://img.magnific.com/premium-vector/default-avatar-profile-icon-gray-placeholder-vector-illustration_514344-14757.jpg?semt=ais_hybrid&w=740&q=80",
      validate: {
        validator: function (value) {
          return validator.isURL(value);
        },
        message: "Profile photo should be a valid URL",
      },
    },
    skills: {
      type: [String],
      validate: {
        validator: function (value) {
          if (value.length > 20) return false;
          return value.every(
            (skill) => skill.trim().length > 0 && skill.length <= 20,
          );
        },
        message:
          "Skills should be an array of strings with a maximum of 20 skills, each skill should be a non-empty string with a maximum length of 20 characters",
      },
    },
    interests: {
      type: [String],
      validate: {
        validator: function (value) {
          if (value.length > 20) return false;
          return value.every(
            (interest) => interest.trim().length > 0 && interest.length <= 20,
          );
        },
        message:
          "Interests should be an array of strings with a maximum of 20 interests, each interest should be a non-empty string with a maximum length of 20 characters",
      },
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
