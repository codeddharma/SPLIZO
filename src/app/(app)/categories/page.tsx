import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import {
  createCategoryAction,
  deactivateCategoryAction,
  createCategoryRuleAction,
  deactivateCategoryRuleAction,
} from "@/lib/actions/reference-data-actions";
import { CategoryManager } from "@/components/reference-data/category-manager";
import { CategoryRuleManager } from "@/components/reference-data/category-rule-manager";
import { CategoryTabs } from "@/components/reference-data/category-tabs";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "rules" ? "rules" : "categories";
  const householdId = await getHouseholdId();

  if (activeTab === "rules") {
    const [rules, categories] = await Promise.all([
      prisma.categoryRule.findMany({
        where: { householdId, isActive: true },
        include: { category: { select: { name: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        where: { householdId, isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return (
      <CategoryRuleManager
        rules={rules}
        categories={categories}
        createAction={createCategoryRuleAction}
        deactivateAction={deactivateCategoryRuleAction}
        tabs={<CategoryTabs active="rules" />}
      />
    );
  }

  const categories = await prisma.category.findMany({
    where: { householdId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <CategoryManager
      expenseCategories={categories.filter((c) => c.kind === "expense")}
      incomeCategories={categories.filter((c) => c.kind === "income")}
      createAction={createCategoryAction}
      deactivateAction={deactivateCategoryAction}
      tabs={<CategoryTabs active="categories" />}
    />
  );
}
