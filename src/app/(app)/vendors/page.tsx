import { redirect } from "next/navigation";

export default function VendorsRedirect() {
  redirect("/categories?tab=rules");
}
