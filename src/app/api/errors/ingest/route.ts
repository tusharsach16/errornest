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

// Route stays thin: auth the key, validate the body, delegate to the service layer.
export async function POST(req: NextRequest) {
  try {
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

    const notifier = env.BREVO_API_KEY
      ? new EmailNotifier(env.BREVO_API_KEY, env.EMAIL_FROM ?? "alerts@errornest.dev", async (project) => {
          const owner = await db.user.findUnique({ where: { id: project.ownerId } });
          return owner ? [owner.email] : [];
        })
      : { notifyNewCriticalError: async () => {}, notifyMemberInvited: async () => {} };

    const service = new IngestionService(
      new PrismaErrorRepository(),
      new PrismaProjectRepository(),
      notifier
    );

    const group = await service.ingest(keyRecord.projectId, parsed.data);
    return NextResponse.json({ groupId: group.id, status: "accepted" }, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[ingest] unhandled error:", message, stack);
    return NextResponse.json({ error: "Internal error", detail: message }, { status: 500 });
  }
}
