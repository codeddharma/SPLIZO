import { Suspense } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import { createHomeAction, deactivateHomeAction } from "@/lib/actions/reference-data-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";
import { PeopleManager } from "@/components/reference-data/people-manager";
import { EntityTabs } from "@/components/reference-data/entity-tabs";
import { ListPanelSkeleton } from "@/components/reference-data/list-panel-skeleton";

async function HouseholdPanel({
  activeTab,
  householdId,
  origin,
}: {
  activeTab: "people" | "place";
  householdId: string;
  origin: string;
}) {
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
      />
    );
  }

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

  return <PeopleManager people={people} invites={invites} origin={origin} />;
}

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "place" ? "place" : "people";
  const householdId = await getHouseholdId();
  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <EntityTabs active={activeTab} />
      <Suspense key={activeTab} fallback={<ListPanelSkeleton formFields={1} />}>
        <HouseholdPanel activeTab={activeTab} householdId={householdId} origin={origin} />
      </Suspense>
    </div>
  );
}
