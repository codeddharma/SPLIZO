import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { FeedbackAddButton } from "@/components/feedback/feedback-add-button";
import {
  FEEDBACK_TYPE_LABEL,
  FEEDBACK_TYPE_STYLE,
  FEEDBACK_STATUS_LABEL,
  FEEDBACK_STATUS_STYLE,
  feedbackDateFormatter,
} from "@/lib/feedback-ui";

export default async function FeedbackPage() {
  const session = await requireSession();

  const myFeedback = await prisma.feedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 sm:max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
          <p className="text-sm text-muted-foreground">
            Send a bug, a question, or a review — and see below whether it&apos;s been looked at.
          </p>
        </div>
        <FeedbackAddButton />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Your submissions ({myFeedback.length})
        </h2>
        {myFeedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t sent anything yet.</p>
        ) : (
          myFeedback.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FEEDBACK_TYPE_STYLE[item.type]}`}>
                    {FEEDBACK_TYPE_LABEL[item.type]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FEEDBACK_STATUS_STYLE[item.status]}`}>
                    {FEEDBACK_STATUS_LABEL[item.status]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {feedbackDateFormatter.format(item.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
