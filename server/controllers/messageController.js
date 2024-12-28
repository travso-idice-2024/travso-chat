const Messages = require("../models/messageModel");
const User  = require("../models/userModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;


    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        isSeen:msg.isSeen,
        type: msg.type,
        storyImagePath: msg.storyImagePath
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, type,storyImagePath } = req.body;
    // const data = await Messages.create({
    //   message: { text: message },
    //   users: [from, to],
    //   sender: from,
    // });
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      type: type,
      storyImagePath: storyImagePath
    });


    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
