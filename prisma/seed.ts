import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const household = await prisma.household.create({
    data: { name: "Our Household" },
  });

  const passwordHash = await bcrypt.hash("changeme123", 10);

  await prisma.user.createMany({
    data: [
      {
        householdId: household.id,
        name: "You",
        email: "you@example.com",
        passwordHash,
      },
      {
        householdId: household.id,
        name: "Spouse",
        email: "spouse@example.com",
        passwordHash,
      },
    ],
  });

  await prisma.personTag.createMany({
    data: [
      { householdId: household.id, name: "You" },
      { householdId: household.id, name: "Spouse" },
      { householdId: household.id, name: "Joint" },
    ],
  });

  await prisma.home.createMany({
    data: [
      { householdId: household.id, name: "Rented Home" },
      { householdId: household.id, name: "Own Home" },
      { householdId: household.id, name: "Parents' Home" },
    ],
  });

  const accounts = await prisma.account.createManyAndReturn({
    data: [
      { householdId: household.id, name: "Joint Savings", type: "bank", institution: "HDFC Bank" },
      { householdId: household.id, name: "Credit Card", type: "card", institution: "ICICI Bank" },
      { householdId: household.id, name: "UPI Wallet", type: "wallet", institution: "PhonePe" },
    ],
  });
  void accounts;

  const expenseCategories = [
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

  const incomeCategories = [
    "Salary",
    "Freelance / Business Income",
    "Investments / Dividends",
    "Rental Income",
    "Other Income",
  ];

  const createdExpenseCategories = await prisma.category.createManyAndReturn({
    data: expenseCategories.map((name) => ({
      householdId: household.id,
      name,
      kind: "expense" as const,
      isSystem: true,
    })),
  });

  await prisma.category.createMany({
    data: incomeCategories.map((name) => ({
      householdId: household.id,
      name,
      kind: "income" as const,
      isSystem: true,
    })),
  });

  const categoryByName = Object.fromEntries(
    createdExpenseCategories.map((c) => [c.name, c.id])
  );

  const vendorSeeds: { name: string; matchText: string; category: string }[] = [
    { name: "Swiggy", matchText: "SWIGGY", category: "Dining Out" },
    { name: "Zomato", matchText: "ZOMATO", category: "Dining Out" },
    { name: "Amazon", matchText: "AMAZON", category: "Shopping" },
    { name: "Flipkart", matchText: "FLIPKART", category: "Shopping" },
    { name: "Uber", matchText: "UBER", category: "Transport & Fuel" },
    { name: "Ola", matchText: "OLA", category: "Transport & Fuel" },
    { name: "BESCOM", matchText: "BESCOM", category: "Utilities" },
    { name: "Airtel", matchText: "AIRTEL", category: "Utilities" },
    { name: "BigBasket", matchText: "BIGBASKET", category: "Groceries" },
  ];

  for (const v of vendorSeeds) {
    const categoryId = categoryByName[v.category];
    if (!categoryId) continue;
    const vendor = await prisma.vendor.create({
      data: { householdId: household.id, name: v.name, matchText: v.matchText, matchType: "contains" },
    });
    await prisma.categoryRule.create({
      data: { householdId: household.id, vendorId: vendor.id, categoryId, source: "user_defined" },
    });
  }

  console.log("Seed complete.");
  console.log(`Household: ${household.name} (${household.id})`);
  console.log("Seed users: you@example.com / spouse@example.com, password: changeme123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
