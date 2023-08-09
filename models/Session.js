const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: false,
  },
  chat: [{ type: Object }],
});

module.exports = model("Session", sessionSchema);
