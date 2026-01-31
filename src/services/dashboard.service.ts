import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
import TeamIncomeModel from "../models/teamIncome.model.js";
import PlatinumTeamIncomeModel from "../models/platinumTeamIncome.model.js";
import IncomeModel from "../models/income.model.js";
import PlatinumIncomeModel from "../models/platinumIncome.model.js";
import WalletHistoryModel from "../models/walletHistory.model.js";
import GwcCoinModel from "../models/gwcCoin.model.js";
import GwcCoinHistoryModel from "../models/gwcHistory.model.js";
import CoinValueModel from "../models/coinValue.model.js";
import InvestmentLotModel from "../models/investmentLot.model.js";
import AdminRoleModel from "../models/adminRole.model.js";
import ShiftHistoryModel from "../models/shiftHistory.model.js";
import InvestmentWithdrawalModel from "../models/investmentWithdrawal.model.js";
import InvestmentHistoryModel from "../models/investHistory.model.js";
import PlatinumHistoryModel from "../models/platinumHistory.model.js";
import { Decimal } from 'decimal.js';
import { generateSecret, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { incomeSecurityGuard } from "../utils/incomeSecurity.js";

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
            const skip = (page - 1) * limit;
            let matchQuery: any = {};

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                matchQuery.$or = [
                    { email: searchRegex },
                    { orderid: searchRegex },
                    { txid: searchRegex }
                ];
                if (!isNaN(Number(search))) {
                    matchQuery.$or.push({ amount: Number(search) });
                }
            }

            const aggregation = await DepositModel.aggregate([
                { $match: matchQuery },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            const deposits = aggregation[0].data.map((d: any) => ({
                ...d,
                amount: d.amount.toString()
            }));

            return {
                status: "success",
                deposits,
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

    async updateDeposit(id: string, status: string) {
        try {
            const oldData = await DepositModel.findById(id).lean();
            const updated = await DepositModel.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );
            return { oldData, updated };
        } catch (error) {
            throw error;
        }
    }

    async getWithdrawals(page: number = 1, limit: number = 20, search: string = '', status: string = 'All') {
        try {
            const skip = (page - 1) * limit;
            let matchQuery: any = {};

            if (status && status !== 'All') {
                matchQuery.status = status;
            }

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                matchQuery.$or = [
                    { email: searchRegex },
                    { orderid: searchRegex }
                ];
                if (!isNaN(Number(search))) {
                    matchQuery.$or.push({ amount: Number(search) });
                }
            }

            const aggregation = await WithdrawModel.aggregate([
                { $match: matchQuery },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            const withdrawals = aggregation[0].data.map((w: any) => ({
                ...w,
                amount: w.amount.toString()
            }));

            return {
                status: "success",
                withdrawals,
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

            const result = await Promise.all([
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
                UserModel.find({}).distinct('email'),
                ShiftHistoryModel.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
                            count: { $sum: 1 }
                        }
                    }
                ])
            ]);

            const [
                userCount,
                walletStats,
                depositStats,
                withdrawStats,
                transferStats,
                investSummary,
                platinumSummary,
                activeInvestorsArr,
                allUserEmails,
                shiftStatsResult
            ] = result;

            const shiftStats = shiftStatsResult[0] || { totalAmount: 0, count: 0 };

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
                        inactiveInvestorsCount: Math.max(0, allUserEmails.length - activeSet.size),
                        totalShiftAmount: shiftStats.totalAmount || 0,
                        totalShiftCount: shiftStats.count || 0
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
            const oldUser = await UserModel.findOne({ email }).lean();
            // Reset login attempts and locks when toggling status
            const updated = await UserModel.findOneAndUpdate(
                { email },
                { active, loginAttempts: 0, lockUntil: undefined },
                { new: true }
            ).lean();
            return { oldUser, updated };
        } catch (error) {
            throw error;
        }
    }

    async editUser(email: string, name: string, number: string) {
        try {
            const oldUser = await UserModel.findOne({ email }).lean();
            const updated = await UserModel.findOneAndUpdate({ email }, { name, number }, { new: true }).lean();
            return { oldUser, updated };
        } catch (error) {
            throw error;
        }
    }

    async toggleInvestmentAllowed(email: string) {
        try {
            const oldUser = await UserModel.findOne({ email }).lean();
            const user = (await UserModel.findOne({ email })) as any;
            if (!user) throw new Error("User not found");
            user.investmentAllowed = !user.investmentAllowed;
            await user.save();
            return { oldUser, updated: user };
        } catch (error) {
            throw error;
        }
    }

    async verifyKYC(email: string, status: string) {
        try {
            const oldData = await KYCModel.findOne({ email }).lean();
            const updated = await KYCModel.findOneAndUpdate({ email }, { status }, { new: true, upsert: true }).lean();
            return { oldData, updated };
        } catch (error) {
            throw error;
        }
    }

    async updateWithdrawal(id: string, status: string) {
        try {
            const oldData = await WithdrawModel.findById(id).lean();
            const withdrawal = await WithdrawModel.findById(id);
            if (!withdrawal) throw new Error("Withdrawal not found");

            if (withdrawal.status === status) return { oldData, updated: withdrawal };

            // If rejecting, refund to wallet
            if ((status.toLowerCase() === 'rejected' || status.toLowerCase() === 'error') && withdrawal.status.toLowerCase() === 'pending') {
                const wallet = await WalletModel.findOne({ email: withdrawal.email });
                if (wallet) {
                    const currentBalance = new Decimal(wallet.balance);
                    const refundAmount = new Decimal(withdrawal.amount);
                    const newBalance = currentBalance.plus(refundAmount);

                    await WalletModel.updateOne(
                        { email: withdrawal.email },
                        { $set: { balance: newBalance.toFixed(8) } }
                    );

                    // Add wallet history for refund
                    await WalletHistoryModel.create({
                        email: withdrawal.email,
                        amount: withdrawal.amount,
                        type: 'Refund',
                        description: `Withdrawal refund #${id}`,
                        status: 'Success',
                        prevBalance: currentBalance.toFixed(8),
                        newBalance: newBalance.toFixed(8)
                    });
                }
            }

            withdrawal.status = status;
            await withdrawal.save();
            return { oldData, updated: withdrawal };
        } catch (error) {
            throw error;
        }
    }

    async closeInvestment(email: string) {
        try {
            const investment = await InvestModel.findOne({ email, isClosed: false });
            if (!investment) throw new Error("No active investment found for this user");

            const wallet = await WalletModel.findOne({ email });
            if (!wallet) throw new Error("User wallet not found");

            let amount = new Decimal(investment.totalAmount);
            const createdAt = investment.createdAt;
            const now = new Date();

            // Month calculation (approximation)
            const diffTime = Math.abs(now.getTime() - createdAt.getTime());
            const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

            // Deductions
            if (diffMonths < 6) {
                amount = amount.mul(0.80); // 20% deduction
            } else if (diffMonths < 12) {
                amount = amount.mul(0.90); // 10% deduction
            }

            const currentBalance = new Decimal(wallet.balance);
            const newBalance = currentBalance.plus(amount);

            await WalletModel.updateOne({ email }, { $set: { balance: newBalance.toFixed(8) } });

            // Mark investment closed
            await InvestModel.updateOne({ _id: investment._id }, { $set: { isClosed: true } });

            // Also mark lots as closed
            await InvestmentLotModel.updateMany({ email, closed: false, plan: 'NORMAL' }, { $set: { closed: true } });

            // Wallet history
            await WalletHistoryModel.create({
                email,
                amount: amount.toFixed(8),
                type: 'Invest Withdraw',
                description: `Investment closed after ${diffMonths} months`,
                status: 'Success',
                prevBalance: currentBalance.toFixed(8),
                newBalance: newBalance.toFixed(8)
            });

            return { success: true, amount: amount.toFixed(8), months: diffMonths };
        } catch (error) {
            throw error;
        }
    }

    async closePlatinumInvestment(email: string) {
        try {
            const investment = await PlatinumInvestModel.findOne({ email, isClosed: false });
            if (!investment) throw new Error("No active platinum investment found for this user");

            const wallet = await WalletModel.findOne({ email });
            if (!wallet) throw new Error("User wallet not found");

            let amount = new Decimal(investment.totalAmount);
            const createdAt = investment.createdAt;
            const now = new Date();

            const diffTime = Math.abs(now.getTime() - createdAt.getTime());
            const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

            // Deductions for platinum
            if (diffMonths < 6) {
                amount = amount.mul(0.80); // 20%
            } else if (diffMonths < 12) {
                amount = amount.mul(0.85); // 15%
            }

            const currentBalance = new Decimal(wallet.balance);
            const newBalance = currentBalance.plus(amount);

            await WalletModel.updateOne({ email }, { $set: { balance: newBalance.toFixed(8) } });
            await PlatinumInvestModel.updateOne({ _id: investment._id }, { $set: { isClosed: true } });
            await InvestmentLotModel.updateMany({ email, closed: false, plan: 'PLATINUM' }, { $set: { closed: true } });

            await WalletHistoryModel.create({
                email,
                amount: amount.toFixed(8),
                type: 'Platinum Withdraw',
                description: `Platinum investment closed after ${diffMonths} months`,
                status: 'Success',
                prevBalance: currentBalance.toFixed(8),
                newBalance: newBalance.toFixed(8)
            });

            return { success: true, amount: amount.toFixed(8), months: diffMonths };
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
            const wallet = await WalletModel.findOne({ email });
            const previousBalance = wallet ? wallet.balance : "0";

            const result = await WalletModel.findOneAndUpdate(
                { email },
                { balance: amount.toString() },
                { new: true, upsert: true }
            ).lean();

            const prevNum = parseFloat(previousBalance);
            const nextNum = parseFloat(amount);
            const diff = nextNum - prevNum;

            await WalletHistoryModel.create({
                email,
                previousAmount: previousBalance,
                updatedAmount: amount.toString(),
                updateAmount: Math.abs(diff).toString(),
                updateType: diff >= 0 ? 'credit' : 'debit'
            });

            return { oldData: wallet, updated: result };
        } catch (error) {
            throw error;
        }
    }

    async getAllWalletsPaginated(page: number, limit: number, searchTerm: string) {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};
            if (searchTerm) {
                const searchRegex = new RegExp(searchTerm, 'i');
                query.$or = [{ name: searchRegex }, { email: searchRegex }];
            }

            const total = await UserModel.countDocuments(query);
            const users = await UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            const emails = users.map(u => u.email);
            const wallets = await WalletModel.find({ email: { $in: emails } }).lean();
            const walletMap = new Map(wallets.map(w => [w.email, w.balance]));

            const data = users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                active: u.active,
                createdAt: u.createdAt,
                balance: walletMap.get(u.email) || "0"
            }));

            return {
                status: "success",
                data,
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

    async getWalletHistoryPaginated(email: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const query = email ? { email } : {};
            const total = await WalletHistoryModel.countDocuments(query);
            const history = await WalletHistoryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            return {
                status: "success",
                history,
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
            const user = await UserModel.findOne({ email });
            if (!user) return { status: "fail", message: "User not found" };

            // Check if account is locked
            if (user.lockUntil && user.lockUntil > Date.now()) {
                const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
                return {
                    status: "fail",
                    message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${remainingMinutes} minutes.`
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password || "");

            if (!isPasswordValid) {
                // Increment failed attempts
                user.loginAttempts += 1;

                if (user.loginAttempts >= 5) {
                    user.lockUntil = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
                    await user.save();
                    return {
                        status: "fail",
                        message: "Account locked for 2 hours due to 5 consecutive failed login attempts."
                    };
                }

                await user.save();
                const remaining = 5 - user.loginAttempts;
                return {
                    status: "fail",
                    message: `Invalid password. ${remaining} attempts remaining before account lock.`
                };
            }

            // Successful login - reset attempts
            user.loginAttempts = 0;
            (user as any).lockUntil = undefined;
            await user.save();

            // Fetch RBAC data
            const adminRole = await AdminRoleModel.findOne({ email }).lean();
            const role = adminRole ? adminRole.role : (user as any).role;
            const permissions = adminRole ? adminRole.permissions : [];
            const isSuperAdmin = role === 'Super Admin';

            const secret = process.env['JWT_SECRET'] || 'growwin-dashboard-secret-key-2024';

            // Check for 2FA
            if (user.twoFactorEnabled) {
                const tempToken = jwt.sign(
                    { id: (user as any)._id, email: user.email, is2FAPending: true },
                    secret,
                    { expiresIn: '5m' }
                );
                return {
                    status: "2fa_required",
                    tempToken: tempToken,
                    userId: (user as any)._id.toString(),
                    email: user.email
                };
            }

            // Issue a REAL JWT token
            const access_token = jwt.sign(
                { id: (user as any)._id, email: user.email, role: role, name: user.name },
                secret,
                { expiresIn: '1d' }
            );

            return {
                status: "success",
                access_token: access_token,
                userId: (user as any)._id.toString(),
                name: user.name,
                role: role,
                isSuperAdmin: isSuperAdmin,
                permissions: permissions,
                twoFactorEnabled: (user as any).twoFactorEnabled
            };
        } catch (error) {
            throw error;
        }
    }

    async getMe(email: string) {
        try {
            const user = await UserModel.findOne({ email }).lean();
            if (!user) return { status: "fail", message: "User not found" };

            const adminRole = await AdminRoleModel.findOne({ email }).lean();
            const role = adminRole ? adminRole.role : (user as any).role;
            const permissions = adminRole ? adminRole.permissions : [];
            const isSuperAdmin = role === 'Super Admin';

            return {
                status: "success",
                name: user.name,
                role: role,
                isSuperAdmin: isSuperAdmin,
                permissions: permissions,
                twoFactorEnabled: (user as any).twoFactorEnabled
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

    async getAllPlatinumTeamIncome(page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;
            const total = await PlatinumTeamIncomeModel.countDocuments();
            const teamIncomeData = await PlatinumTeamIncomeModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const totalPages = Math.ceil(total / limit);

            return {
                status: 'success',
                cached: false,
                data: {
                    teamIncome: teamIncomeData,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalRecords: total,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            };
        } catch (error) {
            console.error("Error in getAllPlatinumTeamIncome:", error);
            throw error;
        }
    }

    async getAllTeamIncomePaginated(page: number = 1, limit: number = 20, searchTerm: string = '', startDate: string = '', endDate: string = '') {
        try {
            const skip = (page - 1) * limit;

            // Build date filter
            const dateMatch: any = {};
            if (startDate && endDate) {
                dateMatch.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                };
            }

            // Build search filter
            const searchMatch: any = {};
            if (searchTerm) {
                const searchRegex = new RegExp(searchTerm, 'i');
                searchMatch.$or = [
                    { emailOwner: searchRegex },
                    { emailMember: searchRegex }
                ];
            }

            // Combine filters
            const matchQuery = { ...dateMatch, ...searchMatch };

            // Count total (simplified count for both)
            const [regularCount, platinumCount] = await Promise.all([
                TeamIncomeModel.countDocuments({ ...matchQuery, $or: [{ income: { $nin: ['0', '0.00', null] } }, { Income: { $nin: ['0', '0.00', null] } }] }),
                PlatinumTeamIncomeModel.countDocuments({ ...matchQuery, $or: [{ income: { $nin: ['0', '0.00', null] } }, { Income: { $nin: ['0', '0.00', null] } }] })
            ]);
            const total = regularCount + platinumCount;

            // Aggregation pipeline to combine and paginate
            const pipeline: any[] = [
                {
                    $match: {
                        ...matchQuery,
                        Income: { $nin: ['0', '0.00', null, ''] }
                    }
                },
                { $addFields: { isPlatinum: false } },
                {
                    $unionWith: {
                        coll: PlatinumTeamIncomeModel.collection.name,
                        pipeline: [
                            {
                                $match: {
                                    ...matchQuery,
                                    income: { $nin: ['0', '0.00', null, ''] }
                                }
                            },
                            { $addFields: { isPlatinum: true } }
                        ]
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: SubteamModel.collection.name,
                        let: { owner: '$emailOwner', member: '$emailMember' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$owner', '$$owner'] },
                                            { $eq: ['$member', '$$member'] }
                                        ]
                                    }
                                }
                            },
                            { $project: { level: 1, _id: 0 } }
                        ],
                        as: 'subteam'
                    }
                },
                {
                    $addFields: {
                        level: { $ifNull: [{ $arrayElemAt: ['$subteam.level', 0] }, 0] },
                        tempIncome: { $ifNull: ["$Income", "$income"] }
                    }
                },
                {
                    $addFields: {
                        Income: {
                            $round: [
                                { $convert: { input: "$tempIncome", to: "double", onError: 0, onNull: 0 } },
                                2
                            ]
                        }
                    }
                },
                { $project: { income: 0, tempIncome: 0, subteam: 0 } }
            ];

            const docs = await TeamIncomeModel.aggregate(pipeline).exec();

            return {
                status: 'success',
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                teamIncome: docs
            };
        } catch (error: any) {
            console.error("Error in getAllTeamIncomePaginated:", error);
            if (error.codeName === 'CommandNotFound') {
                console.error("Aggregation command failed - check MongoDB version or permissions");
            }
            throw {
                message: error.message,
                stack: error.stack,
                details: error
            };
        }
    }

    async getAllSelfIncomePaginated(page: number = 1, limit: number = 20, searchTerm: string = '', startDate: string = '', endDate: string = '', isPlatinumFilter?: boolean) {
        try {
            const skip = (page - 1) * limit;

            // Build date filter
            const dateMatch: any = {};
            if (startDate && endDate) {
                dateMatch.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                };
            }

            // Build search filter
            const searchMatch: any = {};
            if (searchTerm) {
                const searchRegex = new RegExp(searchTerm, 'i');
                searchMatch.email = searchRegex;
            }

            // Combine filters
            const matchQuery = { ...dateMatch, ...searchMatch };

            // Count total
            let regularCount = 0;
            let platinumCount = 0;

            if (isPlatinumFilter === undefined || isPlatinumFilter === false) {
                regularCount = await IncomeModel.countDocuments({ ...matchQuery, income: { $nin: ['0', '0.00', null, ''] } });
            }
            if (isPlatinumFilter === undefined || isPlatinumFilter === true) {
                platinumCount = await PlatinumIncomeModel.countDocuments({ ...matchQuery, income: { $nin: ['0', '0.00', null, ''] } });
            }
            const total = regularCount + platinumCount;

            // Aggregation pipeline
            const pipeline: any[] = [];

            if (isPlatinumFilter === true) {
                // If only platinum is requested, start with an empty match on IncomeModel
                pipeline.push({ $match: { _id: { $exists: false } } });
                pipeline.push({
                    $unionWith: {
                        coll: PlatinumIncomeModel.collection.name,
                        pipeline: [
                            {
                                $match: {
                                    ...matchQuery,
                                    income: { $nin: ['0', '0.00', null, ''] }
                                }
                            },
                            { $addFields: { isPlatinum: true } }
                        ]
                    }
                });
            } else {
                // Start with regular income
                pipeline.push({
                    $match: {
                        ...matchQuery,
                        income: { $nin: ['0', '0.00', null, ''] }
                    }
                });
                pipeline.push({ $addFields: { isPlatinum: false } });

                if (isPlatinumFilter === undefined) {
                    // Unified view
                    pipeline.push({
                        $unionWith: {
                            coll: PlatinumIncomeModel.collection.name,
                            pipeline: [
                                {
                                    $match: {
                                        ...matchQuery,
                                        income: { $nin: ['0', '0.00', null, ''] }
                                    }
                                },
                                { $addFields: { isPlatinum: true } }
                            ]
                        }
                    });
                }
            }

            pipeline.push(
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $addFields: {
                        Income: {
                            $round: [
                                { $convert: { input: "$income", to: "double", onError: 0, onNull: 0 } },
                                2
                            ]
                        }
                    }
                },
                { $project: { income: 0 } }
            );

            const docs = await IncomeModel.aggregate(pipeline).exec();

            return {
                status: 'success',
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                income: docs
            };
        } catch (error: any) {
            console.error("Error in getAllSelfIncomePaginated:", error);
            throw {
                message: error.message,
                stack: error.stack,
                details: error
            };
        }
    }

    async updateSelfIncome(email: string, income: string, createdAt: string) {
        try {
            const oldData = await IncomeModel.findOne({ email, createdAt: new Date(createdAt) }).lean();
            const result = await IncomeModel.updateOne(
                { email, createdAt: new Date(createdAt) },
                { $set: { income: income.toString() } }
            );
            const updated = await IncomeModel.findOne({ email, createdAt: new Date(createdAt) }).lean();
            return { oldData, updated };
        } catch (error) {
            console.error("Error in updateSelfIncome:", error);
            throw error;
        }
    }

    async updatePlatinumIncome(email: string, income: string, createdAt: string) {
        try {
            const oldData = await PlatinumIncomeModel.findOne({ email, createdAt: new Date(createdAt) }).lean();
            const result = await PlatinumIncomeModel.updateOne(
                { email, createdAt: new Date(createdAt) },
                { $set: { income: income.toString() } }
            );
            const updated = await PlatinumIncomeModel.findOne({ email, createdAt: new Date(createdAt) }).lean();
            return { oldData, updated };
        } catch (error) {
            console.error("Error in updatePlatinumIncome:", error);
            throw error;
        }
    }

    async getAllReferalIncomePaginated(page: number = 1, limit: number = 20, searchTerm: string = '', startDate: string = '', endDate: string = '') {
        try {
            const skip = (page - 1) * limit;

            const dateMatch: any = {};
            if (startDate || endDate) {
                dateMatch.createdAt = {};
                if (startDate) dateMatch.createdAt.$gte = new Date(startDate);
                if (endDate) dateMatch.createdAt.$lte = new Date(endDate);
            }

            const searchMatch = searchTerm ? {
                $or: [
                    { owner: { $regex: searchTerm, $options: 'i' } },
                    { member: { $regex: searchTerm, $options: 'i' } }
                ]
            } : {};

            const matchQuery = { ...dateMatch, ...searchMatch };

            // Count total
            const total = await ReferalIncomeModel.countDocuments({
                ...matchQuery,
                referalIncome: { $nin: ['0', '0.00', null, ''] }
            });

            // Aggregation pipeline
            const pipeline: any[] = [
                {
                    $match: {
                        ...matchQuery,
                        referalIncome: { $nin: ['0', '0.00', null, ''] }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $addFields: {
                        income: {
                            $round: [
                                { $convert: { input: "$referalIncome", to: "double", onError: 0, onNull: 0 } },
                                2
                            ]
                        },
                        level: { $ifNull: ["$level", "N/A"] }
                    }
                },
                { $project: { referalIncome: 0 } }
            ];

            const docs = await ReferalIncomeModel.aggregate(pipeline).exec();

            return {
                status: 'success',
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                referal: docs
            };
        } catch (error: any) {
            console.error("Error in getAllReferalIncomePaginated:", error);
            throw {
                message: error.message,
                stack: error.stack,
                details: error
            };
        }
    }

    async updateReferalIncome(owner: string, member: string, income: string, level: string, createdAt: string) {
        try {
            const oldData = await ReferalIncomeModel.findOne({ owner, member, level, createdAt: new Date(createdAt) }).lean();
            const result = await ReferalIncomeModel.updateOne(
                { owner, member, level, createdAt: new Date(createdAt) },
                { $set: { referalIncome: income.toString() } }
            );
            const updated = await ReferalIncomeModel.findOne({ owner, member, level, createdAt: new Date(createdAt) }).lean();
            return { oldData, updated };
        } catch (error) {
            console.error("Error in updateReferalIncome:", error);
            throw error;
        }
    }

    async getAllTransfersPaginated(page: number, limit: number, searchTerm?: string, startDate?: string, endDate?: string) {
        try {
            const skip = (page - 1) * limit;

            // Date filtering
            const dateMatch: any = {};
            if (startDate || endDate) {
                dateMatch.createdAt = {};
                if (startDate) dateMatch.createdAt.$gte = new Date(startDate);
                if (endDate) dateMatch.createdAt.$lte = new Date(endDate);
            }

            const searchMatch = searchTerm ? {
                $or: [
                    { owner: { $regex: searchTerm, $options: 'i' } },
                    { member: { $regex: searchTerm, $options: 'i' } }
                ]
            } : {};

            const matchQuery = { ...dateMatch, ...searchMatch };

            // Count total
            const total = await TransferModel.countDocuments(matchQuery);

            // Fetch records
            const docs = await TransferModel.find(matchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();

            return {
                status: 'success',
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                Transfer: docs
            };
        } catch (error: any) {
            console.error("Error in getAllTransfersPaginated:", error);
            throw error;
        }
    }

    async updateTransfer(owner: string, member: string, amount: string, createdAt: string) {
        try {
            const oldData = await TransferModel.findOne({ owner, member, createdAt: new Date(createdAt) }).lean();
            const result = await TransferModel.updateOne(
                { owner, member, createdAt: new Date(createdAt) },
                { $set: { amount: parseFloat(amount) } }
            );
            const updated = await TransferModel.findOne({ owner, member, createdAt: new Date(createdAt) }).lean();
            return { oldData, updated };
        } catch (error) {
            console.error("Error in updateTransfer:", error);
            throw error;
        }
    }

    async getGwcCoinHistoryPaginated(email: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;
            const query = email ? { email } : {};
            const total = await GwcCoinHistoryModel.countDocuments(query);
            const history = await GwcCoinHistoryModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean();

            return {
                status: "success",
                history,
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

    async getAllUsersGwcCoinsPaginated(page: number, limit: number, searchTerm: string) {
        try {
            const skip = (page - 1) * limit;

            const query: any = {};
            if (searchTerm) {
                const searchRegex = new RegExp(searchTerm, 'i');
                query.$or = [{ name: searchRegex }, { email: searchRegex }];
            }

            const total = await UserModel.countDocuments(query);
            const users = await UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            const emails = users.map(u => u.email);
            const coinBalances = await GwcCoinModel.find({ email: { $in: emails } }).lean();
            const coinMap = new Map(coinBalances.map(c => [c.email, c.totalCoins]));

            const data = users.map(u => ({
                email: u.email,
                totalCoins: coinMap.get(u.email) || 0
            }));

            return {
                status: "success",
                users: data,
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

    async manageGwcCoins(email: string, amount: number, type: 'add' | 'deduct') {
        try {
            const coinValueDoc = await CoinValueModel.findOne().sort({ createdAt: -1 }).lean();
            const currentCoinValue = coinValueDoc ? coinValueDoc.currentValue : 1;

            let userCoins = await GwcCoinModel.findOne({ email });
            if (!userCoins && type === 'add') {
                userCoins = new GwcCoinModel({ email, totalCoins: 0 });
            } else if (!userCoins && type === 'deduct') {
                throw new Error("User has no GWC coins to deduct.");
            }

            const changeAmount = type === 'add' ? amount : -amount;
            if (type === 'deduct' && userCoins!.totalCoins < amount) {
                throw new Error("Insufficient GWC coins for deduction.");
            }

            const updatedUserCoins = await GwcCoinModel.findOneAndUpdate(
                { email },
                { $inc: { totalCoins: changeAmount } },
                { new: true, upsert: true }
            );

            // Log history
            await GwcCoinHistoryModel.create({
                email,
                transactionType: type === 'add' ? 'admin_addition' : 'admin_deduction',
                amount: changeAmount,
                coinValue: currentCoinValue,
                usdAmount: amount * currentCoinValue,
                date: new Date()
            });

            return { oldData: userCoins ? { totalCoins: userCoins.totalCoins } : null, updated: updatedUserCoins };
        } catch (error) {
            throw error;
        }
    }

    async getRealTimeIncomeStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const [normalIncome, platinumIncome, teamIncome, platinumTeamIncome] = await Promise.all([
                IncomeModel.aggregate([
                    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
                    { $group: { _id: null, total: { $sum: { $toDouble: "$income" } }, count: { $sum: 1 } } }
                ]),
                PlatinumIncomeModel.aggregate([
                    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
                    { $group: { _id: null, total: { $sum: { $toDouble: "$income" } }, count: { $sum: 1 } } }
                ]),
                TeamIncomeModel.aggregate([
                    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
                    { $group: { _id: null, total: { $sum: { $toDouble: "$Income" } }, count: { $sum: 1 } } }
                ]),
                PlatinumTeamIncomeModel.aggregate([
                    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
                    { $group: { _id: null, total: { $sum: { $toDouble: "$income" } }, count: { $sum: 1 } } }
                ])
            ]);

            return {
                normalIncome: normalIncome[0]?.total || 0,
                normalIncomeCount: normalIncome[0]?.count || 0,
                platinumIncome: platinumIncome[0]?.total || 0,
                platinumIncomeCount: platinumIncome[0]?.count || 0,
                teamIncome: teamIncome[0]?.total || 0,
                teamIncomeCount: teamIncome[0]?.count || 0,
                platinumTeamIncome: platinumTeamIncome[0]?.total || 0,
                platinumTeamIncomeCount: platinumTeamIncome[0]?.count || 0,
                totalIncome: (normalIncome[0]?.total || 0) + (platinumIncome[0]?.total || 0) +
                    (teamIncome[0]?.total || 0) + (platinumTeamIncome[0]?.total || 0),
                totalTransactions: (normalIncome[0]?.count || 0) + (platinumIncome[0]?.count || 0) +
                    (teamIncome[0]?.count || 0) + (platinumTeamIncome[0]?.count || 0),
                timestamp: new Date()
            };
        } catch (error) {
            console.error("Error in getRealTimeIncomeStats:", error);
            throw error;
        }
    }

    async getIncomeProjections(params: any) {
        try {
            const period = params.period || 'weekly';
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 20;

            const dateRange = this.calculateDateRange(period, params);

            // Calculate projections
            const { projections, summary } = await this.calculateIncomeProjections({
                dateRange,
                planType: params.planType || 'all',
                emailFilter: params.email,
                search: params.search
            });

            // Apply pagination on already calculated projections
            const total = projections.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const paginatedData = projections.slice(startIndex, startIndex + limit);

            return {
                data: paginatedData,
                total,
                page,
                totalPages,
                summary,
                period: {
                    type: period,
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                }
            };
        } catch (error) {
            console.error("Error in getIncomeProjections:", error);
            throw error;
        }
    }

    private calculateDateRange(period: string, options: any): { startDate: Date; endDate: Date } {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (period) {
            case 'weekly':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return { startDate: startOfWeek, endDate: endOfWeek };

            case 'monthly':
                const month = options.month !== undefined ? options.month : now.getMonth();
                const year = options.year || now.getFullYear();
                const startOfMonth = new Date(year, month, 1);
                const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
                return { startDate: startOfMonth, endDate: endOfMonth };

            case 'yearly':
                const yearForYear = options.year || now.getFullYear();
                const startOfYear = new Date(yearForYear, 0, 1);
                const endOfYear = new Date(yearForYear, 11, 31, 23, 59, 59, 999);
                return { startDate: startOfYear, endDate: endOfYear };

            case 'custom':
                if (options.startDate && options.endDate) {
                    return {
                        startDate: new Date(options.startDate),
                        endDate: new Date(options.endDate)
                    };
                }
                return this.calculateDateRange('weekly', {});

            default:
                return this.calculateDateRange('weekly', {});
        }
    }

    private async calculateIncomeProjections(params: {
        dateRange: { startDate: Date; endDate: Date };
        planType: string;
        emailFilter?: string;
        search?: string;
    }) {
        const projections: any[] = [];
        const userFilter: any = {};

        if (params.emailFilter) {
            userFilter.email = params.emailFilter;
        } else if (params.search) {
            const searchRegex = { $regex: params.search, $options: 'i' };
            userFilter.$or = [
                { email: searchRegex },
                { name: searchRegex }
            ];
        }

        // 1. Fetch relevant users first
        const users = await UserModel.find(userFilter).lean();
        if (users.length === 0) {
            return { projections: [], summary: this.calculateSummary([]) };
        }

        const userEmails = users.map(u => u.email);

        // 2. Fetch subteams for these users (to know their members)
        const subteams = await SubteamModel.find({ owner: { $in: userEmails } }).lean();
        const memberEmails = [...new Set(subteams.map(s => s.member))];

        // 3. Combined set of emails we need investment/lot data for
        const allRelevantEmails = [...new Set([...userEmails, ...memberEmails])];

        // 4. Targeted bulk load
        const [allInvests, allPlatinumInvests, allLots] = await Promise.all([
            InvestModel.find({ email: { $in: allRelevantEmails }, isClosed: false }).lean(),
            PlatinumInvestModel.find({ email: { $in: allRelevantEmails }, isClosed: false }).lean(),
            InvestmentLotModel.find({ email: { $in: allRelevantEmails }, closed: false }).lean()
        ]);

        // Create lookups
        const investLookup = this.groupBy(allInvests, 'email');
        const platinumInvestLookup = this.groupBy(allPlatinumInvests, 'email');
        const lotLookup = this.groupLots(allLots);
        const subteamLookup = this.groupBy(subteams, 'owner');

        for (const user of users) {
            const email = user.email;

            // Normal plan projections
            if (params.planType === 'all' || params.planType === 'normal') {
                const investments = investLookup.get(email) || [];
                const lots = lotLookup.get(`${email}_NORMAL`) || [];

                for (const invest of investments) {
                    const self = this.calculateSelfProjectionsMemory(user, invest, lots, 'normal', params.dateRange);
                    projections.push(...self);
                }

                // Team projections for normal plan
                const teams = subteamLookup.get(email) || [];
                for (const sub of teams) {
                    const memberInvests = investLookup.get(sub.member) || [];
                    const memberLots = lotLookup.get(`${sub.member}_NORMAL`) || [];
                    for (const mInvest of memberInvests) {
                        const team = this.calculateTeamProjectionsMemory(user, sub, mInvest, memberLots, 'normal', params.dateRange);
                        projections.push(...team);
                    }
                }
            }

            // Platinum plan projections
            if (params.planType === 'all' || params.planType === 'platinum') {
                const investments = platinumInvestLookup.get(email) || [];
                const lots = lotLookup.get(`${email}_PLATINUM`) || [];

                for (const invest of investments) {
                    const self = this.calculateSelfProjectionsMemory(user, invest, lots, 'platinum', params.dateRange);
                    projections.push(...self);
                }

                // Team projections for platinum plan
                const teams = subteamLookup.get(email) || [];
                for (const sub of teams) {
                    const memberInvests = platinumInvestLookup.get(sub.member) || [];
                    const memberLots = lotLookup.get(`${sub.member}_PLATINUM`) || [];
                    for (const mInvest of memberInvests) {
                        const team = this.calculateTeamProjectionsMemory(user, sub, mInvest, memberLots, 'platinum', params.dateRange);
                        projections.push(...team);
                    }
                }
            }
        }

        return {
            projections,
            summary: this.calculateSummary(projections)
        };
    }

    private groupBy(array: any[], key: string) {
        return array.reduce((acc, obj) => {
            const k = obj[key];
            if (!acc.has(k)) acc.set(k, []);
            acc.get(k).push(obj);
            return acc;
        }, new Map<string, any[]>());
    }

    private groupLots(lots: any[]) {
        return lots.reduce((acc, lot) => {
            const k = `${lot.email}_${lot.plan}`;
            if (!acc.has(k)) acc.set(k, []);
            acc.get(k).push(lot);
            return acc;
        }, new Map<string, any[]>());
    }

    private calculateEligiblePrincipal(invest: any, lots: any[]) {
        if (!invest || !invest.incomeDate) return { principal: new Decimal(0), eligibleLots: [] };
        const incomeDate = new Date(invest.incomeDate);
        const from = new Date(incomeDate);
        from.setDate(from.getDate() - 7);
        const to = new Date(incomeDate);

        const totalAmount = new Decimal(String(invest.totalAmount ?? '0'));
        let recentLotsSum = new Decimal(0);

        const eligibleLots: any[] = [];
        for (const lot of lots) {
            const createdRaw = lot.createdAt ?? lot.investDate ?? lot.updatedAt ?? null;
            const created = createdRaw ? new Date(createdRaw) : null;

            if (created && !isNaN(created.getTime()) && created >= from && created <= to) {
                recentLotsSum = recentLotsSum.plus(new Decimal(String(lot.amount ?? '0')));
            } else {
                eligibleLots.push(lot);
            }
        }

        return {
            principal: Decimal.max(totalAmount.minus(recentLotsSum), 0),
            eligibleLots
        };
    }

    private calculateSelfProjectionsMemory(user: any, invest: any, lots: any[], planType: 'normal' | 'platinum', dateRange: { startDate: Date; endDate: Date }) {
        const projections: any[] = [];
        const { principal, eligibleLots } = this.calculateEligiblePrincipal(invest, lots);
        if (principal.lte(0)) return projections;

        let currentDate = new Date(invest.incomeDate);
        const endDate = new Date(dateRange.endDate);

        while (currentDate <= endDate) {
            if (currentDate >= dateRange.startDate) {
                let totalIncome = new Decimal(0);
                for (const lot of eligibleLots) {
                    const lotAmount = new Decimal(String(lot.amount ?? '0'));
                    const rate = planType === 'normal' ?
                        this.getNormalLotRate(parseFloat(invest.totalAmount), lot.createdAt) :
                        this.getPlatinumLotRate(lot.createdAt);

                    totalIncome = totalIncome.plus(lotAmount.mul(new Decimal(rate)).div(100));
                }

                if (totalIncome.gt(0)) {
                    projections.push({
                        email: user.email,
                        name: user.name || user.email,
                        planType,
                        incomeType: 'self',
                        projectionDate: new Date(currentDate),
                        projectedAmount: parseFloat(totalIncome.toFixed(2)),
                        currency: 'USD'
                    });
                }
            }
            currentDate = new Date(currentDate.getTime() + 16 * 24 * 60 * 60 * 1000);
        }
        return projections;
    }

    private calculateTeamProjectionsMemory(user: any, sub: any, memberInvest: any, memberLots: any[], planType: 'normal' | 'platinum', dateRange: { startDate: Date; endDate: Date }) {
        const projections: any[] = [];
        const { principal } = this.calculateEligiblePrincipal(memberInvest, memberLots);
        if (principal.lte(0)) return projections;

        const incomePercentage = this.getLevelIncomePercentage(Number(sub.level || 0));
        const teamIncome = principal.mul(new Decimal(incomePercentage)).div(100);

        let currentDate = new Date(memberInvest.incomeDate);
        const endDate = new Date(dateRange.endDate);

        while (currentDate <= endDate) {
            if (currentDate >= dateRange.startDate) {
                projections.push({
                    email: user.email,
                    name: user.name || user.email,
                    planType,
                    incomeType: 'team',
                    projectionDate: new Date(currentDate),
                    projectedAmount: parseFloat(teamIncome.toFixed(2)),
                    currency: 'USD',
                    memberEmail: sub.member,
                    level: sub.level
                });
            }
            currentDate = new Date(currentDate.getTime() + 16 * 24 * 60 * 60 * 1000);
        }
        return projections;
    }

    private getNormalLotRate(totalInvestAmountNum: number, lotCreatedAt: Date | null): number {
        const CUTOFF_DATE = new Date('2025-12-01T00:00:00.000Z');
        const isOld = lotCreatedAt ? (lotCreatedAt < CUTOFF_DATE) : true;
        if (totalInvestAmountNum >= 50 && totalInvestAmountNum <= 2000) return isOld ? 3.5 : 2.75;
        return isOld ? 4.0 : 3.25;
    }

    private getPlatinumLotRate(lotCreatedAt: Date | null): number {
        return 6.0;
    }

    private getLevelIncomePercentage(level: number): number {
        const incomeLevels: any = {
            1: 1, 2: 0.375, 3: 0.325, 4: 0.25, 5: 0.2,
            6: 0.125, 7: 0.075, 8: 0.05, 9: 0.035, 10: 0.035, 11: 0.03
        };
        return incomeLevels[level] || 0;
    }

    private calculateSummary(projections: any[]) {
        const totalProjectedAmount = projections.reduce((sum, item) => sum + item.projectedAmount, 0);
        const selfIncomeTotal = projections.filter(item => item.incomeType === 'self').reduce((sum, item) => sum + item.projectedAmount, 0);
        const teamIncomeTotal = projections.filter(item => item.incomeType === 'team').reduce((sum, item) => sum + item.projectedAmount, 0);
        const normalPlanTotal = projections.filter(item => item.planType === 'normal').reduce((sum, item) => sum + item.projectedAmount, 0);
        const platinumPlanTotal = projections.filter(item => item.planType === 'platinum').reduce((sum, item) => sum + item.projectedAmount, 0);
        const uniqueUsers = new Set(projections.map(item => item.email)).size;

        return {
            totalProjectedAmount: parseFloat(totalProjectedAmount.toFixed(2)),
            selfIncomeTotal: parseFloat(selfIncomeTotal.toFixed(2)),
            teamIncomeTotal: parseFloat(teamIncomeTotal.toFixed(2)),
            normalPlanTotal: parseFloat(normalPlanTotal.toFixed(2)),
            platinumPlanTotal: parseFloat(platinumPlanTotal.toFixed(2)),
            userCount: uniqueUsers
        };
    }

    // Shift History Methods (matching MLM backend)
    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            const diffMonths = Math.floor(diffDays / 30);
            return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
        }
    }

    private formatCurrency(amount: string): string {
        const num = parseFloat(amount);
        return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
    }

    async getShiftHistory(params: {
        page?: string;
        limit?: string;
        email?: string;
        fromPlan?: string;
        toPlan?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }) {
        try {
            // Parse pagination parameters
            const pageNum = Math.max(1, parseInt(params.page || '1', 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(params.limit || '20', 10)));
            const skip = (pageNum - 1) * limitNum;

            // Build filter query
            const filter: any = {};

            // Filter by email (exact match or partial)
            if (params.email && typeof params.email === 'string' && params.email.trim()) {
                filter.email = { $regex: params.email.trim(), $options: 'i' };
            }

            // Filter by fromPlan
            if (params.fromPlan && typeof params.fromPlan === 'string' && params.fromPlan.trim()) {
                filter.fromPlan = { $regex: `^${params.fromPlan.trim()}$`, $options: 'i' };
            }

            // Filter by toPlan
            if (params.toPlan && typeof params.toPlan === 'string' && params.toPlan.trim()) {
                filter.toPlan = { $regex: `^${params.toPlan.trim()}$`, $options: 'i' };
            }

            // Filter by status
            if (params.status && typeof params.status === 'string' && params.status.trim()) {
                filter.status = { $regex: `^${params.status.trim()}$`, $options: 'i' };
            }

            // Date range filter
            if (params.startDate || params.endDate) {
                filter.createdAt = {};
                if (params.startDate && typeof params.startDate === 'string') {
                    const start = new Date(params.startDate);
                    if (!isNaN(start.getTime())) {
                        filter.createdAt.$gte = start;
                    }
                }
                if (params.endDate && typeof params.endDate === 'string') {
                    const end = new Date(params.endDate);
                    if (!isNaN(end.getTime())) {
                        end.setHours(23, 59, 59, 999);
                        filter.createdAt.$lte = end;
                    }
                }
                // If date object is empty, remove it
                if (Object.keys(filter.createdAt).length === 0) {
                    delete filter.createdAt;
                }
            }

            // Search filter (search across multiple fields)
            if (params.search && typeof params.search === 'string' && params.search.trim()) {
                const searchTerm = params.search.trim();
                filter.$or = [
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { fromPlan: { $regex: searchTerm, $options: 'i' } },
                    { toPlan: { $regex: searchTerm, $options: 'i' } },
                    { 'metadata.notes': { $regex: searchTerm, $options: 'i' } }
                ];
            }

            // Validate sort parameters
            const validSortFields = ['createdAt', 'updatedAt', 'amount', 'email', 'fromPlan', 'toPlan', 'status'];
            const sortField: string = validSortFields.includes(params.sortBy || '') ? (params.sortBy as string) : 'createdAt';
            const sortDirection = params.sortOrder === 'asc' ? 1 : -1;

            // Execute query with pagination
            const [history, total] = await Promise.all([
                ShiftHistoryModel.find(filter)
                    .sort({ [sortField]: sortDirection })
                    .skip(skip)
                    .limit(limitNum)
                    .lean()
                    .exec(),
                ShiftHistoryModel.countDocuments(filter)
            ]);

            // Calculate pagination metadata
            const totalPages = Math.ceil(total / limitNum);
            const hasNextPage = pageNum < totalPages;
            const hasPrevPage = pageNum > 1;

            // Format response data
            const formattedHistory = history.map(record => ({
                ...record,
                id: (record as any)._id?.toString() || '',
                // Add derived fields for easier frontend display
                formattedAmount: this.formatCurrency(record.amount),
                timeAgo: this.getTimeAgo(record.createdAt)
            }));

            // Get statistics for the filtered results
            const statistics = await this.calculateShiftStatistics(filter);

            // Calculate active filters count
            const activeFilters = {
                email: params.email || null,
                fromPlan: params.fromPlan || null,
                toPlan: params.toPlan || null,
                status: params.status || null,
                dateRange: params.startDate || params.endDate ? { startDate: params.startDate, endDate: params.endDate } : null,
                search: params.search || null
            };

            let appliedFiltersCount = 0;
            Object.values(activeFilters).forEach(value => {
                if (value !== null && !(typeof value === 'object' && Object.values(value).every(v => v === null || v === undefined))) {
                    appliedFiltersCount++;
                }
            });

            return {
                history: formattedHistory,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                },
                statistics,
                filters: {
                    applied: appliedFiltersCount,
                    activeFilters
                }
            };
        } catch (error) {
            console.error('Error in getShiftHistory:', error);
            throw error;
        }
    }

    private async calculateShiftStatistics(filter: any) {
        try {
            const pipeline = [
                { $match: filter },
                {
                    $facet: {
                        basicStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalTransfers: { $sum: 1 },
                                    totalAmount: {
                                        $sum: {
                                            $convert: {
                                                input: "$amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0
                                            }
                                        }
                                    },
                                    successCount: {
                                        $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] }
                                    },
                                    failedCount: {
                                        $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] }
                                    },
                                    partialCount: {
                                        $sum: { $cond: [{ $eq: ["$status", "PARTIAL"] }, 1, 0] }
                                    }
                                }
                            }
                        ],
                        fromPlanDist: [
                            { $group: { _id: "$fromPlan", count: { $sum: 1 } } }
                        ],
                        toPlanDist: [
                            { $group: { _id: "$toPlan", count: { $sum: 1 } } }
                        ]
                    }
                }
            ];

            const results = await ShiftHistoryModel.aggregate(pipeline);
            const result = results[0];

            if (!result || !result.basicStats || result.basicStats.length === 0) {
                return {
                    totalTransfers: 0,
                    totalAmount: 0,
                    formattedTotalAmount: '$0.00',
                    successCount: 0,
                    failedCount: 0,
                    partialCount: 0,
                    successRate: '0%',
                    fromPlanDistribution: {},
                    toPlanDistribution: {}
                };
            }

            const stats = result.basicStats[0];

            // Convert distribution arrays to records
            const fromPlanCounts: Record<string, number> = {};
            const toPlanCounts: Record<string, number> = {};

            result.fromPlanDist.forEach((item: any) => {
                if (item._id) fromPlanCounts[item._id] = item.count;
            });

            result.toPlanDist.forEach((item: any) => {
                if (item._id) toPlanCounts[item._id] = item.count;
            });

            const successRate = stats.totalTransfers > 0
                ? ((stats.successCount || 0) / stats.totalTransfers * 100).toFixed(2) + '%'
                : '0%';

            return {
                totalTransfers: stats.totalTransfers || 0,
                totalAmount: stats.totalAmount || 0,
                formattedTotalAmount: `$${(stats.totalAmount || 0).toFixed(2)}`,
                successCount: stats.successCount || 0,
                failedCount: stats.failedCount || 0,
                partialCount: stats.partialCount || 0,
                successRate,
                fromPlanDistribution: fromPlanCounts,
                toPlanDistribution: toPlanCounts
            };
        } catch (error) {
            console.error('Error calculating shift statistics:', error);
            return {
                totalTransfers: 0,
                totalAmount: 0,
                formattedTotalAmount: '$0.00',
                successCount: 0,
                failedCount: 0,
                partialCount: 0,
                successRate: '0%',
                fromPlanDistribution: {},
                toPlanDistribution: {}
            };
        }
    }

    async getShiftHistoryDetails(id: string) {
        try {
            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Valid shift history ID is required');
            }

            // Find the shift history record
            const history = await ShiftHistoryModel.findById(id).lean().exec();

            if (!history) {
                throw new Error('Shift history record not found');
            }

            // Format the response
            return {
                ...history,
                id: history._id.toString(),
                formattedAmount: this.formatCurrency(history.amount),
                timeAgo: this.getTimeAgo(history.createdAt)
            };
        } catch (error) {
            console.error('Error in getShiftHistoryDetails:', error);
            throw error;
        }
    }

    async getShiftHistoryStats(params: { startDate?: string; endDate?: string }) {
        try {
            const filter: any = {};

            if (params.startDate || params.endDate) {
                filter.createdAt = {};
                if (params.startDate && typeof params.startDate === 'string') {
                    const start = new Date(params.startDate);
                    if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
                }
                if (params.endDate && typeof params.endDate === 'string') {
                    const end = new Date(params.endDate);
                    if (!isNaN(end.getTime())) {
                        end.setHours(23, 59, 59, 999);
                        filter.createdAt.$lte = end;
                    }
                }
            }

            const [statistics, dailyStats] = await Promise.all([
                this.calculateShiftStatistics(filter),
                ShiftHistoryModel.aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            },
                            count: { $sum: 1 },
                            totalAmount: {
                                $sum: {
                                    $convert: {
                                        input: "$amount",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            },
                            successCount: {
                                $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] }
                            }
                        }
                    },
                    { $sort: { _id: 1 } },
                    { $limit: 30 }
                ])
            ]);

            return {
                ...statistics,
                dailyStats
            };
        } catch (error) {
            console.error('Error in getShiftHistoryStats:', error);
            throw error;
        }
    }

    async exportShiftHistoryCSV(params: {
        email?: string;
        fromPlan?: string;
        toPlan?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) {
        try {
            // Build filter (same as getShiftHistory)
            const filter: any = {};

            if (params.email && typeof params.email === 'string' && params.email.trim()) {
                filter.email = { $regex: params.email.trim(), $options: 'i' };
            }

            if (params.fromPlan && typeof params.fromPlan === 'string' && params.fromPlan.trim()) {
                filter.fromPlan = { $regex: `^${params.fromPlan.trim()}$`, $options: 'i' };
            }

            if (params.toPlan && typeof params.toPlan === 'string' && params.toPlan.trim()) {
                filter.toPlan = { $regex: `^${params.toPlan.trim()}$`, $options: 'i' };
            }

            if (params.status && typeof params.status === 'string' && params.status.trim()) {
                filter.status = { $regex: `^${params.status.trim()}$`, $options: 'i' };
            }

            if (params.startDate || params.endDate) {
                filter.createdAt = {};
                if (params.startDate && typeof params.startDate === 'string') {
                    const start = new Date(params.startDate);
                    if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
                }
                if (params.endDate && typeof params.endDate === 'string') {
                    const end = new Date(params.endDate);
                    if (!isNaN(end.getTime())) {
                        end.setHours(23, 59, 59, 999);
                        filter.createdAt.$lte = end;
                    }
                }
                if (Object.keys(filter.createdAt).length === 0) {
                    delete filter.createdAt;
                }
            }

            if (params.search && typeof params.search === 'string' && params.search.trim()) {
                const searchTerm = params.search.trim();
                filter.$or = [
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { fromPlan: { $regex: searchTerm, $options: 'i' } },
                    { toPlan: { $regex: searchTerm, $options: 'i' } },
                    { 'metadata.notes': { $regex: searchTerm, $options: 'i' } }
                ];
            }

            // Fetch all matching records
            const history = await ShiftHistoryModel.find(filter)
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            // Simple CSV format
            const headers = ['ID', 'Email', 'From Plan', 'To Plan', 'Amount', 'Status', 'Created At'];
            let csv = headers.join(',') + '\n';

            history.forEach(record => {
                const escapeCSV = (field: any) => `"${String(field).replace(/"/g, '""')}"`;
                const row = [
                    record._id.toString(),
                    record.email,
                    record.fromPlan,
                    record.toPlan,
                    `$${parseFloat(record.amount || '0').toFixed(2)}`,
                    record.status,
                    record.createdAt.toISOString()
                ].map(escapeCSV).join(',');
                csv += row + '\n';
            });

            return csv;
        } catch (error) {
            console.error('Error in exportShiftHistoryCSV:', error);
        }
    }

    async getInvestmentWithdrawals(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let matchQuery: any = {};

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                matchQuery.$or = [
                    { email: searchRegex },
                    { fullName: searchRegex }
                ];
            }

            const aggregation = await InvestmentWithdrawalModel.aggregate([
                { $match: matchQuery },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            const withdrawalsList = aggregation[0].data;

            const enhancedWithdrawals = await Promise.all(
                withdrawalsList.map(async (withdrawal: any) => {
                    let finalAmountCredited = withdrawal.withdrawalAmount;
                    let daysSinceInvestment = 0;
                    let deductionPercentage = 0;

                    if (
                        (withdrawal.status === 'approved' || withdrawal.status === 'processing') &&
                        (withdrawal.subscriptionPlan === 'Basic' || withdrawal.subscriptionPlan === 'Classic')
                    ) {
                        const investment: any = await InvestModel.findOne({
                            email: withdrawal.email,
                            isClosed: false,
                            subscription: withdrawal.subscriptionPlan,
                        });

                        if (investment) {
                            const creationDate = new Date(investment.createdAt);
                            const currentDate = new Date();
                            daysSinceInvestment = Math.floor(
                                (currentDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)
                            );

                            if (daysSinceInvestment < 180) {
                                deductionPercentage = 0.2; // 20% deduction
                            } else if (daysSinceInvestment < 365) {
                                deductionPercentage = 0.1; // 10% deduction
                            } else {
                                deductionPercentage = 0; // No deduction
                            }

                            const deductionAmount = withdrawal.withdrawalAmount * deductionPercentage;
                            finalAmountCredited = withdrawal.withdrawalAmount - deductionAmount;
                        }
                    }

                    // Convert to plain object if it's a mongoose doc, though aggregation returns POJO
                    return {
                        ...withdrawal,
                        finalAmountCredited,
                        daysSinceInvestment,
                        deductionPercentage: deductionPercentage * 100,
                    };
                })
            );

            return {
                status: "success",
                data: enhancedWithdrawals,
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

    async updateInvestmentWithdrawalStatus(id: string, status: string) {
        try {
            if (!['approved', 'rejected', 'verified'].includes(status)) {
                throw new Error('Invalid status. Allowed statuses: approved, rejected, verified');
            }

            const updatedRequest = await InvestmentWithdrawalModel.findById(id);
            if (!updatedRequest) {
                throw new Error('Request not found');
            }

            const oldData = updatedRequest.toObject();

            updatedRequest.status = status as any;
            let finalAmountToAdd = updatedRequest.withdrawalAmount;
            let daysSinceCreation = 0;
            let deductionPercentage = 0;

            if (status === 'approved') {
                const { email, withdrawalAmount, subscriptionPlan } = updatedRequest;
                const wallet = await WalletModel.findOne({ email });
                if (!wallet) throw new Error('User wallet not found');

                let currentBalance = new Decimal(wallet.balance || 0);

                if (subscriptionPlan === 'Basic' || subscriptionPlan === 'Classic') {
                    const investment: any = await InvestModel.findOne({
                        email,
                        isClosed: false,
                        subscription: subscriptionPlan,
                    });

                    if (!investment) throw new Error('Active investment not found');

                    let investmentAmount = new Decimal(investment.totalAmount);
                    const creationDate = new Date(investment.createdAt);
                    const currentDate = new Date();
                    daysSinceCreation = Math.floor(
                        (currentDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (daysSinceCreation < 180) {
                        deductionPercentage = 0.2;
                    } else if (daysSinceCreation < 365) {
                        deductionPercentage = 0.1;
                    }

                    if (investmentAmount.lt(withdrawalAmount)) {
                        throw new Error('Insufficient investment amount');
                    }

                    // Deduct from NORMAL lots FIFO
                    let remainingToDeduct = new Decimal(withdrawalAmount);
                    const normalLots = await InvestmentLotModel.find({ email, plan: 'NORMAL', closed: false })
                        .sort({ investDate: 1, createdAt: 1 });

                    for (const lot of normalLots) {
                        if (remainingToDeduct.lte(0)) break;
                        let lotAmt = new Decimal(lot.amount || '0');

                        if (lotAmt.lte(remainingToDeduct)) {
                            remainingToDeduct = remainingToDeduct.minus(lotAmt);
                            lot.amount = '0';
                            lot.closed = true;
                        } else {
                            lot.amount = lotAmt.minus(remainingToDeduct).toFixed(8);
                            remainingToDeduct = new Decimal(0);
                        }
                        await lot.save();
                    }

                    investmentAmount = investmentAmount.minus(withdrawalAmount);
                    investment.totalAmount = investmentAmount.toFixed(8);
                    if (investmentAmount.lte(0)) investment.isClosed = true;
                    await investment.save();

                    const deductionAmount = new Decimal(withdrawalAmount).mul(deductionPercentage);
                    finalAmountToAdd = new Decimal(withdrawalAmount).minus(deductionAmount).toNumber();

                    currentBalance = currentBalance.plus(finalAmountToAdd);
                    wallet.balance = currentBalance.toFixed(8);
                    await WalletModel.updateOne({ email }, { $set: { balance: wallet.balance } });

                    await WalletHistoryModel.create({
                        email,
                        amount: finalAmountToAdd.toString(),
                        type: 'Invest Withdraw',
                        description: `Investment Withdrawal approved (${subscriptionPlan})`,
                        status: 'Success',
                        prevBalance: currentBalance.minus(finalAmountToAdd).toFixed(8),
                        newBalance: currentBalance.toFixed(8)
                    });
                } else {
                    currentBalance = currentBalance.plus(withdrawalAmount);
                    wallet.balance = currentBalance.toFixed(8);
                    await WalletModel.updateOne({ email }, { $set: { balance: wallet.balance } });
                }
            }

            await updatedRequest.save();
            const responseData = {
                ...updatedRequest.toObject(),
                finalAmountCredited: finalAmountToAdd,
                daysSinceInvestment: daysSinceCreation,
                deductionPercentage: deductionPercentage * 100,
            };
            return { oldData, updated: responseData };
        } catch (error) {
            throw error;
        }
    }

    // --- NEW PAGINATED SERVICES ---

    async getAllInvestsPaginated(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let query: any = { isClosed: false };

            if (search) {
                query.email = { $regex: search, $options: 'i' };
            }

            const aggregation = await InvestModel.aggregate([
                { $match: query },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            return {
                status: "success",
                data: aggregation[0].data,
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

    async getAllInvestHistoryPaginated(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let query: any = {};

            if (search) {
                query.email = { $regex: search, $options: 'i' };
            }

            const aggregation = await InvestmentHistoryModel.aggregate([
                { $match: query },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            return {
                status: "success",
                data: aggregation[0].data,
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

    async getPlatinumInvestorsPaginated(page: number = 1, limit: number = 20, search: string = '') {
        try {
            const skip = (page - 1) * limit;
            let query: any = { isClosed: false };

            if (search) {
                query.email = { $regex: search, $options: 'i' };
            }

            const aggregation = await PlatinumInvestModel.aggregate([
                { $match: query },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ]);

            const total = aggregation[0].metadata[0]?.total || 0;
            return {
                status: "success",
                data: aggregation[0].data,
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

    async getPlatinumPaymentHistories(params: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
        email?: string;
        subscription?: string;
        action?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                search,
                email,
                subscription,
                action,
                type,
                startDate,
                endDate
            } = params;

            const query: any = {};

            if (email) query.email = { $regex: email, $options: 'i' };
            if (subscription) query.subscription = subscription;
            if (action) query.action = action;
            if (type) query.type = type;

            if (startDate || endDate) {
                const dateQuery: any = {};
                if (startDate) dateQuery.$gte = new Date(startDate);
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    dateQuery.$lte = end;
                }
                query.createdAt = dateQuery;
            }

            if (search) {
                query.$or = [
                    { email: { $regex: search, $options: 'i' } },
                    { subscription: { $regex: search, $options: 'i' } },
                    { action: { $regex: search, $options: 'i' } },
                    { type: { $regex: search, $options: 'i' } }
                ];
            }

            const sort: any = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const skip = (page - 1) * limit;

            const [histories, totalCount, summaryAggregation, userRankings] = await Promise.all([
                PlatinumHistoryModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
                PlatinumHistoryModel.countDocuments(query),
                PlatinumHistoryModel.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: null,
                            totalTransactions: { $sum: 1 },
                            totalCredit: {
                                $sum: {
                                    $cond: [{ $eq: ['$type', 'credit'] }, { $toDouble: '$amount' }, 0]
                                }
                            },
                            totalDebit: {
                                $sum: {
                                    $cond: [{ $eq: ['$type', 'debit'] }, { $toDouble: '$amount' }, 0]
                                }
                            },
                            uniqueUsers: { $addToSet: '$email' }
                        }
                    }
                ]),
                PlatinumHistoryModel.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: '$email',
                            totalInvestments: { $sum: 1 },
                            totalAmount: { $sum: { $toDouble: '$amount' } },
                            latestInvestment: { $max: '$createdAt' },
                            firstInvestment: { $min: '$createdAt' }
                        }
                    },
                    { $sort: { totalAmount: -1 } },
                    { $limit: 10 }
                ])
            ]);

            const summary = summaryAggregation[0] || {
                totalTransactions: 0,
                totalCredit: 0,
                totalDebit: 0,
                uniqueUsers: []
            };

            return {
                status: "success",
                data: {
                    histories,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalCount / limit),
                        totalItems: totalCount,
                        itemsPerPage: limit
                    },
                    summary: {
                        totalTransactions: summary.totalTransactions,
                        totalCredit: (summary.totalCredit || 0).toFixed(2),
                        totalDebit: (summary.totalDebit || 0).toFixed(2),
                        netBalance: ((summary.totalCredit || 0) - (summary.totalDebit || 0)).toFixed(2),
                        uniqueUsersCount: summary.uniqueUsers?.length || 0
                    },
                    userSummary: userRankings
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getPlatinumPaymentFilters() {
        try {
            const filters = await PlatinumHistoryModel.aggregate([
                {
                    $facet: {
                        emails: [{ $group: { _id: '$email' } }, { $sort: { _id: 1 } }, { $limit: 100 }],
                        subscriptions: [{ $group: { _id: '$subscription' } }, { $sort: { _id: 1 } }],
                        actions: [{ $group: { _id: '$action' } }, { $sort: { _id: 1 } }],
                        types: [{ $group: { _id: '$type' } }, { $sort: { _id: 1 } }]
                    }
                }
            ]);

            return {
                status: "success",
                data: {
                    emails: filters[0].emails.map((e: any) => e._id),
                    subscriptions: filters[0].subscriptions.map((s: any) => s._id),
                    actions: filters[0].actions.map((a: any) => a._id),
                    types: filters[0].types.map((t: any) => t._id)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async generate2FASecret(email: string) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("User not found");

            const secret = generateSecret();
            const otpauth = generateURI({ issuer: 'Growwin Admin', label: email, secret });
            const qrCodeDataURL = await QRCode.toDataURL(otpauth);

            user.twoFactorSecret = secret;
            await user.save();

            return {
                status: "success",
                secret,
                qrCodeDataURL
            };
        } catch (error) {
            throw error;
        }
    }

    async verify2FAAndEnable(email: string, token: string) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("User not found");
            if (!user.twoFactorSecret) throw new Error("2FA setup not initiated");

            const isValid = await verify({
                token,
                secret: user.twoFactorSecret
            });

            if (!isValid.valid) return { status: "fail", message: "Invalid 2FA token" };

            user.twoFactorEnabled = true;
            await user.save();

            return { status: "success", message: "2FA enabled successfully" };
        } catch (error) {
            throw error;
        }
    }

    async disable2FA(email: string) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("User not found");

            user.twoFactorEnabled = false;
            (user as any).twoFactorSecret = undefined;
            await user.save();

            return { status: "success", message: "2FA disabled successfully" };
        } catch (error) {
            throw error;
        }
    }

    async verify2FALogin(email: string, token: string, tempToken: string) {
        try {
            const secretKey = process.env['JWT_SECRET'] || 'growwin-dashboard-secret-key-2024';
            let decoded: any;
            try {
                decoded = jwt.verify(tempToken, secretKey);
            } catch (err) {
                return { status: "fail", message: "Session expired or invalid. Please login again." };
            }

            if (decoded.email !== email || !decoded.is2FAPending) {
                return { status: "fail", message: "Invalid session" };
            }

            const user = await UserModel.findOne({ email });
            if (!user || !user.twoFactorSecret) return { status: "fail", message: "User configuration error" };

            const isValid = await verify({
                token,
                secret: user.twoFactorSecret
            });

            if (!isValid.valid) return { status: "fail", message: "Invalid 2FA token" };

            // Fetch RBAC data
            const adminRole = await AdminRoleModel.findOne({ email }).lean();
            const role = adminRole ? adminRole.role : (user as any).role;
            const permissions = adminRole ? adminRole.permissions : [];
            const isSuperAdmin = role === 'Super Admin';

            // Issue a REAL JWT token
            const access_token = jwt.sign(
                { id: (user as any)._id, email: user.email, role: role, name: user.name },
                secretKey,
                { expiresIn: '1d' }
            );

            return {
                status: "success",
                access_token: access_token,
                userId: (user as any)._id.toString(),
                name: user.name,
                role: role,
                isSuperAdmin: isSuperAdmin,
                permissions: permissions,
                twoFactorEnabled: (user as any).twoFactorEnabled
            };
        } catch (error) {
            throw error;
        }
    }
}
