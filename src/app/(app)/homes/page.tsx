import { redirect } from "next/navigation";

export default function HomesRedirect() {
  redirect("/household?tab=place");
}
