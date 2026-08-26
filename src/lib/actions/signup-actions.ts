"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/validation/signup";

export type SignupActionState = { error: string } | null;

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

export async function signupAction(
  _prev: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const parsed = signupSchema.safeParse({
    householdName: formData.get("householdName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { householdName, name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account already exists for this email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({ data: { name: householdName } });

    const user = await tx.user.create({
      data: { householdId: household.id, name, email, passwordHash },
    });

    await tx.personTag.create({
      data: { householdId: household.id, name, userId: user.id },
    });

    await tx.home.create({
      data: { householdId: household.id, name: "General" },
    });

    const expenseCategories = await tx.category.createManyAndReturn({
      data: DEFAULT_EXPENSE_CATEGORIES.map((catName) => ({
        householdId: household.id,
        name: catName,
        kind: "expense" as const,
        isSystem: true,
      })),
    });

    await tx.category.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map((catName) => ({
        householdId: household.id,
        name: catName,
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
          householdId: household.id,
          name: rule.name,
          matchText: rule.matchText,
          matchType: "contains",
          categoryId,
          source: "user_defined",
        },
      });
    }
  });

  redirect("/login?joined=1");
}
