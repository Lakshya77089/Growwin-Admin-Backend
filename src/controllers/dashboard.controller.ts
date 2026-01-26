import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

const dashboardService = new DashboardService();

export class DashboardController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await dashboardService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching all users", error });
        }
    }

    async getDeposits(req: Request, res: Response) {
        try {
            const deposits = await dashboardService.getDeposits();
            res.json(deposits);
        } catch (error) {
            res.status(500).json({ message: "Error fetching deposits", error });
        }
    }

    async getWithdrawals(req: Request, res: Response) {
        try {
            const withdrawals = await dashboardService.getWithdrawals();
            res.json(withdrawals);
        } catch (error) {
            res.status(500).json({ message: "Error fetching withdrawals", error });
        }
    }

    async getTransfers(req: Request, res: Response) {
        try {
            const transfers = await dashboardService.getTransfers();
            res.json(transfers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching transfers", error });
        }
    }

    async getWalletBalance(req: Request, res: Response) {
        try {
            const balance = await dashboardService.getWalletBalance();
            res.json(balance);
        } catch (error) {
            res.status(500).json({ message: "Error fetching wallet balance", error });
        }
    }

    async getInvestmentSummary(req: Request, res: Response) {
        try {
            const summary = await dashboardService.getInvestmentSummary();
            res.json(summary);
        } catch (error) {
            res.status(500).json({ message: "Error fetching investment summary", error });
        }
    }

    async getPlatinumInvestors(req: Request, res: Response) {
        try {
            const investors = await dashboardService.getPlatinumInvestors();
            res.json(investors);
        } catch (error) {
            res.status(500).json({ message: "Error fetching platinum investors", error });
        }
    }

    async getActiveInvestors(req: Request, res: Response) {
        try {
            const active = await dashboardService.getActiveInvestors();
            res.json(active);
        } catch (error) {
            res.status(500).json({ message: "Error fetching active investors", error });
        }
    }

    async getInactiveInvestors(req: Request, res: Response) {
        try {
            const inactive = await dashboardService.getInactiveInvestors();
            res.json(inactive);
        } catch (error) {
            res.status(500).json({ message: "Error fetching inactive investors", error });
        }
    }

    async getSummary(req: Request, res: Response) {
        try {
            const summary = await dashboardService.getSummary();
            res.json(summary);
        } catch (error) {
            res.status(500).json({ message: "Error fetching dashboard summary", error });
        }
    }
}
