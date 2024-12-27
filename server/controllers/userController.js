const User = require("../models/userModel");
const Message = require("../models/messageModel");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    //console.log(user);
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

//saveLoginUser

module.exports.register = async (req, res, next) => {
  try {
    //console.log(req.body);
    const { username, email, password,user_id } = req.body;
  
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      user_id:user_id
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

// module.exports.getAllUsers = async (req, res, next) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.params.id } }).select([
//       "email",
//       "username",
//       "avatarImage",
//       "_id",
//     ]);
//     return res.json(users);
//   } catch (ex) {
//     next(ex);
//   }
// };

//24-12-2024
// module.exports.getAllUsers = async (req, res, next) => {
//   try {
//     const userId = req.params.id;

//     // Fetch all users except the current user
//     const users = await User.find({ _id: { $ne: userId } }).select([
//       "email",
//       "username",
//       "avatarImage",
//       "_id",
//     ]);

//     // Aggregate unread counts
//     const unreadCounts = await Message.aggregate([
//       { $match: { users: userId, isSeen: false } }, // Match unseen messages for the current user
//       { $group: { _id: "$sender", unreadCount: { $sum: 1 } } }, // Group by sender
//     ]);

//     const usersWithUnreadCount = users.map((user) => {
//       const unreadCount = unreadCounts.find((u) => u._id.equals(user._id))?.unreadCount || 0;
//       return { ...user._doc, unreadCount };
//     });

//     return res.json(usersWithUnreadCount);
//   } catch (ex) {
//     next(ex);
//   }
// };
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Fetch all users except the current user
    const users = await User.find({ _id: { $ne: userId } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    // unread counts for each sender
    const unreadCounts = await Message.aggregate([
      { $match: { users: userId, isSeen: false } }, // Match unseen messages for the current user
      { $group: { _id: "$sender", unreadCount: { $sum: 1 } } }, // Group by sender
    ]);

    // Fetch the latest message for each user
    const latestMessages = await Message.aggregate([
      { $match: { users: userId } }, // Match messages that involve the current user
      { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order (latest first)
      { $group: {
        _id: "$sender", 
        latestMessage: { $first: "$message" }, 
        createdAt: { $first: "$createdAt" } // Get the createdAt of the latest message
      }},
    ]);

    // Combine user data with unread count and latest message
    const usersWithUnreadCount = users.map((user) => {
      const unreadCount = unreadCounts.find((u) => u._id.equals(user._id))?.unreadCount || 0;
      const latestMessage = latestMessages.find((m) => m._id.equals(user._id))?.latestMessage || null;
      const latestMessageCreatedAt = latestMessages.find((m) => m._id.equals(user._id))?.createdAt || null;
      
      return { 
        ...user._doc, 
        unreadCount, 
        latestMessage, 
        latestMessageCreatedAt 
      };
    });

    // Sort users by the latest message createdAt (most recent messages at the top)
    const sortedUsers = usersWithUnreadCount.sort((a, b) => {
      const latestMessageA = a.latestMessageCreatedAt ? new Date(a.latestMessageCreatedAt) : new Date(0);
      const latestMessageB = b.latestMessageCreatedAt ? new Date(b.latestMessageCreatedAt) : new Date(0);
      return latestMessageB - latestMessageA; // Sort in descending order by createdAt
    });

    return res.json(sortedUsers);
  } catch (ex) {
    next(ex);
  }
};


//24-12-2024

module.exports.setAvatar = async (req, res, next) => {
  try {
    //console.log(req.body.image);
    //console.log(req.params.id);
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findOneAndUpdate(
      { user_id: userId },
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};


//24-12-2024
module.exports.markAsRead = async (req, res, next) => {
  //console.log(req.body);
  try {
    const { from, to } = req.body;

    // Update messages where the sender is 'from' and the recipient is included in 'users'
    await Message.updateMany(
      {
        sender: to,
        users: { $in: [from] },
        isSeen: false
      },
      { $set: { isSeen: true } }
    );

    res.status(200).send({ message: "Messages marked as seen" });
  } catch (ex) {
    next(ex);
  }
};

