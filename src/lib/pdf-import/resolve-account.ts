import type { AccountType } from "@prisma/client";

type ExistingAccount = { id: string; institution: string | null; last4: string | null };

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\./g, "");
}

function parseAccountHint(hint: string): {
  institution: string;
  identifier?: string;
  typeHint?: AccountType;
} {
  let text = hint.trim();
  let typeHint: AccountType | undefined;

  const pipeIdx = text.indexOf("|");
  if (pipeIdx !== -1) {
    const suffix = text.slice(pipeIdx + 1).trim().toLowerCase();
    text = text.slice(0, pipeIdx).trim();
    if (suffix.includes("credit card") || suffix.includes("debit card")) typeHint = "card";
  }

  const tokens = text.split(/\s+/);
  let identifier: string | undefined;
  if (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    if (/\d/.test(last) && /^[A-Za-z0-9]{2,6}$/.test(last)) {
      identifier = last;
      tokens.pop();
    }
  }

  return { institution: tokens.join(" ").trim(), identifier, typeHint };
}

export type AccountResolution =
  | { accountId: string }
  | {
      createData: { name: string; institution: string; type: AccountType; last4: string | null };
    };

export function resolveAccountHint(
  hint: string,
  existingAccounts: ExistingAccount[]
): AccountResolution {
  const { institution, identifier, typeHint } = parseAccountHint(hint);
  const normInst = normalize(institution);

  const candidates = existingAccounts.filter((a) => {
    const accInst = normalize(a.institution ?? "");
    return accInst.length > 0 && (accInst.includes(normInst) || normInst.includes(accInst));
  });

  if (identifier) {
    const withLast4 = candidates.find(
      (a) => a.last4 && a.last4.toLowerCase() === identifier.toLowerCase()
    );
    if (withLast4) return { accountId: withLast4.id };
  }

  if (candidates.length === 1) {
    return { accountId: candidates[0].id };
  }

  return {
    createData: {
      name: identifier ? `${institution} ${identifier}` : institution,
      institution,
      type: typeHint ?? "bank",
      last4: identifier && /^\d{4}$/.test(identifier) ? identifier : null,
    },
  };
}
