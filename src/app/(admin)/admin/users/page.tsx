import { prisma } from "@/lib/prisma";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/ui/accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users",
  robots: { index: false, follow: false },
};

// Shared across every row (main account, invited members, header) so the
// Joined/Last login values always land in the same two fixed-width columns
// regardless of how long a name or email is.
const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_150px_170px] items-center gap-x-4";

function formatDate(date: Date | null) {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function RoleBadge({ role }: { role: "user" | "admin" }) {
  if (role !== "admin") return null;
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
  );
}

function NoLoginBadge() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      No login
    </span>
  );
}

// A household's "other people" are everyone besides the main account: both
// invited members (a login exists) and person-tags that were only ever added
// by name and never invited (no login, so nothing to show but the name).
type OtherPerson =
  | { kind: "member"; id: string; name: string; email: string; role: "user" | "admin"; createdAt: Date; lastLoginAt: Date | null }
  | { kind: "tag"; id: string; name: string };

export default async function AdminUsersPage() {
  const households = await prisma.household.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      users: { orderBy: { createdAt: "asc" } },
      personTags: { where: { isActive: true }, select: { id: true, name: true, userId: true } },
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Grouped by household — the main account is the one who created it. Added-but-not-invited
          people show up too, with no login. Passwords are hashed and can&apos;t be shown.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {households.map((household) => {
          const [mainUser, ...otherUsers] = household.users;
          if (!mainUser) return null;

          const otherPeople: OtherPerson[] = [
            ...otherUsers.map((u) => ({
              kind: "member" as const,
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt,
              lastLoginAt: u.lastLoginAt,
            })),
            ...household.personTags
              .filter((t) => !t.userId)
              .map((t) => ({ kind: "tag" as const, id: t.id, name: t.name })),
          ];

          return (
            <div key={household.id} className="rounded-xl border border-border bg-card px-4">
              <div className="py-3">
                <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {household.name}
                </div>
                <div className={`${ROW_GRID} mt-1`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{mainUser.name}</span>
                      <RoleBadge role={mainUser.role} />
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{mainUser.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(mainUser.createdAt)}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(mainUser.lastLoginAt)}</div>
                </div>
              </div>

              {otherPeople.length > 0 && (
                <Accordion>
                  <AccordionItem value="members">
                    <AccordionTrigger>
                      {otherPeople.length} other {otherPeople.length === 1 ? "person" : "people"}
                    </AccordionTrigger>
                    <AccordionPanel>
                      <div className="flex flex-col rounded-lg border border-border">
                        <div className={`${ROW_GRID} border-b border-border px-3 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase`}>
                          <div>Name</div>
                          <div>Joined</div>
                          <div>Last login</div>
                        </div>
                        <div className="flex flex-col divide-y divide-border">
                          {otherPeople.map((p) => (
                            <div key={p.id} className={`${ROW_GRID} px-3 py-2`}>
                              {p.kind === "member" ? (
                                <>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate text-sm font-medium">{p.name}</span>
                                      <RoleBadge role={p.role} />
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</div>
                                  <div className="text-xs text-muted-foreground">{formatDate(p.lastLoginAt)}</div>
                                </>
                              ) : (
                                <>
                                  <div className="min-w-0 truncate text-sm font-medium">{p.name}</div>
                                  <div />
                                  <div>
                                    <NoLoginBadge />
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
