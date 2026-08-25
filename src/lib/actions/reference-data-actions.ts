"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  nameOnlySchema,
  accountSchema,
  categorySchema,
  categoryRuleSchema,
} from "@/lib/validation/reference-data";

// Homes

export async function createHomeAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const { name } = nameOnlySchema.parse({ name: formData.get("name") });
  await prisma.home.create({ data: { householdId, name } });
  revalidatePath("/household");
}

export async function deactivateHomeAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.home.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/household");
}

// Person tags

export async function createPersonTagAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const { name } = nameOnlySchema.parse({ name: formData.get("name") });
  await prisma.personTag.create({ data: { householdId, name } });
  revalidatePath("/household");
}

export async function deactivatePersonTagAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.personTag.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/household");
}

// Accounts

export async function createAccountAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = accountSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    institution: formData.get("institution") ?? "",
    last4: formData.get("last4") ?? "",
  });
  await prisma.account.create({
    data: {
      householdId,
      name: parsed.name,
      type: parsed.type,
      institution: parsed.institution || null,
      last4: parsed.last4 || null,
    },
  });
  revalidatePath("/accounts");
}

export async function deactivateAccountAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.account.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/accounts");
}

// Categories

export async function createCategoryAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    kind: formData.get("kind"),
  });
  await prisma.category.create({
    data: { householdId, name: parsed.name, kind: parsed.kind, isSystem: false },
  });
  revalidatePath("/categories");
}

export async function deactivateCategoryAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.category.updateMany({
    where: { id, householdId, isSystem: false },
    data: { isActive: false },
  });
  revalidatePath("/categories");
}

// Category rules (description-text match -> auto-assigned category)

export async function createCategoryRuleAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = categoryRuleSchema.parse({
    name: formData.get("name"),
    matchText: formData.get("matchText"),
    matchType: formData.get("matchType"),
    categoryId: formData.get("categoryId"),
  });
  await prisma.categoryRule.create({
    data: {
      householdId,
      name: parsed.name,
      matchText: parsed.matchText,
      matchType: parsed.matchType,
      categoryId: parsed.categoryId,
      source: "user_defined",
    },
  });
  revalidatePath("/categories");
}

export async function deactivateCategoryRuleAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.categoryRule.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/categories");
}
