"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { signOut, unstable_update } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  updateNameSchema,
  changePasswordSchema,
  dangerZoneConfirmSchema,
} from "@/lib/validation/settings";

export type SettingsActionState = { error: string } | { success: string } | null;

const DEFAULT_EXPENSE_CATEGORIES = [
  "Groceries",
  "Rent",
  "Utilities",
  "Dining Out",
  "Domestic Help",
  "Transport & Fuel",
  "Health",
  "Travel",
  "Insurance",
  "Subscriptions",
  "Shopping",
  "Gifts & Donations",
  "Other Expense",
];

const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance / Business Income",
  "Investments / Dividends",
  "Rental Income",
  "Other Income",
];

const DEFAULT_CATEGORY_RULES: { name: string; matchText: string; category: string }[] = [
  { name: "Swiggy", matchText: "SWIGGY", category: "Dining Out" },
  { name: "Zomato", matchText: "ZOMATO", category: "Dining Out" },
  { name: "Amazon", matchText: "AMAZON", category: "Shopping" },
  { name: "Flipkart", matchText: "FLIPKART", category: "Shopping" },
  { name: "Uber", matchText: "UBER", category: "Transport & Fuel" },
  { name: "Ola", matchText: "OLA", category: "Transport & Fuel" },
  { name: "Airtel", matchText: "AIRTEL", category: "Utilities" },
  { name: "BigBasket", matchText: "BIGBASKET", category: "Groceries" },
];

export async function updateNameAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await requireSession();
  const parsed = updateNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  // Refreshes the JWT itself (not just the DB) so the sidebar/topbar, which
  // read the name straight off the session, update without a re-login.
  await unstable_update({ user: { name: parsed.data.name } });
  // "/" is served by the root layout only — (app)/layout.tsx (where the
  // sidebar/topbar actually live) only wraps nested routes, so it has to be
  // revalidated via a path that's actually inside that route group.
  revalidatePath("/settings", "layout");
  return { success: "Name updated." };
}

export async function changePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await requireSession();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Password updated." };
}

async function verifyDangerZoneConfirmation(
  formData: FormData,
  expectedPhrase: string
): Promise<{ error: string } | { userId: string; householdId: string }> {
  const session = await requireSession();
  const parsed = dangerZoneConfirmSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password is required." };
  }

  const typedPhrase = String(formData.get("confirmPhrase") ?? "");
  if (typedPhrase !== expectedPhrase) {
    return { error: `Type "${expectedPhrase}" exactly to confirm.` };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  return { userId: user.id, householdId: user.householdId };
}

// Wipes every household-owned record (transactions, accounts, categories,
// homes, people, contacts, loans) and reseeds the same defaults signup
// creates, so the household ends up looking freshly created. Logins
// (User rows) are left untouched — only their person tags are rebuilt.
export async function resetAccountAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const result = await verifyDangerZoneConfirmation(formData, "RESET");
  if ("error" in result) return result;
  const { householdId } = result;

  await prisma.$transaction(
    async (tx) => {
      // Break the self-referential parentId link before bulk-deleting
      // categories, so the delete isn't order-sensitive.
      await tx.category.updateMany({ where: { householdId }, data: { parentId: null } });

      const loans = await tx.loan.findMany({ where: { householdId }, select: { id: true } });
      await tx.loanRepayment.deleteMany({ where: { loanId: { in: loans.map((l) => l.id) } } });
      await tx.loan.deleteMany({ where: { householdId } });

      // Cascades TransactionHome and TransactionPersonTag automatically.
      await tx.transaction.deleteMany({ where: { householdId } });

      // Cascades AccountOwner automatically.
      await tx.account.deleteMany({ where: { householdId } });

      await tx.categoryRule.deleteMany({ where: { householdId } });
      await tx.category.deleteMany({ where: { householdId } });
      await tx.importBatch.deleteMany({ where: { householdId } });
      await tx.invite.deleteMany({ where: { householdId } });
      await tx.contact.deleteMany({ where: { householdId } });
      await tx.home.deleteMany({ where: { householdId } });
      await tx.personTag.deleteMany({ where: { householdId } });

      const users = await tx.user.findMany({ where: { householdId } });
      for (const user of users) {
        await tx.personTag.create({ data: { householdId, name: user.name, userId: user.id } });
      }

      await tx.home.create({ data: { householdId, name: "General" } });
      await tx.account.create({
        data: { householdId, name: "Cash", type: "cash", isSystem: true },
      });

      const expenseCategories = await tx.category.createManyAndReturn({
        data: DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
          householdId,
          name,
          kind: "expense" as const,
          isSystem: true,
        })),
      });

      await tx.category.createMany({
        data: DEFAULT_INCOME_CATEGORIES.map((name) => ({
          householdId,
          name,
          kind: "income" as const,
          isSystem: true,
        })),
      });

      const categoryIdByName = Object.fromEntries(expenseCategories.map((c) => [c.name, c.id]));

      for (const rule of DEFAULT_CATEGORY_RULES) {
        const categoryId = categoryIdByName[rule.category];
        if (!categoryId) continue;
        await tx.categoryRule.create({
          data: {
            householdId,
            name: rule.name,
            matchText: rule.matchText,
            matchType: "contains",
            categoryId,
            source: "user_defined",
          },
        });
      }
    },
    { timeout: 20000 }
  );

  redirect("/dashboard?reset=1");
}

// If this user is the only login in the household, deletes everything
// (all data, the user, and the household itself). If others remain, only
// this user's own login is removed — their person tag survives unlinked,
// same as "Remove access" on the Household page, so shared transactions
// and the other members' data are untouched.
export async function deleteAccountAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const result = await verifyDangerZoneConfirmation(formData, "DELETE");
  if ("error" in result) return result;
  const { userId, householdId } = result;

  const otherUsersCount = await prisma.user.count({
    where: { householdId, id: { not: userId } },
  });

  if (otherUsersCount === 0) {
    await prisma.$transaction(
      async (tx) => {
        await tx.category.updateMany({ where: { householdId }, data: { parentId: null } });

        const loans = await tx.loan.findMany({ where: { householdId }, select: { id: true } });
        await tx.loanRepayment.deleteMany({ where: { loanId: { in: loans.map((l) => l.id) } } });
        await tx.loan.deleteMany({ where: { householdId } });

        await tx.transaction.deleteMany({ where: { householdId } });
        await tx.account.deleteMany({ where: { householdId } });
        await tx.categoryRule.deleteMany({ where: { householdId } });
        await tx.category.deleteMany({ where: { householdId } });
        await tx.importBatch.deleteMany({ where: { householdId } });
        await tx.invite.deleteMany({ where: { householdId } });
        await tx.contact.deleteMany({ where: { householdId } });
        await tx.home.deleteMany({ where: { householdId } });
        await tx.personTag.deleteMany({ where: { householdId } });
        await tx.user.deleteMany({ where: { householdId } });
        await tx.household.delete({ where: { id: householdId } });
      },
      { timeout: 20000 }
    );
  } else {
    // onDelete: SetNull on PersonTag.userId unlinks their tag automatically.
    await prisma.user.delete({ where: { id: userId } });
  }

  await signOut({ redirectTo: "/" });
  return null;
}
