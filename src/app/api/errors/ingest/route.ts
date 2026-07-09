import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/api-key";
import { incomingErrorSchema } from "@/lib/validators/error.validators";
import { IngestionService } from "@/server/services/ingestion.service";
import { PrismaErrorRepository } from "@/server/repositories/prisma-error.repository";
import { PrismaProjectRepository } from "@/server/repositories/prisma-project.repository";
import { EmailNotifier } from "@/server/notifiers/email.notifier";
import { checkRateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

// Route stays thin: auth the key, validate the body, delegate to the
// service layer. No business logic lives here.
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const keyRecord = await db.apiKey.findUnique({ where: { keyHash: hashApiKey(apiKey) } });
  if (!keyRecord || keyRecord.revokedAt) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`ingest:${keyRecord.projectId}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = incomingErrorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const service = new IngestionService(
    new PrismaErrorRepository(),
    new PrismaProjectRepository(),
    new EmailNotifier(env.RESEND_API_KEY ?? "", env.EMAIL_FROM ?? "alerts@errornest.dev", async (project) => {
      const owner = await db.user.findUnique({ where: { id: project.ownerId } });
      return owner ? [owner.email] : [];
    })
  );

  const group = await service.ingest(keyRecord.projectId, parsed.data);
  return NextResponse.json({ groupId: group.id, status: "accepted" }, { status: 202 });
}
