const mongoose = require("mongoose");

const VerifyEmailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    originalEmail: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    token: {
      type: String,
      required: true,
    },
    currentToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: "VerifyEmail",
  }
);

module.exports = mongoose.model("VerifyEmail", VerifyEmailSchema);
