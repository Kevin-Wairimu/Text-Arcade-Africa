const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// All routes are protected and admin-only
router.use(protect, admin);

router.route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.put("/:id/suspend", userController.suspendUser);

module.exports = router;
