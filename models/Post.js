const { model, Schema } = require("mongoose");

// graphql can specify user validations (eg. required fields, default values)

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  user: {
    // allows us to let mongoose automatically populate this field using mongoose methods
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Post", postSchema);
