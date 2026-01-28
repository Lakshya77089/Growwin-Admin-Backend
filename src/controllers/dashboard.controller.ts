import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import connectDB from "../utils/connectDB.js";

const dashboardService = new DashboardService();

export class DashboardController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const filter = (req.query["filter"] as string) || 'all';
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getAllUsers(page, limit, filter, search);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching all users", error });
        }
    }

    async getDeposits(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const deposits = await dashboardService.getDeposits(page, limit);
            res.json(deposits);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching deposits", error });
        }
    }

    async getWithdrawals(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const withdrawals = await dashboardService.getWithdrawals(page, limit);
            res.json(withdrawals);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching withdrawals", error });
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
            await connectDB(); // Ensure connection is established
            const summary = await dashboardService.getSummary();
            res.json(summary);
        } catch (error: any) {
            console.error("Dashboard Summary Error:", error);
            res.status(500).json({
                message: "Error fetching dashboard summary",
                error: error.message || "Unknown error occurred"
            });
        }
    }

    async getKYCs(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getKYCs(page, limit);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching KYCs", error });
        }
    }

    async toggleUserStatus(req: Request, res: Response) {
        try {
            const { email, active } = req.body;
            const updated = await dashboardService.toggleUserStatus(email, active);
            res.json({ status: "success", data: updated });
        } catch (error) {
            res.status(500).json({ message: "Error toggling user status", error });
        }
    }

    async editUser(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const { name, number } = req.body;
            const updated = await dashboardService.editUser(email as string, name, number);
            res.json({ status: "success", user: updated });
        } catch (error) {
            res.status(500).json({ message: "Error editing user", error });
        }
    }

    async toggleInvestmentAllowed(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const updated = await dashboardService.toggleInvestmentAllowed(email as string);
            res.json({ status: "success", data: updated });
        } catch (error) {
            res.status(500).json({ message: "Error toggling investment status", error });
        }
    }

    async verifyKYC(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const { status } = req.body;
            const updated = await dashboardService.verifyKYC(email as string, status);
            res.json({ status: "success", data: updated });
        } catch (error) {
            res.status(500).json({ message: "Error verifying KYC", error });
        }
    }

    async updateWithdrawal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { withdrawStatus } = req.body; // Frontend uses withdrawStatus field
            const updated = await dashboardService.updateWithdrawal(id as string, withdrawStatus);
            res.json({ status: "success", data: { Withdraw: updated } });
        } catch (error) {
            res.status(500).json({ message: "Error updating withdrawal", error });
        }
    }

    async getWalletBalancePersonal(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const wallet = await dashboardService.getWalletBalancePersonal(email as string);
            res.json({ status: "success", wallet });
        } catch (error) {
            res.status(500).json({ message: "Error fetching user wallet balance", error });
        }
    }

    async updateWallet(req: Request, res: Response) {
        try {
            const { email, amount } = req.body;
            const updated = await dashboardService.updateWallet(email, amount);
            res.json({ status: "success", data: { Withdraw: updated } }); // Matches some old logic expectations
        } catch (error) {
            res.status(500).json({ message: "Error updating wallet", error });
        }
    }

    async getReferral(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const referrer = await dashboardService.getReferral(id as string);
            res.json({ status: "success", email: referrer }); // Matches frontend expectation of data.email.email
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching referral", error });
        }
    }

    async getUser(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const user = await dashboardService.getUser(email as string);
            res.json({ status: "success", user });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching user", error });
        }
    }

    async getInvest(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const invest = await dashboardService.getInvest(email as string);
            if (!invest) {
                return res.json({ status: "error", message: "noinvestment" });
            }
            res.json({ status: "success", Invest: invest });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching investment", error });
        }
    }

    async getPlatinumInvest(req: Request, res: Response) {
        try {
            const { email } = req.params;
            const invest = await dashboardService.getPlatinumInvest(email as string);
            if (!invest) {
                return res.json({ status: "error", message: "noinvestment" });
            }
            res.json({ status: "success", Invest: invest });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching platinum investment", error });
        }
    }

    async getSubTeamall(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getSubTeamall(page, limit);
            res.json({ status: "success", ...data });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching sub-team data", error });
        }
    }

    async getReferalIncomeAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getReferalIncomeAll(page, limit);
            res.json({ status: "success", ...data });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching referral income data", error });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await dashboardService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Error during login", error });
        }
    }

    async getTeamDetailsAdmin(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getTeamDetailsAdmin(page, limit);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching team details", error });
        }
    }

    async getAllTeamIncomePaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const startDate = (req.query["startDate"] as string) || '';
            const endDate = (req.query["endDate"] as string) || '';
            const data = await dashboardService.getAllTeamIncomePaginated(page, limit, searchTerm, startDate, endDate);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching team income data", error });
        }
    }

    async getAllPlatinumTeamIncome(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 10;
            const data = await dashboardService.getAllPlatinumTeamIncome(page, limit);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching platinum team income data", error });
        }
    }

    async getAllSelfIncomePaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const startDate = (req.query["startDate"] as string) || '';
            const endDate = (req.query["endDate"] as string) || '';
            const isPlatinum = req.query["isPlatinum"] === "true";
            const data = await dashboardService.getAllSelfIncomePaginated(page, limit, searchTerm, startDate, endDate, req.query["isPlatinum"] !== undefined ? isPlatinum : undefined);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching self income data", error });
        }
    }

    async updateSelfIncome(req: Request, res: Response) {
        try {
            const { email, income, date } = req.body;
            const result = await dashboardService.updateSelfIncome(email, income, date);
            res.json({ status: "success", result });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating self income", error });
        }
    }

    async updatePlatinumIncome(req: Request, res: Response) {
        try {
            const { email, income, date } = req.body;
            const result = await dashboardService.updatePlatinumIncome(email, income, date);
            res.json({ status: "success", result });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating platinum income", error });
        }
    }

    async getAllReferalIncomePaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const startDate = (req.query["startDate"] as string) || '';
            const endDate = (req.query["endDate"] as string) || '';
            const data = await dashboardService.getAllReferalIncomePaginated(page, limit, searchTerm, startDate, endDate);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching referral income data", error });
        }
    }

    async updateReferalIncome(req: Request, res: Response) {
        try {
            const { owner, member, income, level, date } = req.body;
            const result = await dashboardService.updateReferalIncome(owner, member, income, level, date);
            res.json({ status: "success", result });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating referral income", error });
        }
    }

    async getAllTransfersPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const startDate = (req.query["startDate"] as string) || '';
            const endDate = (req.query["endDate"] as string) || '';
            const data = await dashboardService.getAllTransfersPaginated(page, limit, searchTerm, startDate, endDate);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching transfer data", error });
        }
    }

    async updateTransfer(req: Request, res: Response) {
        try {
            const { owner, member, amount, date } = req.body;
            const result = await dashboardService.updateTransfer(owner, member, amount, date);
            res.json({ status: "success", result });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating transfer", error });
        }
    }
}
