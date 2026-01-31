
import UserModel from "../models/user.model.js";

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
}

export class UserService {
    async getUsers(params: GetUsersParams = {}) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (params.search) {
            query.$or = [
                { name: { $regex: params.search, $options: "i" } },
                { email: { $regex: params.search, $options: "i" } },
                { number: { $regex: params.search, $options: "i" } }
            ];
        }

        if (params.filter === 'active') query.active = true;
        if (params.filter === 'inactive') query.active = false;

        const total = await UserModel.countDocuments(query);
        const users = await UserModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            status: "success",
            user: users, // Frontend seems to expect 'user' array (or Object.values of it?) Checks: if (userData.user)
            pagination: {
                totalUsers: total, // Frontend expects 'totalUsers' or 'total'? -> 'response.pagination?.totalUsers' in Notification.tsx
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        };
    }
}
