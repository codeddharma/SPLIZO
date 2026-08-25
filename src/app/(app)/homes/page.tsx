import { redirect } from "next/navigation";

export default function HomesRedirect() {
  redirect("/people?tab=place");
}
