import { prisma } from "@/lib/prisma";
import { getHouseholdId } from "@/lib/session";
import {
  createPersonTagAction,
  deactivatePersonTagAction,
} from "@/lib/actions/reference-data-actions";
import { SimpleTagManager } from "@/components/reference-data/simple-tag-manager";

export default async function PeoplePage() {
  const householdId = await getHouseholdId();
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
    />
  );
}
