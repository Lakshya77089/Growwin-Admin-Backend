import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { protect, restrictTo } from "../middleware/rbac.middleware.js";

const router = Router();
const dashboardController = new DashboardController();

// Core Data Routes
router.use("/user", protect);
router.use("/deposit", protect);
router.use("/withdraw", protect);
router.use("/transfer", protect);
router.use("/wallet", protect);
router.use("/invest", protect);
router.use("/admin", protect);
router.use("/team", protect);
router.use("/income", protect);
router.use("/rank", protect);
router.use("/platinum", protect);
router.use("/gwc", protect);
router.use("/incomestats", protect);

router.get("/user/getUsers/all", dashboardController.getAllUsers.bind(dashboardController));
router.get("/deposit/getDeposit", dashboardController.getDeposits.bind(dashboardController));
router.post("/deposit/updateDeposit/:id", restrictTo('Super Admin', 'Manager'), dashboardController.updateDeposit.bind(dashboardController));
router.get("/withdraw/getWithdraw", dashboardController.getWithdrawals.bind(dashboardController));
router.get("/transfer/getTransferall", dashboardController.getAllTransfersPaginated.bind(dashboardController));
router.post("/transfer/admin/updateTransfer", restrictTo('Super Admin', 'Manager'), dashboardController.updateTransfer.bind(dashboardController));
router.get("/wallet/total-balance-excluding", dashboardController.getWalletBalance.bind(dashboardController));

// Investment Routes
router.get("/invest/summary", dashboardController.getInvestmentSummary.bind(dashboardController));
router.get("/invest/admin/invests", dashboardController.getAllInvestsPaginated.bind(dashboardController));
router.get("/invest/admin/invest-history", dashboardController.getAllInvestHistoryPaginated.bind(dashboardController));
router.get("/platinum/admin/investors", dashboardController.getPlatinumInvestors.bind(dashboardController));
router.get("/platinum/admin/investors/paginated", dashboardController.getPlatinumInvestorsPaginated.bind(dashboardController));
router.get("/paltinumhistory/admin/platinum-histories", dashboardController.getPlatinumPaymentHistories.bind(dashboardController));
router.get("/paltinumhistory/admin/platinum-histories/filters", dashboardController.getPlatinumPaymentFilters.bind(dashboardController));

// Investor & Email Routes
router.get("/email/active-investors", dashboardController.getActiveInvestors.bind(dashboardController));
router.get("/email/inactive-investors", dashboardController.getInactiveInvestors.bind(dashboardController));

// Unified Summary Route for extreme performance
router.get("/dashboard/summary", dashboardController.getSummary.bind(dashboardController));

// Administrative Actions
router.get("/kyc/processing", dashboardController.getKYCs.bind(dashboardController));
router.put("/user/toggleActiveStatusByEmail", restrictTo('Super Admin', 'Manager'), dashboardController.toggleUserStatus.bind(dashboardController));
router.put("/user/editUser/:email", restrictTo('Super Admin', 'Manager'), dashboardController.editUser.bind(dashboardController));
router.put("/invest/toggle-investment-allowed/:email", restrictTo('Super Admin', 'Manager'), dashboardController.toggleInvestmentAllowed.bind(dashboardController));
router.patch("/kyc/verify/:email", restrictTo('Super Admin', 'Manager'), dashboardController.verifyKYC.bind(dashboardController));
router.post("/withdraw/updateWithdraw/:id", restrictTo('Super Admin', 'Manager'), dashboardController.updateWithdrawal.bind(dashboardController));
router.get("/wallet/walletbalance/:email", dashboardController.getWalletBalancePersonal.bind(dashboardController));
router.get("/wallet/all", dashboardController.getAllWalletsPaginated.bind(dashboardController));
router.get("/wallet/history", dashboardController.getWalletHistoryPaginated.bind(dashboardController));
router.post("/wallet/updateWallet", restrictTo('Super Admin', 'Manager'), dashboardController.updateWallet.bind(dashboardController));
router.get("/referal/getReferal/:id", dashboardController.getReferral.bind(dashboardController));
router.get("/user/getUser/:email", dashboardController.getUser.bind(dashboardController));
router.get("/invest/get-invest/:email", dashboardController.getInvest.bind(dashboardController));
router.get("/platinum/get-invest/:email", dashboardController.getPlatinumInvest.bind(dashboardController));
router.post("/invest/close/:email", restrictTo('Super Admin', 'Manager'), dashboardController.closeInvestment.bind(dashboardController));
router.post("/platinum/close/:email", restrictTo('Super Admin', 'Manager'), dashboardController.closePlatinumInvestment.bind(dashboardController));
router.get("/investmentwithdrawl/withdrawals", dashboardController.getInvestmentWithdrawals.bind(dashboardController));
router.patch("/investmentwithdrawl/withdrawal/:id", restrictTo('Super Admin', 'Manager'), dashboardController.updateInvestmentWithdrawalStatus.bind(dashboardController));
router.get("/subTeam/getSubTeamall", dashboardController.getSubTeamall.bind(dashboardController));
router.get("/referalIncome/getReferalIncomeAll", dashboardController.getAllReferalIncomePaginated.bind(dashboardController));
router.post("/referalIncome/admin/updateReferalIncome", restrictTo('Super Admin', 'Manager'), dashboardController.updateReferalIncome.bind(dashboardController));
router.get("/admin/team-details", dashboardController.getTeamDetailsAdmin.bind(dashboardController));
router.get("/teamincome/admin/getAllTeamIncomePaginated", dashboardController.getAllTeamIncomePaginated.bind(dashboardController));
router.get("/platinum/admin/team-income", dashboardController.getAllPlatinumTeamIncome.bind(dashboardController));
router.get("/income/admin/getAllIncomePaginated", dashboardController.getAllSelfIncomePaginated.bind(dashboardController));
router.post("/income/admin/updateSelfIncome", restrictTo('Super Admin', 'Manager'), dashboardController.updateSelfIncome.bind(dashboardController));
router.post("/platinum/admin/updatePlatinumIncome", restrictTo('Super Admin', 'Manager'), dashboardController.updatePlatinumIncome.bind(dashboardController));
// GWC Coin Routes
router.get("/gwc/all-users-coins", dashboardController.getAllUsersGwcCoinsPaginated.bind(dashboardController));
router.get("/gwc/coinsHistory/:email", dashboardController.getGwcCoinHistoryPaginated.bind(dashboardController));
router.post("/gwc/addCoins/:email", restrictTo('Super Admin', 'Manager'), dashboardController.addGwcCoins.bind(dashboardController));
router.post("/gwc/deductCoins/:email", restrictTo('Super Admin', 'Manager'), dashboardController.deductGwcCoins.bind(dashboardController));

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
router.post("/auth/logout", protect, dashboardController.logout.bind(dashboardController));
router.get("/auth/me", protect, dashboardController.getMe.bind(dashboardController));

// 2FA Routes
router.post("/auth/2fa/setup", protect, dashboardController.setup2FA.bind(dashboardController));
router.post("/auth/2fa/enable", protect, dashboardController.enable2FA.bind(dashboardController));
router.post("/auth/2fa/disable", protect, dashboardController.disable2FAByAdmin.bind(dashboardController));
router.post("/auth/2fa/verify-login", dashboardController.verify2FALogin.bind(dashboardController));

export default router;
