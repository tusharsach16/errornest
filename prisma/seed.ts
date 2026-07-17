import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateApiKey } from "../src/lib/api-key";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await db.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      passwordHash,
      name: "Demo User",
      emailVerifiedAt: new Date(),
    },
  });

  // Clean up existing demo project to make the seed script idempotent
  const existingProject = await db.project.findUnique({ where: { slug: "demo-web-app" } });
  if (existingProject) {
    await db.project.delete({ where: { id: existingProject.id } });
  }

  const project = await db.project.create({
    data: {
      name: "Demo Web App",
      slug: "demo-web-app",
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  const { hash } = generateApiKey();
  await db.apiKey.create({ data: { projectId: project.id, keyHash: hash, label: "seed" } });

  const sampleErrors = [
    { title: "TypeError: Cannot read properties of undefined", severity: "ERROR" as const, count: 42 },
    { title: "Payment webhook timeout", severity: "CRITICAL" as const, count: 3 },
    { title: "404 on /api/legacy-endpoint", severity: "WARNING" as const, count: 15 },
  ];

  for (const [i, err] of sampleErrors.entries()) {
    const group = await db.errorGroup.create({
      data: {
        projectId: project.id,
        fingerprint: `seed-${i}`,
        title: err.title,
        severity: err.severity,
        occurrenceCount: err.count,
      },
    });
    await db.errorEvent.create({
      data: {
        errorGroupId: group.id,
        message: err.title,
        url: "https://demo.app/checkout",
        browser: "Chrome 126",
      },
    });
  }

  console.log("Seeded demo user: demo@demo.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
