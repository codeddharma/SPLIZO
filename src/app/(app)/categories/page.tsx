import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createCategoryAction, deactivateCategoryAction } from "@/lib/actions/reference-data-actions";
import { CategoryManager } from "@/components/reference-data/category-manager";

export default async function CategoriesPage() {
  const householdId = await getHouseholdId();
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
    />
  );
}
