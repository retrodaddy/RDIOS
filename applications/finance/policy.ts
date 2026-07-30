/**
 * Finance's Policy extension points (Part 8). No Policy Engine is built
 * here — the founder was explicit about that — but every place a future
 * Policy would need to plug in is named as a real function with a single
 * caller, never inlined into an action, so swapping the body later never
 * means hunting through applications/finance/actions.ts for a hardcoded
 * assumption.
 *
 * Today, every function below returns a constant. That constant IS this
 * institution's policy until a real Policy Engine exists to make it
 * configurable — honest about being a placeholder, not disguised as a
 * finished rule.
 */
import type { PermissionKey } from "@/engines/authority/types";
import type { Expense } from "./types";

/** Which Area of Responsibility must decide this expense before it's
 *  final. Today, always Treasury, regardless of amount or category — the
 *  seam a future "expense approval limits" or "purchase thresholds"
 *  Policy would replace with real logic (e.g. small expenses auto-approve,
 *  large ones need two Areas in sequence). Returning `null` would mean
 *  "no approval needed"; nothing does that yet. */
export function resolveExpenseApprovalArea(_expense: Pick<Expense, "amount" | "category">): PermissionKey {
  return "treasury.approve";
}

/** Whether a newly created Financial Account of a given kind needs
 *  approval before it can be used — always false today. The seam a future
 *  "budget controls" or "account creation" Policy would replace. */
export function accountCreationRequiresApproval(): boolean {
  return false;
}
