import { redirect } from "next/navigation";

export default async function PeopleRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  redirect(tab ? `/household?tab=${tab}` : "/household");
}
