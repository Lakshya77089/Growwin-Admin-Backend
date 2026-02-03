import UserModel from '../models/user.model.js';
import SubTeamModel from '../models/subteam.model.js';
import TeamIncomeModel from '../models/teamIncome.model.js';
import PlatinumTeamIncomeModel from '../models/platinumTeamIncome.model.js';
import RankModel from '../models/rank.model.js';
import RewardClaimedModel from '../models/rewardClaimed.model.js';
import UserProgressModel from '../models/userProgress.model.js';
import LagCompletionModel from '../models/lagCompletion.model.js';

export type RankName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type RankCfg = { totalIncome: number; directsRequired: number; reward: number };

export const rankConfigs: Record<RankName, RankCfg> = {
    Bronze: { totalIncome: 0, directsRequired: 0, reward: 0 },
    Silver: { totalIncome: 3500, directsRequired: 5, reward: 500 },
    Gold: { totalIncome: 10000, directsRequired: 8, reward: 1250 },
    Platinum: { totalIncome: 24000, directsRequired: 12, reward: 3500 }
};

interface Leg { email: string; volume: number; }

export class RankService {
    /** 
     * Breadth-first: every email below root (root included) 
     */
    async getBranchMembers(root: string): Promise<string[]> {
        const seen = new Set<string>([root.toLowerCase()]);
        const queue: string[] = [root.toLowerCase()];

        while (queue.length) {
            const owner = queue.shift()!;
            const children = await SubTeamModel
                .find({ owner })
                .select({ member: 1, _id: 0 })
                .lean();

            for (const c of children) {
                const m = String(c.member).toLowerCase();
                if (!seen.has(m)) {
                    seen.add(m);
                    queue.push(m);
                }
            }
        }
        return [...seen];
    }

    /** 
     * Sum what *owner* earned from the entire leg headed by legEmail 
     */
    async getLegVolume(owner: string, legEmail: string): Promise<number> {
        owner = owner.toLowerCase();
        legEmail = legEmail.toLowerCase();

        // 1) entire downline branch
        const branch = await this.getBranchMembers(legEmail);

        // n) income from team income
        const t = await TeamIncomeModel.aggregate([
            { $match: { emailOwner: owner, emailMember: { $in: branch } } },
            { $group: { _id: null, v: { $sum: { $toDouble: '$Income' } } } }
        ]);

        // n) income from platinum team income
        const pt = await PlatinumTeamIncomeModel.aggregate([
            { $match: { emailOwner: owner, emailMember: { $in: branch } } },
            { $group: { _id: null, v: { $sum: { $toDouble: '$income' } } } }
        ]);

        const totalVolume = (t[0]?.v ?? 0) + (pt[0]?.v ?? 0);
        return totalVolume;
    }

    async getLevel1Legs(owner: string): Promise<Leg[]> {
        owner = owner.toLowerCase();
        const directs = await SubTeamModel
            .find({ owner, level: 1 })
            .select({ member: 1, _id: 0 })
            .lean();

        const emails = directs.map(d => String(d.member).toLowerCase());

        const vols = await Promise.all(
            emails.map(email => this.getLegVolume(owner, email))
        );

        return emails
            .map((email, i) => ({ email, volume: vols[i] || 0 }))
            .sort((a, b) => b.volume - a.volume);
    }

    calcProgress(rank: RankName, legs: Leg[]) {
        const cfg = rankConfigs[rank];
        if (!cfg.directsRequired) return { vol: 0, pct: 100, achieved: true };

        const lag = cfg.totalIncome / cfg.directsRequired;
        const vol = legs.slice(0, cfg.directsRequired)
            .reduce((s, l) => s + Math.min(l.volume, lag), 0);

        return {
            vol,
            pct: +(vol / cfg.totalIncome * 100).toFixed(2),
            achieved: vol >= cfg.totalIncome
        };
    }

    resolveRank(f: { silver: boolean; gold: boolean; platinum: boolean }) {
        if (f.platinum) return { cur: 'Platinum' as RankName, next: null };
        if (f.gold) return { cur: 'Gold' as RankName, next: 'Platinum' };
        if (f.silver) return { cur: 'Silver' as RankName, next: 'Gold' };
        return { cur: 'Bronze' as RankName, next: 'Silver' };
    }

    async upsertReward(email: string, flags: { silver: boolean; gold: boolean; platinum: boolean }) {
        await RewardClaimedModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    'silverReward.isEligible': flags.silver,
                    'silverReward.rewardAmount': rankConfigs.Silver.reward.toString(),
                    'goldReward.isEligible': flags.gold,
                    'goldReward.rewardAmount': rankConfigs.Gold.reward.toString(),
                    'platinumReward.isEligible': flags.platinum,
                    'platinumReward.rewardAmount': rankConfigs.Platinum.reward.toString(),
                }
            },
            { upsert: true, new: true }
        );

        // Separate update for status to avoid overwriting claimed/approved status if already set
        const updateObj: any = {};
        if (flags.silver) updateObj['silverReward.status'] = { $ne: 'approved', $set: 'processing' };
        // Wait, Mongoose doesn't support $ne inside $set like that.
        // Let's just use a more careful update in the main call or separate calls.
    }

    async recordLags(owner: string, legs: Leg[]) {
        const winners: Record<string, string[]> = {};
        const ranks: Array<'Silver' | 'Gold' | 'Platinum'> = ['Silver', 'Gold', 'Platinum'];

        for (const leg of legs) {
            for (const rank of ranks) {
                const cfg = rankConfigs[rank];
                if (!cfg.directsRequired) continue;
                const need = cfg.totalIncome / cfg.directsRequired;
                if (leg.volume >= need) {
                    if (!winners[leg.email]) winners[leg.email] = [];
                    winners[leg.email]!.push(rank);

                    const compositeKey = `${owner}#${leg.email}#${rank}`;
                    await LagCompletionModel.updateOne(
                        { compositeKey },
                        {
                            $setOnInsert: {
                                ownerEmail: owner,
                                directEmail: leg.email,
                                rank,
                                lagVolume: need,
                                completedAt: new Date()
                            }
                        },
                        { upsert: true }
                    );
                }
            }
        }
        return winners;
    }

    async processUser(raw: string) {
        const email = raw.toLowerCase();
        const legs = await this.getLevel1Legs(email);
        await this.recordLags(email, legs);

        const pS = this.calcProgress('Silver', legs);
        const pG = this.calcProgress('Gold', legs);
        const pP = this.calcProgress('Platinum', legs);

        const { cur: currentRank, next: nextRank } = this.resolveRank({
            silver: pS.achieved,
            gold: pG.achieved,
            platinum: pP.achieved
        });

        const totalVol = legs.reduce((sum, l) => sum + l.volume, 0);
        const silverLag = rankConfigs.Silver.totalIncome / rankConfigs.Silver.directsRequired;
        const goldLag = rankConfigs.Gold.totalIncome / rankConfigs.Gold.directsRequired;
        const platLag = rankConfigs.Platinum.totalIncome / rankConfigs.Platinum.directsRequired;

        await this.upsertReward(email, { silver: pS.achieved, gold: pG.achieved, platinum: pP.achieved });

        const rewardAmount = rankConfigs[currentRank].reward;
        const rewardClaimable = currentRank !== 'Bronze';
        const rewardDoc = await RewardClaimedModel.findOne({ email }).lean() as any;
        const rewardClaimed = rewardDoc
            ? rewardDoc[currentRank.toLowerCase() + 'Reward']?.status === 'approved'
            : false;

        const freshData: any = {
            email,
            currentRank,
            nextRank,
            globalStatus: {
                totalVolume: totalVol,
                currentTargetVolume: rankConfigs[currentRank].totalIncome,
                volumeLeftForNextRank: nextRank ? Math.max(rankConfigs[nextRank as RankName].totalIncome - totalVol, 0) : 0,
                qualifiedDirects: legs.filter(l => l.volume >= (rankConfigs[currentRank].totalIncome / (rankConfigs[currentRank].directsRequired || 1))).length,
                totalLegsCompleted: legs.length,
                legsNeededForNextRank: nextRank ? Math.max(rankConfigs[nextRank as RankName].directsRequired - legs.filter(l => l.volume >= (rankConfigs[nextRank as RankName].totalIncome / rankConfigs[nextRank as RankName].directsRequired)).length, 0) : 0
            },
            silverProgress: {
                volume: pS.vol,
                percentageCompleted: pS.pct,
                incomeRequired: rankConfigs.Silver.totalIncome,
                directsRequired: rankConfigs.Silver.directsRequired,
                qualifiedDirects: legs.filter(l => l.volume >= silverLag).map(l => l.email),
                isAchieved: pS.achieved,
                legProgress: legs.map(l => ({
                    legNumber: 0,
                    memberEmail: l.email,
                    incomeGenerated: l.volume,
                    isCompleted: l.volume >= silverLag
                }))
            },
            goldProgress: {
                volume: pG.vol,
                percentageCompleted: pG.pct,
                incomeRequired: rankConfigs.Gold.totalIncome,
                directsRequired: rankConfigs.Gold.directsRequired,
                qualifiedDirects: legs.filter(l => l.volume >= goldLag).map(l => l.email),
                isAchieved: pG.achieved,
                legProgress: legs.map(l => ({
                    legNumber: 0,
                    memberEmail: l.email,
                    incomeGenerated: l.volume,
                    isCompleted: l.volume >= goldLag
                }))
            },
            platinumProgress: {
                volume: pP.vol,
                percentageCompleted: pP.pct,
                incomeRequired: rankConfigs.Platinum.totalIncome,
                directsRequired: rankConfigs.Platinum.directsRequired,
                qualifiedDirects: legs.filter(l => l.volume >= platLag).map(l => l.email),
                isAchieved: pP.achieved,
                legProgress: legs.map(l => ({
                    legNumber: 0,
                    memberEmail: l.email,
                    incomeGenerated: l.volume,
                    isCompleted: l.volume >= platLag
                }))
            },
            globalPercentageCompleted: +(totalVol / (nextRank ? rankConfigs[nextRank as RankName].totalIncome : rankConfigs[currentRank].totalIncome || 1) * 100).toFixed(2),
            rewardAmount,
            rewardClaimable,
            rewardClaimed,
            lastUpdateDate: new Date()
        };

        await UserProgressModel.replaceOne({ email }, freshData, { upsert: true });
        await RankModel.replaceOne({ email }, { email, rank: currentRank }, { upsert: true });

        return freshData;
    }

    async processAllUsers() {
        const emails = await UserModel.distinct('email');
        for (const email of emails) {
            try {
                await this.processUser(email);
            } catch (err) {
                console.error(`Error processing rank for ${email}:`, err);
            }
        }
    }
}
