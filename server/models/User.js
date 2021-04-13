const { model, Schema } = require("mongoose");

// graphql can specify user validations (eg. required fields, default values)

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  resetTokenExpires: Number,
  createdAt: String,
  updatedAt: String,
});

module.exports = model("User", userSchema);
