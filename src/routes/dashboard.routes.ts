import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";

const router = Router();
const dashboardController = new DashboardController();

// Core Data Routes
router.get("/user/getUsers/all", dashboardController.getAllUsers.bind(dashboardController));
router.get("/deposit/getDeposit", dashboardController.getDeposits.bind(dashboardController));
router.get("/withdraw/getWithdraw", dashboardController.getWithdrawals.bind(dashboardController));
router.get("/transfer/getTransferall", dashboardController.getTransfers.bind(dashboardController));
router.get("/wallet/total-balance-excluding", dashboardController.getWalletBalance.bind(dashboardController));

// Investment Routes
router.get("/invest/summary", dashboardController.getInvestmentSummary.bind(dashboardController));
router.get("/platinum/admin/investors", dashboardController.getPlatinumInvestors.bind(dashboardController));

// Investor & Email Routes
router.get("/email/active-investors", dashboardController.getActiveInvestors.bind(dashboardController));
router.get("/email/inactive-investors", dashboardController.getInactiveInvestors.bind(dashboardController));

export default router;
