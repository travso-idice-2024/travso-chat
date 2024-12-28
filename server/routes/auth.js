const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
  markAsRead,
  fetchUser
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.get("/allusers/:id", getAllUsers);
router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);
router.post("/markAsRead", markAsRead);
router.get("/fetchUser/:id",fetchUser);


module.exports = router;
