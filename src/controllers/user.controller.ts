import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
