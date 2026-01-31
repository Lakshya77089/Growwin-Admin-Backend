
import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = (req.query.search as string) || "";
            const filter = (req.query.filter as string) || "";

            const result = await userService.getUsers({ page, limit, search, filter });

            // Standardizing response for different frontend expectations
            // Notification.tsx expects: response.data (array) OR response with pagination
            // Users.tsx expects: { status: "success", user: [...], pagination: {...} }

            // Current UserService returns exactly structure for Users.tsx
            // For Notification.tsx:
            // "if (response?.data)" -> userResponse.data -> if response structure is { data: [...], pagination... }
            // Notification.tsx calling fetchUsers -> expects response.data to have the users?
            // "fetchUsers" in Notification.tsx: return response.data;
            // Then checks response.data again? 
            // "if (response?.data)" -> actually means if the payload *has* a data property.

            // Let's add a `data` alias to `user` to be safe if that's what it wants.
            res.json({
                ...result,
                data: result.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
