import { redirect } from "next/navigation";

export default function ReviewQueueRedirect() {
  redirect("/transactions?status=needs_review");
}
