import { prisma } from "@/lib/prisma";
import { FeedbackList } from "@/components/admin/feedback-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Feedback",
  robots: { index: false, follow: false },
};

export default async function AdminFeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      household: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Questions, reviews, and bug reports submitted by users.
        </p>
      </div>

      {feedback.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <FeedbackList items={feedback} />
      )}
    </div>
  );
}
