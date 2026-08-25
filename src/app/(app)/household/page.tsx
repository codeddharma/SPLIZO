import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createHomeAction, deactivateHomeAction } from "@/lib/actions/reference-data-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";
import { PeopleManager } from "@/components/reference-data/people-manager";
import { EntityTabs } from "@/components/reference-data/entity-tabs";

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "place" ? "place" : "people";
  const householdId = await getHouseholdId();

  if (activeTab === "place") {
    const homes = await prisma.home.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
    });

    return (
      <SimpleTagManager
        items={homes}
        createAction={createHomeAction}
        deactivateAction={deactivateHomeAction}
        title="Place"
        description="Rented, owned, parents', or General for anything not tied to a specific home."
        label="Place"
        placeholder="e.g. Rented Home"
        tabs={<EntityTabs active="place" />}
      />
    );
  }

  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;

  const [people, invites] = await Promise.all([
    prisma.personTag.findMany({
      where: { householdId, isActive: true },
      orderBy: { name: "asc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.invite.findMany({
      where: { householdId, status: "pending" },
      select: { id: true, personTagId: true, token: true },
    }),
  ]);

  return (
    <PeopleManager
      people={people}
      invites={invites}
      origin={origin}
      tabs={<EntityTabs active="people" />}
    />
  );
}
