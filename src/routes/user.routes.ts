import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { protect } from "../middleware/rbac.middleware.js";

const router = Router();
router.use(protect);
const userController = new UserController();

// Match "/" (for /users/ root)
router.get("/", userController.getAllUsers.bind(userController));

// Match "/getUsers" (for Notification.tsx)
router.get("/getUsers", userController.getAllUsers.bind(userController));

// Match "/getUsers/all" (for Users.tsx)
router.get("/getUsers/all", userController.getAllUsers.bind(userController));

export default router;
