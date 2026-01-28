import { Decimal } from 'decimal.js';
import InvestModel from '../models/invest.model.js';
import PlatinumInvestModel from '../models/platinumInvest.model.js';
import InvestmentLotModel from '../models/investmentLot.model.js';

type PlanKind = 'normal' | 'platinum';

interface IncomeSecurityResult {
    success: boolean;
    reason?: string;
    email: string;
    plan: PlanKind;
    investRecord?: any;
    lots?: any[];
    sumMatches?: boolean;
    sumOfLots?: string;
    totalAmount?: string;
    filteredLots?: any[];
    incomeDate?: string;
    eligiblePrincipal?: string;
    adjustedPrincipal?: string;
}

export async function incomeSecurityGuard(
    email: string,
    plan: PlanKind
): Promise<IncomeSecurityResult> {
    try {
        if (!email) {
            return { success: false, reason: 'Email required', email: '', plan };
        }

        const InvestModelSelected: any = plan === 'platinum' ? PlatinumInvestModel : InvestModel;
        const investRecord = await InvestModelSelected.findOne({ email, isClosed: false }).lean().exec();

        if (!investRecord) {
            return { success: false, reason: 'No active invest found', email, plan };
        }

        const totalAmountStr = String(investRecord.totalAmount ?? '0');
        const totalAmount = new Decimal(totalAmountStr);
        const incomeDate = investRecord.incomeDate ? new Date(investRecord.incomeDate) : null;

        if (!incomeDate) {
            return { success: false, reason: 'Invest record missing incomeDate', email, plan, investRecord };
        }

        const dbPlan = plan === 'platinum' ? 'PLATINUM' : 'NORMAL';
        const lots = await InvestmentLotModel.find({ email, plan: dbPlan, closed: false }).lean().exec();

        if (!lots || lots.length === 0) {
            return { success: false, reason: 'No lots found', email, plan, investRecord, lots: [] };
        }

        // SUM OF LOTS
        let lotSum = new Decimal(0);
        for (const l of lots as any[]) {
            const amt = String(l.amount ?? '0');
            lotSum = lotSum.plus(new Decimal(amt));
        }
        const sumMatches = lotSum.equals(totalAmount);

        // 7-day window filter
        const from = new Date(incomeDate);
        from.setDate(from.getDate() - 7);
        const to = new Date(incomeDate);

        const filteredLots = (lots as any[]).filter(lot => {
            const createdRaw = lot.createdAt ?? lot.investDate ?? lot.updatedAt ?? null;
            if (!createdRaw) return false;
            const created = new Date(createdRaw);
            if (isNaN(created.getTime())) return false;
            return created >= from && created <= to;
        });

        // ELIGIBLE PRINCIPAL: totalAmount - sum(filteredLots.amount)
        let recentLotsSum = new Decimal(0);
        for (const lot of filteredLots) {
            recentLotsSum = recentLotsSum.plus(new Decimal(String(lot.amount ?? '0')));
        }
        const eligiblePrincipal = Decimal.max(totalAmount.minus(recentLotsSum), 0);

        return {
            success: true,
            email,
            plan,
            investRecord,
            lots,
            sumMatches,
            sumOfLots: lotSum.toString(),
            totalAmount: totalAmountStr,
            filteredLots,
            incomeDate: incomeDate.toISOString(),
            eligiblePrincipal: eligiblePrincipal.toString(),
            adjustedPrincipal: eligiblePrincipal.toString()
        };
    } catch (err: any) {
        return { success: false, reason: err?.message ?? String(err), email: '', plan: 'normal' };
    }
}
