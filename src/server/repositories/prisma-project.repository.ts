import { db } from "@/lib/db";
import type { IProjectRepository, IProjectMemberRepository } from "../domain/repositories";
import type { Role } from "../domain/entities";

export class PrismaProjectRepository implements IProjectRepository {
  async create(input: { name: string; slug: string; ownerId: string }) {
    return db.project.create({ data: input });
  }

  async findById(id: string) {
    return db.project.findFirst({ where: { id, deletedAt: null } });
  }

  async findBySlug(slug: string) {
    return db.project.findFirst({ where: { slug, deletedAt: null } });
  }

  async listForUser(userId: string) {
    return db.project.findMany({
      where: {
        deletedAt: null,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async softDelete(id: string) {
    await db.project.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export class PrismaProjectMemberRepository implements IProjectMemberRepository {
  async add(projectId: string, userId: string, role: Role) {
    return db.projectMember.create({ data: { projectId, userId, role } });
  }

  async updateRole(projectId: string, userId: string, role: Role) {
    return db.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
    });
  }

  async getRole(projectId: string, userId: string): Promise<Role | null> {
    const member = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return (member?.role as Role) ?? null;
  }

  async list(projectId: string) {
    return db.projectMember.findMany({ where: { projectId } });
  }
}
