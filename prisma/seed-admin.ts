// One-time bootstrap for the admin account. Run with:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run seed:admin
// Never hardcode the admin's credentials in source — they live only in env
// vars (or your shell history) and the hashed row this script writes.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD should be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin", passwordHash },
    });
    console.log(`Updated existing user ${email} -> role: admin.`);
    return;
  }

  // A new admin still needs a household row (schema requires it), but it
  // shouldn't be mixed into a real family's household — give it its own.
  const household = await prisma.household.create({ data: { name: "AdminHousehold" } });

  await prisma.user.create({
    data: {
      householdId: household.id,
      name,
      email,
      passwordHash,
      role: "admin",
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`Created admin user ${email} in a dedicated household "${household.name}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
