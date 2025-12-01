import { Validator } from "../types/Validator";
import { SystemContext } from "../types/SystemContext";

export type SafetyIssue =
    | "very_low_stake"
    | "at_risk"
    | "high_commission"
    | "high_withdrawals";

export interface SafetyIssuesResult {
    hasIssues: boolean;
    issues: SafetyIssue[];
    messages: string[];
}

export function safetyIssues(validator: Validator, systemContext: SystemContext | undefined): SafetyIssuesResult {
    if (!systemContext) {
        return { hasIssues: false, issues: [], messages: [] };
    }

    const issues: SafetyIssue[] = [];
    const messages: string[] = [];

    // Check if below very-low stake threshold
    const validatorStake = Number(validator.stake);
    const veryLowThreshold = Number(systemContext.validatorVeryLowStakeThreshold);
    if (validatorStake < veryLowThreshold) {
        issues.push("very_low_stake");
        messages.push("Below very-low stake threshold");
    }

    // Check if listed in at-risk validators
    if (systemContext.atRiskValidators[validator.address] !== undefined) {
        issues.push("at_risk");
        messages.push("At-risk validator");
    }

    // Check if commission > 10%
    // Commission rate is in basis points: 100 bps = 1%, 1,000 bps = 10%
    const commissionRateBps = Number(validator.commissionRate);
    const commissionRateDecimal = commissionRateBps / 10000; // Convert from basis points to decimal (1,000 bps = 0.10 = 10%)
    if (commissionRateDecimal > 0.10) {
        issues.push("high_commission");
        messages.push(`Commission ${(commissionRateDecimal * 100)}% > 10%`);
    }

    // Check if withdrawals > 15% of pool
    const poolBalance = Number(validator.stake);
    const pendingWithdrawals = Number(validator.pendingTotalSuiWithdraw);
    if (poolBalance > 0) {
        const withdrawalPercentage = pendingWithdrawals / poolBalance;
        if (withdrawalPercentage > 0.15) {
            issues.push("high_withdrawals");
            messages.push(`Withdrawals ${(withdrawalPercentage * 100).toFixed(2)}% > 15%`);
        }
    }

    return {
        hasIssues: issues.length > 0,
        issues,
        messages,
    };
}

