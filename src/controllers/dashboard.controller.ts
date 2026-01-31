import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import connectDB from "../utils/connectDB.js";
import { createAuditLog } from "../utils/auditLogger.js";

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
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getDeposits(page, limit, search);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching deposits", error });
        }
    }

    async updateDeposit(req: any, res: Response) {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : '';
            const { status } = req.body;
            if (!id) throw new Error("Deposit ID is required");
            const result = await dashboardService.updateDeposit(id, status);
            await createAuditLog(req, 'UPDATE', 'Deposit', `Deposit ${status} for ID: ${id}`, id, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating deposit", error });
        }
    }

    async getWithdrawals(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const search = (req.query["search"] as string) || '';
            const status = (req.query["status"] as string) || 'All';
            const data = await dashboardService.getWithdrawals(page, limit, search, status);
            res.json(data);
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

    async toggleUserStatus(req: any, res: Response) {
        try {
            const { email, active } = req.body;
            const result = await dashboardService.toggleUserStatus(email, active);
            await createAuditLog(req, 'UPDATE', 'User', `User ${active ? 'activated' : 'deactivated'}: ${email}`, email, null, undefined, result.oldUser, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error) {
            res.status(500).json({ message: "Error toggling user status", error });
        }
    }

    async editUser(req: any, res: Response) {
        try {
            const email = typeof req.params.email === 'string' ? req.params.email : '';
            const { name, number } = req.body;
            if (!email) throw new Error("Email is required");
            const result = await dashboardService.editUser(email, name, number);
            await createAuditLog(req, 'UPDATE', 'User', `Edited user details for: ${email}`, email, null, undefined, result.oldUser, result.updated);
            res.json({ status: "success", user: result.updated });
        } catch (error) {
            res.status(500).json({ message: "Error editing user", error });
        }
    }

    async toggleInvestmentAllowed(req: any, res: Response) {
        try {
            const email = typeof req.params.email === 'string' ? req.params.email : '';
            if (!email) throw new Error("Email is required");
            const result = await dashboardService.toggleInvestmentAllowed(email);
            await createAuditLog(req, 'UPDATE', 'Investment', `Toggled investment status for: ${email}`, email, null, undefined, result.oldUser, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error) {
            res.status(500).json({ message: "Error toggling investment status", error });
        }
    }

    async verifyKYC(req: any, res: Response) {
        try {
            const { email } = req.params;
            const { status } = req.body;
            const result = await dashboardService.verifyKYC(email as string, status);
            await createAuditLog(req, 'UPDATE', 'KYC', `KYC ${status} for email: ${email}`, email as string, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error) {
            res.status(500).json({ message: "Error verifying KYC", error });
        }
    }

    async updateWithdrawal(req: any, res: Response) {
        try {
            const { id } = req.params;
            const { withdrawStatus } = req.body;
            const result = await dashboardService.updateWithdrawal(id as string, withdrawStatus);
            await createAuditLog(req, 'UPDATE', 'Withdraw', `Withdrawal ${withdrawStatus} for ID: ${id}`, id as string, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating withdrawal", error });
        }
    }

    async closeInvestment(req: any, res: Response) {
        try {
            const email = typeof req.params.email === 'string' ? req.params.email : '';
            if (!email) throw new Error("Email is required");
            const result = await dashboardService.closeInvestment(email);
            await createAuditLog(req, 'DELETE', 'Investment', `Closed investment for user: ${email}`, email);
            res.json({ status: "success", ...result });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message || "Error closing investment" });
        }
    }

    async closePlatinumInvestment(req: any, res: Response) {
        try {
            const email = typeof req.params.email === 'string' ? req.params.email : '';
            if (!email) throw new Error("Email is required");
            const result = await dashboardService.closePlatinumInvestment(email);
            await createAuditLog(req, 'DELETE', 'PlatinumInvestment', `Closed platinum investment for user: ${email}`, email);
            res.json({ status: "success", ...result });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message || "Error closing platinum investment" });
        }
    }

    async getWalletBalancePersonal(req: Request, res: Response) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ status: "error", message: "Email is required" });
            }
            const balance = await dashboardService.getWalletBalancePersonal(String(email));
            res.json({ status: "success", wallet: { balance } });
        } catch (error) {
            res.status(500).json({ message: "Error fetching personal wallet balance", error });
        }
    }

    async getAllWalletsPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const data = await dashboardService.getAllWalletsPaginated(page, limit, searchTerm);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error fetching wallet list", error });
        }
    }

    async getWalletHistoryPaginated(req: Request, res: Response) {
        try {
            const email = (req.query["email"] as string) || '';
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getWalletHistoryPaginated(email, page, limit);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Error fetching wallet history", error });
        }
    }

    async updateWallet(req: any, res: Response) {
        try {
            const { email, amount } = req.body;
            const result = await dashboardService.updateWallet(email, amount);
            await createAuditLog(req, 'UPDATE', 'Wallet', `Manually updated wallet for user: ${email}. New balance adjustment: ${amount}`, email, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", data: { Withdraw: result.updated } }); // Matches some old logic expectations
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

    async getAllUsersGwcCoinsPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const searchTerm = (req.query["searchTerm"] as string) || '';
            const data = await dashboardService.getAllUsersGwcCoinsPaginated(page, limit, searchTerm);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching user coins", error });
        }
    }

    async getGwcCoinHistoryPaginated(req: Request, res: Response) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ status: "error", message: "Email is required" });
            }
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const data = await dashboardService.getGwcCoinHistoryPaginated(String(email), page, limit);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching coin history", error });
        }
    }

    async addGwcCoins(req: any, res: Response) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ status: "error", message: "Email is required" });
            }
            const { coinsToManage } = req.body;
            const result = await dashboardService.manageGwcCoins(String(email), coinsToManage, 'add');
            await createAuditLog(req, 'UPDATE', 'GWC', `Added ${coinsToManage} GWC coins to: ${email}`, email, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", totalCoins: result.updated?.totalCoins });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error adding coins", error });
        }
    }

    async deductGwcCoins(req: any, res: Response) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ status: "error", message: "Email is required" });
            }
            const { coinsToManage } = req.body;
            const result = await dashboardService.manageGwcCoins(String(email), coinsToManage, 'deduct');
            await createAuditLog(req, 'UPDATE', 'GWC', `Deducted ${coinsToManage} GWC coins from: ${email}`, email, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", totalCoins: result.updated?.totalCoins });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error deducting coins", error });
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

    async login(req: any, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await dashboardService.login(email, password);

            if (result.status === 'success') {
                await createAuditLog(req, 'LOGIN', 'Admin', `Admin successfully logged in: ${email}`, result.userId, null, { id: result.userId, email: email });
            } else {
                // Log failed attempts or locks with explicit identity placeholders
                await createAuditLog(req, 'SECURITY', 'Admin', `Failed login attempt or lock: ${email}. Reason: ${result.message}`, 'unknown', null, { id: 'UNAUTHENTICATED', email: email });
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Error during login", error });
        }
    }

    async logout(req: any, res: Response) {
        try {
            const email = req.user?.email || 'Unknown';
            const userId = req.user?.id || 'Unknown';
            await createAuditLog(req, 'LOGOUT', 'Admin', `Admin logged out: ${email}`, userId);
            res.json({ status: "success", message: "Logged out successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error during logout", error });
        }
    }

    async getMe(req: any, res: Response) {
        try {
            const email = req.user.email;
            const result = await dashboardService.getMe(email);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user info", error });
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

    async updateSelfIncome(req: any, res: Response) {
        try {
            const { email, income, date } = req.body;
            const result = await dashboardService.updateSelfIncome(email, income, date);
            await createAuditLog(req, 'UPDATE', 'Income', `Updated self income for: ${email}. Amount: ${income}`, email, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", result: result.updated });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating self income", error });
        }
    }

    async updatePlatinumIncome(req: any, res: Response) {
        try {
            const { email, income, date } = req.body;
            const result = await dashboardService.updatePlatinumIncome(email, income, date);
            await createAuditLog(req, 'UPDATE', 'PlatinumIncome', `Updated platinum income for: ${email}. Amount: ${income}`, email, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", result: result.updated });
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

    async updateReferalIncome(req: any, res: Response) {
        try {
            const { owner, member, income, level, date } = req.body;
            const result = await dashboardService.updateReferalIncome(owner, member, income, level, date);
            await createAuditLog(req, 'UPDATE', 'ReferalIncome', `Updated referral income for owner: ${owner}, member: ${member}. Amount: ${income}`, owner, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", result: result.updated });
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

    async updateTransfer(req: any, res: Response) {
        try {
            const { owner, member, amount, date } = req.body;
            const result = await dashboardService.updateTransfer(owner, member, amount, date);
            await createAuditLog(req, 'UPDATE', 'Transfer', `Updated transfer for owner: ${owner}, member: ${member}. Amount: ${amount}`, owner, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", result: result.updated });
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error updating transfer", error });
        }
    }

    async getRealTimeIncomeStats(req: Request, res: Response) {
        try {
            const data = await dashboardService.getRealTimeIncomeStats();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching real-time income stats", error });
        }
    }

    async getIncomeProjections(req: Request, res: Response) {
        try {
            const data = await dashboardService.getIncomeProjections(req.query);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching income projections", error });
        }
    }

    // Shift History Controllers (matching MLM backend)
    async getShiftHistory(req: Request, res: Response) {
        try {
            const data = await dashboardService.getShiftHistory(req.query);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: "Error fetching shift history",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getShiftHistoryDetails(req: Request, res: Response) {
        try {
            const id = typeof req.params.id === 'string' ? req.params.id : '';
            const data = await dashboardService.getShiftHistoryDetails(id);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('required') ? 400 : 500;
            res.status(statusCode).json({
                status: 'error',
                message: error instanceof Error ? error.message : "Error fetching shift history details"
            });
        }
    }

    async getShiftHistoryStats(req: Request, res: Response) {
        try {
            const data = await dashboardService.getShiftHistoryStats(req.query);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: "Error fetching shift history stats",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async exportShiftHistoryCSV(req: Request, res: Response) {
        try {
            const csv = await dashboardService.exportShiftHistoryCSV(req.query);
            const timestamp = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="shift-history-${timestamp}.csv"`);
            res.send(csv);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: "Error exporting shift history",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getInvestmentWithdrawals(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getInvestmentWithdrawals(page, limit, search);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message || "Error fetching investment withdrawals", error });
        }
    }

    async updateInvestmentWithdrawalStatus(req: any, res: Response) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id || '');
            const { status } = req.body;
            if (!id) throw new Error("Request ID is required");
            const result = await dashboardService.updateInvestmentWithdrawalStatus(id as string, status);
            await createAuditLog(req, 'UPDATE', 'InvestmentWithdrawal', `Investment withdrawal ${status} for ID: ${id}`, id as string, null, undefined, result.oldData, result.updated);
            res.json({ status: "success", data: result.updated });
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message || "Error updating investment withdrawal status", error });
        }
    }

    // --- NEW PAGINATED CONTROLLERS ---

    async getAllInvestsPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getAllInvestsPaginated(page, limit, search);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching investments", error });
        }
    }

    async getAllInvestHistoryPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getAllInvestHistoryPaginated(page, limit, search);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching investment history", error });
        }
    }

    async getPlatinumInvestorsPaginated(req: Request, res: Response) {
        try {
            const page = parseInt(req.query["page"] as string) || 1;
            const limit = parseInt(req.query["limit"] as string) || 20;
            const search = (req.query["search"] as string) || '';
            const data = await dashboardService.getPlatinumInvestorsPaginated(page, limit, search);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching platinum investors", error });
        }
    }

    async getPlatinumPaymentHistories(req: Request, res: Response) {
        try {
            const params = {
                page: parseInt(req.query["page"] as string) || 1,
                limit: parseInt(req.query["limit"] as string) || 10,
                sortBy: (req.query["sortBy"] as string) || 'createdAt',
                sortOrder: (req.query["sortOrder"] as string) || 'desc',
                search: (req.query["search"] as string),
                email: (req.query["email"] as string),
                subscription: (req.query["subscription"] as string),
                action: (req.query["action"] as string),
                type: (req.query["type"] as string),
                startDate: (req.query["startDate"] as string),
                endDate: (req.query["endDate"] as string),
            };
            const data = await dashboardService.getPlatinumPaymentHistories(params);
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching platinum histories", error });
        }
    }

    async getPlatinumPaymentFilters(req: Request, res: Response) {
        try {
            const data = await dashboardService.getPlatinumPaymentFilters();
            res.json(data);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Error fetching platinum history filters", error });
        }
    }

    async setup2FA(req: any, res: Response) {
        try {
            const email = req.user.email;
            const result = await dashboardService.generate2FASecret(email);
            await createAuditLog(req, 'UPDATE', 'Admin', `2FA Setup initiated for ${email}`, email);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async enable2FA(req: any, res: Response) {
        try {
            const email = req.user.email;
            const { token } = req.body;
            const result = await dashboardService.verify2FAAndEnable(email, token);
            if (result.status === 'success') {
                await createAuditLog(req, 'UPDATE', 'Admin', `2FA Enabled for ${email}`, email);
            }
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async disable2FAByAdmin(req: any, res: Response) {
        try {
            const email = req.user.email;
            const result = await dashboardService.disable2FA(email);
            await createAuditLog(req, 'UPDATE', 'Admin', `2FA Disabled for ${email}`, email);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    async verify2FALogin(req: any, res: Response) {
        try {
            const { email, token, tempToken } = req.body;
            const result = await dashboardService.verify2FALogin(email, token, tempToken);
            if (result.status === 'success') {
                await createAuditLog(req, 'LOGIN', 'Admin', `Admin completed 2FA login: ${email}`, result.userId, null, { id: result.userId, email });
            } else {
                await createAuditLog(req, 'SECURITY', 'Admin', `Failed 2FA verification: ${email}. Reason: ${result.message}`, 'unknown', null, { id: 'UNAUTHENTICATED', email });
            }
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
}
