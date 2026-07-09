import { db } from "@/lib/db";
import type { IApiKeyRepository } from "../domain/repositories";

export class PrismaApiKeyRepository implements IApiKeyRepository {
  async create(projectId: string, hashedKey: string, label = "default") {
    return db.apiKey.create({
      data: { projectId, keyHash: hashedKey, label },
      select: { id: true },
    });
  }

  async findByHash(hashedKey: string) {
    return db.apiKey.findUnique({
      where: { keyHash: hashedKey },
      select: { projectId: true, revokedAt: true },
    });
  }

  async revoke(id: string) {
    await db.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  }
}
