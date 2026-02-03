import type { Request, Response } from "express";
import RewardClaimedModel from "../models/rewardClaimed.model.js";
import RankModel from "../models/rank.model.js";
import { RankService } from "../services/rank.service.js";
import { createAuditLog } from "../utils/auditLogger.js";

const rankService = new RankService();

export class RankController {
    /**
     * Dashboard Data for Rank Rewards
     */
    async getDashboard(req: Request, res: Response) {
        try {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
            const skip = (page - 1) * limit;

            const {
                tab = 'progress',
                search = '',
                rank,
                status,
                rewardType,
                startDate,
                endDate
            } = req.query as any;

            const pipeline: any[] = [
                {
                    $project: {
                        email: 1,
                        silverReward: 1,
                        goldReward: 1,
                        platinumReward: 1,
                        rewards: [
                            { type: 'silverReward', data: '$silverReward' },
                            { type: 'goldReward', data: '$goldReward' },
                            { type: 'platinumReward', data: '$platinumReward' }
                        ]
                    }
                },
                { $unwind: '$rewards' },

                /* TAB LOGIC */
                {
                    $match: {
                        ...(tab === 'claimed' && {
                            'rewards.data.isClaimed': true,
                            'rewards.data.status': 'processing'
                        }),
                        ...(tab === 'approved' && {
                            'rewards.data.status': 'approved'
                        }),
                        ...(tab === 'rejected' && {
                            'rewards.data.status': 'rejected'
                        }),
                        ...(tab === 'progress' && {
                            $or: [
                                { 'rewards.data.status': 'pending' },
                                { 'rewards.data.status': 'processing' }
                            ]
                        })
                    }
                },

                /* ADVANCED FILTERS */
                ...(status ? [{
                    $match: { 'rewards.data.status': status }
                }] : []),

                ...(rewardType ? [{
                    $match: { 'rewards.type': rewardType }
                }] : []),

                ...(search ? [{
                    $match: { email: { $regex: search, $options: 'i' } }
                }] : []),

                ...(startDate && endDate ? [{
                    $match: {
                        'rewards.data.updatedAt': {
                            $gte: new Date(startDate as string),
                            $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
                        }
                    }
                }] : []),

                /* JOIN RANK */
                {
                    $lookup: {
                        from: 'ranks',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'rankInfo'
                    }
                },
                { $unwind: { path: '$rankInfo', preserveNullAndEmptyArrays: true } },

                ...(rank ? [{ $match: { 'rankInfo.rank': rank } }] : []),

                // Sort by updatedAt descending
                { $sort: { 'rewards.data.updatedAt': -1 } },

                {
                    $facet: {
                        data: [{ $skip: skip }, { $limit: limit }],
                        meta: [{ $count: 'total' }]
                    }
                }
            ];

            const result = await RewardClaimedModel.aggregate(pipeline);
            const total = result[0]?.meta?.[0]?.total || 0;

            res.json({
                status: "success",
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
                data: (result[0].data || []).map((r: any) => ({
                    _id: r._id,
                    email: r.email,
                    rank: r.rankInfo?.rank || 'N/A',
                    rewardType: r.rewards.type,
                    reward: {
                        ...r.rewards.data,
                        claimedDate: r.rewards.data.isClaimed ? r.rewards.data.updatedAt : null
                    }
                }))
            });

        } catch (err: any) {
            console.error('Rank dashboard fetch failed:', err);
            res.status(500).json({
                status: "error",
                message: 'Dashboard fetch failed',
                error: err.message
            });
        }
    }

    /**
     * Approve or Reject a Reward Action
     */
    async rewardAction(req: any, res: Response) {
        try {
            const {
                userId,
                rewardType,
                action
            } = req.body as {
                userId: string;
                rewardType: 'silverReward' | 'goldReward' | 'platinumReward';
                action: 'approve' | 'reject';
            };

            if (!userId || !rewardType || !action) {
                return res.status(400).json({ status: "error", message: 'Missing required fields' });
            }

            const rewardClaim = await RewardClaimedModel.findById(userId);
            if (!rewardClaim) {
                return res.status(404).json({ status: "error", message: 'Reward record not found' });
            }

            const reward = (rewardClaim as any)[rewardType];

            // Business Rules
            if (!reward.isEligible) {
                return res.status(400).json({ status: "error", message: 'Reward not eligible' });
            }
            if (!reward.isClaimed) {
                return res.status(400).json({ status: "error", message: 'Reward not claimed' });
            }
            if (['approved', 'rejected'].includes(reward.status)) {
                return res.status(400).json({ status: "error", message: 'Reward already processed' });
            }

            const now = new Date();
            const oldData = { ...reward };

            if (action === 'approve') {
                reward.status = 'approved';
                reward.approvedDate = now;
            } else {
                reward.status = 'rejected';
                reward.isClaimed = false; // Reset claim when rejected
                reward.approvedDate = undefined;
            }

            reward.updatedAt = now;
            rewardClaim.markModified(rewardType);
            await rewardClaim.save();

            // Audit Log
            await createAuditLog(
                req,
                'UPDATE',
                'RANK',
                `Reward ${action}d for ${rewardClaim.email} (${rewardType})`,
                rewardClaim.email,
                null,
                undefined,
                oldData,
                reward
            );

            res.json({
                status: "success",
                message: `Reward ${action}ed successfully`
            });

        } catch (err: any) {
            console.error('Reward action failed:', err);
            res.status(500).json({
                status: "error",
                message: 'Error processing reward action',
                error: err.message
            });
        }
    }

    /**
     * Export CSV Data
     */
    async exportCSV(req: Request, res: Response) {
        try {
            const {
                tab = 'progress',
                search = '',
                rank,
                status,
                rewardType,
                startDate,
                endDate
            } = req.query as any;

            const pipeline: any[] = [
                {
                    $project: {
                        email: 1,
                        rewards: [
                            { type: 'silverReward', data: '$silverReward' },
                            { type: 'goldReward', data: '$goldReward' },
                            { type: 'platinumReward', data: '$platinumReward' }
                        ]
                    }
                },
                { $unwind: '$rewards' },

                /* TAB LOGIC */
                {
                    $match: {
                        ...(tab === 'claimed' && {
                            'rewards.data.isClaimed': true,
                            'rewards.data.status': 'processing'
                        }),
                        ...(tab === 'approved' && {
                            'rewards.data.status': 'approved'
                        }),
                        ...(tab === 'rejected' && {
                            'rewards.data.status': 'rejected'
                        }),
                        ...(tab === 'progress' && {
                            $or: [
                                { 'rewards.data.status': 'pending' },
                                { 'rewards.data.status': 'processing' }
                            ]
                        })
                    }
                },

                /* FILTERS */
                ...(status ? [{ $match: { 'rewards.data.status': status } }] : []),
                ...(rewardType ? [{ $match: { 'rewards.type': rewardType } }] : []),
                ...(search ? [{ $match: { email: { $regex: search, $options: 'i' } } }] : []),
                ...(startDate && endDate ? [{
                    $match: {
                        'rewards.data.updatedAt': {
                            $gte: new Date(startDate as string),
                            $lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999))
                        }
                    }
                }] : []),

                /* JOIN RANK */
                {
                    $lookup: {
                        from: 'ranks',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'rankInfo'
                    }
                },
                { $unwind: { path: '$rankInfo', preserveNullAndEmptyArrays: true } }
            ];

            const data = await RewardClaimedModel.aggregate(pipeline);

            const headers = [
                'Email', 'Rank', 'RewardType', 'Amount', 'Status', 'Claimed', 'Claimed Date', 'Approved Date', 'Last Updated'
            ];

            const rows = data.map((r: any) => ([
                r.email || '',
                r.rankInfo?.rank || 'N/A',
                r.rewards.type || '',
                r.rewards.data.rewardAmount || '0',
                r.rewards.data.status || 'pending',
                r.rewards.data.isClaimed ? 'YES' : 'NO',
                r.rewards.data.isClaimed ? new Date(r.rewards.data.updatedAt).toLocaleString() : 'N/A',
                r.rewards.data.approvedDate ? new Date(r.rewards.data.approvedDate).toLocaleString() : 'N/A',
                new Date(r.rewards.data.updatedAt).toLocaleString()
            ]));

            const csv = headers.join(',') + '\n' +
                rows.map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=rank-dashboard-export.csv');
            res.send(csv);

        } catch (err: any) {
            console.error('CSV export failed:', err);
            res.status(500).json({ status: "error", message: 'CSV export failed', error: err.message });
        }
    }

    /**
     * Trigger manual rank update for a specific user
     */
    async manualUpdate(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ status: "error", message: "Email is required" });
            }

            await rankService.processUser(email as string);
            res.json({ status: "success", message: `Rank updated for ${email}` });
        } catch (err: any) {
            res.status(500).json({ status: "error", message: "Manual update failed", error: err.message });
        }
    }

    /**
     * Trigger bulk rank update for all users
     */
    async bulkUpdate(req: Request, res: Response) {
        try {
            rankService.processAllUsers().catch(console.error);
            res.json({ status: "success", message: "Bulk rank update started in background" });
        } catch (err: any) {
            res.status(500).json({ status: "error", message: "Bulk update failed", error: err.message });
        }
    }
}
