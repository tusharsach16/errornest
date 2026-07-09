import type { IProjectRepository, IApiKeyRepository, IProjectMemberRepository } from "../domain/repositories";
import { generateApiKey } from "@/lib/api-key";

export class ProjectService {
  constructor(
    private projectRepo: IProjectRepository,
    private memberRepo: IProjectMemberRepository,
    private apiKeyRepo: IApiKeyRepository
  ) {}

  async createProject(ownerId: string, name: string) {
    const slug = this.slugify(name);
    const project = await this.projectRepo.create({ name, slug, ownerId });
    await this.memberRepo.add(project.id, ownerId, "OWNER");
    const { plaintext, hash } = generateApiKey();
    await this.apiKeyRepo.create(project.id, hash, "default");

    // plaintext key is returned once — caller must show it to the user
    // immediately and never persist it unhashed.
    return { project, apiKey: plaintext };
  }

  private slugify(name: string): string {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${base}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
