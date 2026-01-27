import UserModel from "../models/user.model.js";
import DepositModel from "../models/deposit.model.js";
import WithdrawModel from "../models/withdraw.model.js";
import TransferModel from "../models/transfer.model.js";
import WalletModel from "../models/wallet.model.js";
import InvestModel from "../models/invest.model.js";
import PlatinumInvestModel from "../models/platinumInvest.model.js";
import KYCModel from "../models/kyc.model.js";
import ReferalModel from "../models/referal.model.js";
import SubteamModel from "../models/subteam.model.js";
import ReferalIncomeModel from "../models/referalIncome.model.js";

export class DashboardService {
    async getAllUsers(page: number = 1, limit: number = 20, filter: string = 'all', search: string = '') {
        try {
            let query: any = {};

            // Handle filtering
            if (filter === 'active') {
                query.active = true;
            } else if (filter === 'inactive') {
                query.active = false;
            } else if (filter === 'active-invest') {
                query.active = true;
                query.investmentAllowed = true;
            } else if (filter === 'inactive-invest') {
                query.active = true;
                query.investmentAllowed = false;
            }

            // Handle searching
            if (search) {
                const searchRegex = new RegExp(search, 'i');

                // Find potential referral codes matching the search (searching ReferalModel by email)
                const matchingReferals = await ReferalModel.find({ email: searchRegex }, 'referal').lean();
                const matchingRefCodes = matchingReferals.map(r => r.referal);

                query.$or = [
                    { name: searchRegex },
                    { email: searchRegex },
                    { refree: { $in: matchingRefCodes } }
                ];
            }

            const skip = (page - 1) * limit;
            const total = await UserModel.countDocuments(query);

            // Fetch paginated real users from database
            const users = await UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            // Only fetch metadata for users on the current page
            const emails = users.map(u => u.email);
            const kycs = await KYCModel.find({ email: { $in: emails } }, 'email status').lean();
            const kycMap = new Map(kycs.map(k => [k.email, k.status]));

            const refCodes = [...new Set(users.map(u => u.refree).filter(c => typeof c === 'string' && c !== "null" && c !== "Not Referred"))] as string[];
            const referals = await ReferalModel.find({ referal: { $in: refCodes } }, 'email referal').lean();
            const referalMap = new Map(referals.map(r => [r.referal, r.email]));

            const formattedUsers = users.map(u => ({
                ...u,
                kycStatus: kycMap.get(u.email) || 'not verified',
                referrerEmail: u.refree ? (referalMap.get(u.refree) || "Not Referred") : "Not Referred"
            }));

            return {
                status: "success",
                user: formattedUsers,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getDeposits(page: number = 1, limit: number = 20, search: string = '') {
        try {
            let query: any = {};
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { email: searchRegex },
                    { orderid: searchRegex },
                    { txid: searchRegex }
                ];
                if (!isNaN(Number(search))) {
                    query.$or.push({ amount: Number(search) });
                }
            }

            const skip = (page - 1) * limit;
            const total = await DepositModel.countDocuments(query);
            const deposits = await DepositModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            const Deposit: any = {};
            deposits.forEach((d, idx) => {
                Deposit[`d${skip + idx}`] = {
                    ...d,
                    amount: d.amount.toString(),
                    createdAt: d.createdAt
                };
            });

            return {
                status: "success",
                Deposit,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getWithdrawals(page: number = 1, limit: number = 20, search: string = '') {
        try {
            let query: any = {};
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { email: searchRegex },
                    { orderid: searchRegex }
                ];
                if (!isNaN(Number(search))) {
                    query.$or.push({ amount: Number(search) });
                }
            }

            const skip = (page - 1) * limit;
            const total = await WithdrawModel.countDocuments(query);
            const withdrawals = await WithdrawModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            const Withdraw: any = {};
            withdrawals.forEach((w, idx) => {
                Withdraw[`w${skip + idx}`] = {
                    ...w,
                    amount: w.amount.toString(),
                    createdAt: w.createdAt
                };
            });

            return {
                status: "success",
                Withdraw,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getTransfers() {
        try {
            // Optimization: The original transfers collection has 14,000+ records.
            // Aggregating by month reduces this to ~12-24 objects.
            const stats = await TransferModel.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: { $ifNull: ["$createdAt", new Date()] } },
                            year: { $year: { $ifNull: ["$createdAt", new Date()] } }
                        },
                        total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } }
                    }
                }
            ]);

            const Transfer: any = {};
            stats.forEach((s, idx) => {
                const date = new Date(s._id.year, s._id.month - 1);
                const key = `t${idx}`;
                Transfer[key] = {
                    amount: s.total.toString(),
                    status: "success",
                    createdAt: date.toISOString()
                };
            });

            return {
                status: "success",
                Transfer
            };
        } catch (error) {
            throw error;
        }
    }

    async getWalletBalance() {
        try {
            const excludedEmails = [
                'bitturajput2796@gmail.com',
                'gambhirmitansh@gmail.com',
                'dukeplayindia@gmail.com',
                'Bitforceinfotech@gmail.com'
            ];

            const result = await WalletModel.aggregate([
                { $match: { email: { $nin: excludedEmails } } },
                { $addFields: { numericBalance: { $toDouble: "$balance" } } },
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: "$numericBalance" },
                        userCount: { $sum: 1 }
                    }
                }
            ]);

            const row = result[0] || { totalBalance: 0, userCount: 0 };
            return {
                status: "success",
                totalBalance: parseFloat(row.totalBalance.toFixed(2)),
                userCount: row.userCount,
                message: "Total wallet balance calculated successfully"
            };
        } catch (error) {
            throw error;
        }
    }

    async getInvestmentSummary() {
        try {
            const result = await InvestModel.aggregate([
                { $match: { isClosed: false } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: { $toDouble: "$totalAmount" } },
                        totalCount: { $sum: 1 }
                    }
                }
            ]);

            const row = result[0] || { totalAmount: 0, totalCount: 0 };
            return {
                status: "success",
                totalAmount: row.totalAmount,
                totalCount: row.totalCount
            };
        } catch (error) {
            throw error;
        }
    }

    async getPlatinumInvestors() {
        try {
            // Only fetch what's needed
            return await PlatinumInvestModel.find({ isClosed: false }, 'totalAmount').lean();
        } catch (error) {
            throw error;
        }
    }

    async getActiveInvestors() {
        try {
            const [normalEmails, platinumEmails] = await Promise.all([
                InvestModel.find({ isClosed: false }).distinct('email'),
                PlatinumInvestModel.find({ isClosed: false }).distinct('email')
            ]);
            const allActiveEmails = [...new Set([...normalEmails, ...platinumEmails])];
            return allActiveEmails;
        } catch (error) {
            throw error;
        }
    }

    async getInactiveInvestors() {
        try {
            const [normalEmails, platinumEmails] = await Promise.all([
                InvestModel.find({ isClosed: false }).distinct('email'),
                PlatinumInvestModel.find({ isClosed: false }).distinct('email')
            ]);
            const activeEmails = [...new Set([...normalEmails, ...platinumEmails])];
            const allUserEmails = await UserModel.find({}).distinct('email');
            const inactiveEmails = allUserEmails.filter(email => !activeEmails.includes(email));
            return inactiveEmails;
        } catch (error) {
            throw error;
        }
    }
    async getSummary() {
        try {
            const excludedEmails = [
                'bitturajput2796@gmail.com', 'gambhirmitansh@gmail.com',
                'dukeplayindia@gmail.com', 'Bitforceinfotech@gmail.com'
            ];

            const [
                userCount,
                walletStats,
                depositStats,
                withdrawStats,
                transferStats,
                investSummary,
                platinumSummary,
                activeInvestorsArr,
                allUserEmails
            ] = await Promise.all([
                UserModel.countDocuments({}),
                WalletModel.aggregate([
                    { $match: { email: { $nin: excludedEmails } } },
                    { $addFields: { numericBalance: { $convert: { input: "$balance", to: "double", onError: 0, onNull: 0 } } } },
                    { $group: { _id: null, total: { $sum: "$numericBalance" }, count: { $sum: 1 } } }
                ]),
                DepositModel.aggregate([
                    { $match: { status: { $regex: /^success$/i } } },
                    {
                        $group: {
                            _id: {
                                month: { $month: { $ifNull: ["$createdAt", new Date()] } },
                                year: { $year: { $ifNull: ["$createdAt", new Date()] } }
                            },
                            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } }
                        }
                    }
                ]),
                WithdrawModel.aggregate([
                    { $match: { status: { $regex: /^success$/i } } },
                    {
                        $group: {
                            _id: {
                                month: { $month: { $ifNull: ["$createdAt", new Date()] } },
                                year: { $year: { $ifNull: ["$createdAt", new Date()] } }
                            },
                            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } }
                        }
                    }
                ]),
                TransferModel.aggregate([
                    {
                        $group: {
                            _id: {
                                month: { $month: { $ifNull: ["$createdAt", new Date()] } },
                                year: { $year: { $ifNull: ["$createdAt", new Date()] } }
                            },
                            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } }
                        }
                    }
                ]),
                InvestModel.aggregate([
                    { $match: { isClosed: false } },
                    { $group: { _id: null, total: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } } } }
                ]),
                PlatinumInvestModel.aggregate([
                    { $match: { isClosed: false } },
                    { $group: { _id: null, total: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } } } }
                ]),
                Promise.all([
                    InvestModel.find({ isClosed: false }).distinct('email'),
                    PlatinumInvestModel.find({ isClosed: false }).distinct('email')
                ]),
                UserModel.find({}).distinct('email')
            ]);

            const monthlyMap: Record<string, any> = {};
            const processData = (data: any[], key: string) => {
                data.forEach(item => {
                    const date = new Date(item._id.year, item._id.month - 1);
                    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                    if (!monthlyMap[label]) monthlyMap[label] = { name: label, deposits: 0, withdrawals: 0, transfers: 0 };
                    monthlyMap[label][key] = item.total;
                });
            };

            processData(depositStats, 'deposits');
            processData(withdrawStats, 'withdrawals');
            processData(transferStats, 'transfers');

            const chartData = Object.values(monthlyMap).sort((a: any, b: any) => {
                const dateA = new Date(a.name);
                const dateB = new Date(b.name);
                return dateA.getTime() - dateB.getTime();
            });

            const activeSet = new Set([...activeInvestorsArr[0], ...activeInvestorsArr[1]]);
            const normalTotal = investSummary[0]?.total || 0;
            const platinumTotal = platinumSummary[0]?.total || 0;

            return {
                status: "success",
                data: {
                    stats: {
                        totalUsers: userCount,
                        walletBalance: walletStats[0]?.total || 0,
                        totalDeposits: depositStats.reduce((sum, curr) => sum + curr.total, 0),
                        totalWithdrawals: withdrawStats.reduce((sum, curr) => sum + curr.total, 0),
                        totalTransfers: transferStats.reduce((sum, curr) => sum + curr.total, 0),
                        normalInvestment: normalTotal,
                        platinumInvestment: platinumTotal,
                        activeInvestorsCount: activeSet.size,
                        inactiveInvestorsCount: Math.max(0, allUserEmails.length - activeSet.size)
                    },
                    chartData,
                    pieData: {
                        labels: ['Normal', 'Platinum'],
                        series: [normalTotal, platinumTotal]
                    }
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getKYCs(page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;
            const total = await KYCModel.countDocuments({});
            const kycs = await KYCModel.find().sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();

            return {
                status: "success",
                data: kycs,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async toggleUserStatus(email: string, active: boolean) {
        try {
            return await UserModel.findOneAndUpdate({ email }, { active }, { new: true }).lean();
        } catch (error) {
            throw error;
        }
    }

    async editUser(email: string, name: string, number: string) {
        try {
            return await UserModel.findOneAndUpdate({ email }, { name, number }, { new: true }).lean();
        } catch (error) {
            throw error;
        }
    }

    async toggleInvestmentAllowed(email: string) {
        try {
            const user = (await UserModel.findOne({ email })) as any;
            if (!user) throw new Error("User not found");
            user.investmentAllowed = !user.investmentAllowed;
            await user.save();
            return user;
        } catch (error) {
            throw error;
        }
    }

    async verifyKYC(email: string, status: string) {
        try {
            return await KYCModel.findOneAndUpdate({ email }, { status }, { new: true, upsert: true }).lean();
        } catch (error) {
            throw error;
        }
    }

    async updateWithdrawal(id: string, status: string) {
        try {
            return await WithdrawModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
        } catch (error) {
            throw error;
        }
    }

    async getWalletBalancePersonal(email: string) {
        try {
            return await WalletModel.findOne({ email }).lean();
        } catch (error) {
            throw error;
        }
    }

    async updateWallet(email: string, amount: string) {
        try {
            return await WalletModel.findOneAndUpdate({ email }, { balance: amount }, { new: true, upsert: true }).lean();
        } catch (error) {
            throw error;
        }
    }

    async getReferral(refree: string) {
        try {
            // refree is the referral code of the referrer
            const referalDoc = await ReferalModel.findOne({ referal: refree }).lean();
            if (!referalDoc) return null;

            // Find the actual user details of the referrer
            const referrer = await UserModel.findOne({ email: referalDoc.email }).lean();
            return referrer;
        } catch (error) {
            throw error;
        }
    }

    async getUser(email: string) {
        try {
            return await UserModel.findOne({ email }).lean();
        } catch (error) {
            throw error;
        }
    }

    async getInvest(email: string) {
        try {
            return await InvestModel.findOne({ email, isClosed: false }).lean();
        } catch (error) {
            throw error;
        }
    }

    async getPlatinumInvest(email: string) {
        try {
            return await PlatinumInvestModel.findOne({ email, isClosed: false }).lean();
        } catch (error) {
            throw error;
        }
    }

    async getSubTeamall(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let query: any = {};
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { owner: searchRegex },
                    { member: searchRegex }
                ];
            }

            const totalCount = await SubteamModel.countDocuments(query);
            const subTeams = await SubteamModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
            if (subTeams.length === 0) return { subTeam: {}, pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) } };

            const memberEmails = subTeams.map(s => s.member);
            // ... (keeping bulk enrichment logic)
            // Fetch all investments in bulk
            const [regInvests, platInvests] = await Promise.all([
                InvestModel.find({ email: { $in: memberEmails }, isClosed: false }).lean(),
                PlatinumInvestModel.find({ email: { $in: memberEmails }, isClosed: false }).lean()
            ]);

            const investMap = new Map();
            regInvests.forEach(i => {
                const plans = investMap.get(i.email) || [];
                plans.push(i.subscription);
                investMap.set(i.email, plans);
            });
            platInvests.forEach(i => {
                const plans = investMap.get(i.email) || [];
                plans.push(i.subscription || "Platinum");
                investMap.set(i.email, plans);
            });

            // Fetch member's own referrer code from UserModel
            const users = await UserModel.find({ email: { $in: memberEmails } }, 'email refree').lean();
            const userRefCodeMap = new Map(users.map(u => [u.email, u.refree]));

            // Fetch all referral mappings
            const refCodes = [...new Set(users.map(u => u.refree).filter(c => typeof c === 'string' && c !== "null" && c !== "Not Referred"))] as string[];
            const referals = await ReferalModel.find({ referal: { $in: refCodes } }, 'email referal').lean();
            const referalMap = new Map(referals.map(r => [r.referal, r.email]));

            const subTeam: any = {};
            subTeams.forEach((s, idx) => {
                const refCode = userRefCodeMap.get(s.member);
                const referrerEmail = refCode ? (referalMap.get(refCode) || "Not Referred") : "Not Referred";
                const activePlans = investMap.get(s.member) || [];

                subTeam[`s${skip + idx}`] = {
                    ...s,
                    investedPlan: activePlans.length > 0 ? activePlans.join(", ") : "No Investment",
                    referrerEmail: referrerEmail
                };
            });
            return {
                subTeam,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getReferalIncomeAll(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let query: any = {};
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { owner: searchRegex },
                    { member: searchRegex }
                ];
            }

            const total = await ReferalIncomeModel.countDocuments(query);
            const referals = await ReferalIncomeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
            const referal: any = {};
            referals.forEach((r, idx) => {
                referal[`r${skip + idx}`] = r;
            });
            return {
                referal,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async login(email: string, password: string) {
        try {
            // Basic login placeholder - in a real app, verify with bcrypt
            const user = await UserModel.findOne({ email }).lean();
            if (!user) return { status: "fail", message: "User not found" };

            // For now, accept any password if user exists (NOT SECURE - FOR DEMO MIGRATION)
            return {
                status: "success",
                access_token: "dummy-token-" + Date.now(),
                name: user.name,
                role: user.role,
                permissions: [] // Super admin if empty as per frontend logic
            };
        } catch (error) {
            throw error;
        }
    }

    // NEW API: Admin Team Details (mimics MLM backend with pagination)
    async getTeamDetailsAdmin(page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;
            const total = await SubteamModel.countDocuments({});
            const subTeam = await SubteamModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return {
                status: 'success',
                subTeam,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }
}
