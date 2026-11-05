export type FeedbackType = "feedback" | "question" | "review";
export type FeedbackStatus = "open" | "seen" | "resolved";

export const FEEDBACK_TYPE_LABEL: Record<FeedbackType, string> = {
  feedback: "Feedback",
  question: "Question",
  review: "Review",
};

// Each type gets its own color, distinct from the status badge colors below.
export const FEEDBACK_TYPE_STYLE: Record<FeedbackType, string> = {
  feedback: "bg-balance/10 text-balance",
  question: "bg-highlight/10 text-highlight",
  review: "bg-warning/10 text-warning",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  open: "Open",
  seen: "Seen",
  resolved: "Resolved",
};

export const FEEDBACK_STATUS_STYLE: Record<FeedbackStatus, string> = {
  open: "bg-expense/10 text-expense",
  seen: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  resolved: "bg-income/10 text-income",
};

export const feedbackDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});
