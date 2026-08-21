"use server";

import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  nameOnlySchema,
  accountSchema,
  categorySchema,
  vendorRuleSchema,
} from "@/lib/validation/reference-data";

// Homes

export async function createHomeAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const { name } = nameOnlySchema.parse({ name: formData.get("name") });
  await prisma.home.create({ data: { householdId, name } });
  revalidatePath("/homes");
}

export async function deactivateHomeAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.home.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/homes");
}

// Person tags

export async function createPersonTagAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const { name } = nameOnlySchema.parse({ name: formData.get("name") });
  await prisma.personTag.create({ data: { householdId, name } });
  revalidatePath("/people");
}

export async function deactivatePersonTagAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.personTag.updateMany({ where: { id, householdId }, data: { isActive: false } });
  revalidatePath("/people");
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

// Vendor rules

export async function createVendorRuleAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const parsed = vendorRuleSchema.parse({
    matchText: formData.get("matchText"),
    matchType: formData.get("matchType"),
    categoryId: formData.get("categoryId"),
  });
  await prisma.vendorRule.create({
    data: {
      householdId,
      matchText: parsed.matchText,
      matchType: parsed.matchType,
      categoryId: parsed.categoryId,
      source: "user_defined",
    },
  });
  revalidatePath("/vendor-rules");
}

export async function deleteVendorRuleAction(formData: FormData) {
  const householdId = await getHouseholdId();
  const id = String(formData.get("id"));
  await prisma.vendorRule.deleteMany({ where: { id, householdId } });
  revalidatePath("/vendor-rules");
}
