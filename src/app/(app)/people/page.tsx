import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import {
  createPersonTagAction,
  deactivatePersonTagAction,
  createHomeAction,
  deactivateHomeAction,
} from "@/lib/actions/reference-data-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";
import { EntityTabs } from "@/components/reference-data/entity-tabs";

export default async function PeoplePlacesPage({
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

  const people = await prisma.personTag.findMany({
    where: { householdId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <SimpleTagManager
      items={people}
      createAction={createPersonTagAction}
      deactivateAction={deactivatePersonTagAction}
      title="People"
      description="You, your spouse, joint, even 'Mom' or 'Dad' — decoupled from login accounts."
      label="Person"
      placeholder="e.g. Mom"
      tabs={<EntityTabs active="people" />}
    />
  );
}
