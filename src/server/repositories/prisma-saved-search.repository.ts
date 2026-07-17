import { db } from "@/lib/db";
import type { ISavedSearchRepository } from "../domain/repositories";
import type { SavedSearch } from "../domain/entities";

export class PrismaSavedSearchRepository implements ISavedSearchRepository {
  async create(input: { projectId: string; userId: string; name: string; filters: any }): Promise<SavedSearch> {
    const row = await db.savedSearch.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        name: input.name,
        filters: input.filters,
      },
    });
    return {
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      name: row.name,
      filters: row.filters,
      createdAt: row.createdAt,
    };
  }

  async list(projectId: string, userId: string): Promise<SavedSearch[]> {
    const rows = await db.savedSearch.findMany({
      where: { projectId, userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      name: row.name,
      filters: row.filters,
      createdAt: row.createdAt,
    }));
  }

  async findById(id: string): Promise<SavedSearch | null> {
    const row = await db.savedSearch.findUnique({
      where: { id },
    });
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      name: row.name,
      filters: row.filters,
      createdAt: row.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await db.savedSearch.delete({
      where: { id },
    });
  }
}
