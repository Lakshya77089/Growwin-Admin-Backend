import { Router } from "express";
import { RankController } from "../controllers/rank.controller.js";
import { protect, restrictTo } from "../middleware/rbac.middleware.js";

const router = Router();
const rankController = new RankController();

router.use(protect);

router.get("/dashboard", rankController.getDashboard.bind(rankController));
router.post("/reward-action", restrictTo('Super Admin', 'Manager'), rankController.rewardAction.bind(rankController));
router.get("/dashboard/export", rankController.exportCSV.bind(rankController));

export default router;
