const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSeen: { //24/12/2024
      type: Boolean,
      default: false, 
    },
    type: String,
    storyImagePath:{
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
