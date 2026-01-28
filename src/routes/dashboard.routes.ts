import { Router } from "express";
import mongoose from "mongoose";
import { DashboardController } from "../controllers/dashboard.controller.js";

const router = Router();
const dashboardController = new DashboardController();

// Core Data Routes
router.get("/user/getUsers/all", dashboardController.getAllUsers.bind(dashboardController));
router.get("/deposit/getDeposit", dashboardController.getDeposits.bind(dashboardController));
router.get("/withdraw/getWithdraw", dashboardController.getWithdrawals.bind(dashboardController));
router.get("/transfer/getTransferall", dashboardController.getAllTransfersPaginated.bind(dashboardController));
router.post("/transfer/admin/updateTransfer", dashboardController.updateTransfer.bind(dashboardController));
router.get("/wallet/total-balance-excluding", dashboardController.getWalletBalance.bind(dashboardController));

// Investment Routes
router.get("/invest/summary", dashboardController.getInvestmentSummary.bind(dashboardController));
router.get("/platinum/admin/investors", dashboardController.getPlatinumInvestors.bind(dashboardController));

// Investor & Email Routes
router.get("/email/active-investors", dashboardController.getActiveInvestors.bind(dashboardController));
router.get("/email/inactive-investors", dashboardController.getInactiveInvestors.bind(dashboardController));

// Unified Summary Route for extreme performance
router.get("/dashboard/summary", dashboardController.getSummary.bind(dashboardController));

// Administrative Actions
router.get("/kyc/processing", dashboardController.getKYCs.bind(dashboardController));
router.put("/user/toggleActiveStatusByEmail", dashboardController.toggleUserStatus.bind(dashboardController));
router.put("/user/editUser/:email", dashboardController.editUser.bind(dashboardController));
router.put("/invest/toggle-investment-allowed/:email", dashboardController.toggleInvestmentAllowed.bind(dashboardController));
router.patch("/kyc/verify/:email", dashboardController.verifyKYC.bind(dashboardController));
router.post("/withdraw/updateWithdraw/:id", dashboardController.updateWithdrawal.bind(dashboardController));
router.get("/wallet/walletbalance/:email", dashboardController.getWalletBalancePersonal.bind(dashboardController));
router.get("/wallet/all", dashboardController.getAllWalletsPaginated.bind(dashboardController));
router.get("/wallet/history", dashboardController.getWalletHistoryPaginated.bind(dashboardController));
router.post("/wallet/updateWallet", dashboardController.updateWallet.bind(dashboardController));
router.get("/referal/getReferal/:id", dashboardController.getReferral.bind(dashboardController));
router.get("/user/getUser/:email", dashboardController.getUser.bind(dashboardController));
router.get("/invest/get-invest/:email", dashboardController.getInvest.bind(dashboardController));
router.get("/platinum/get-invest/:email", dashboardController.getPlatinumInvest.bind(dashboardController));
router.get("/subTeam/getSubTeamall", dashboardController.getSubTeamall.bind(dashboardController));
router.get("/referalIncome/getReferalIncomeAll", dashboardController.getAllReferalIncomePaginated.bind(dashboardController));
router.post("/referalIncome/admin/updateReferalIncome", dashboardController.updateReferalIncome.bind(dashboardController));
router.get("/admin/team-details", dashboardController.getTeamDetailsAdmin.bind(dashboardController));
router.get("/teamincome/admin/getAllTeamIncomePaginated", dashboardController.getAllTeamIncomePaginated.bind(dashboardController));
router.get("/platinum/admin/team-income", dashboardController.getAllPlatinumTeamIncome.bind(dashboardController));
router.get("/income/admin/getAllIncomePaginated", dashboardController.getAllSelfIncomePaginated.bind(dashboardController));
router.post("/income/admin/updateSelfIncome", dashboardController.updateSelfIncome.bind(dashboardController));
router.post("/platinum/admin/updatePlatinumIncome", dashboardController.updatePlatinumIncome.bind(dashboardController));
// GWC Coin Routes
router.get("/gwc/all-users-coins", dashboardController.getAllUsersGwcCoinsPaginated.bind(dashboardController));
router.get("/gwc/coinsHistory/:email", dashboardController.getGwcCoinHistoryPaginated.bind(dashboardController));
router.post("/gwc/addCoins/:email", dashboardController.addGwcCoins.bind(dashboardController));
router.post("/gwc/deductCoins/:email", dashboardController.deductGwcCoins.bind(dashboardController));

// Income Statistics Routes
router.get("/incomestats/realtime", dashboardController.getRealTimeIncomeStats.bind(dashboardController));
router.get("/incomestats/projections", dashboardController.getIncomeProjections.bind(dashboardController));
router.get("/incomestats/user/:email/projections", (req, res) => {
    req.query["email"] = req.params["email"];
    return dashboardController.getIncomeProjections(req, res);
});

// Shift History Routes (matching MLM backend)
router.get("/admin/shift-history", dashboardController.getShiftHistory.bind(dashboardController));
router.get("/admin/shift-history/stats", dashboardController.getShiftHistoryStats.bind(dashboardController));
router.get("/admin/shift-history/export", dashboardController.exportShiftHistoryCSV.bind(dashboardController));
router.get("/admin/shift-history/:id", dashboardController.getShiftHistoryDetails.bind(dashboardController));

router.post("/auth/login", dashboardController.login.bind(dashboardController));

export default router;
