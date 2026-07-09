import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectService } from "@/server/services/project.service";
import type {
  IProjectRepository,
  IProjectMemberRepository,
  IApiKeyRepository,
} from "@/server/domain/repositories";
import type { Project, ProjectMember } from "@/server/domain/entities";

// In-memory fakes — no database required (per architecture.md: services are
// testable with fakes because they depend on interfaces, not Prisma directly).

function makeProjectRepo(overrides: Partial<IProjectRepository> = {}): IProjectRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "proj-1",
      name: "Test App",
      slug: "test-app-abc12",
      ownerId: "user-1",
      createdAt: new Date(),
    } satisfies Project),
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    listForUser: vi.fn().mockResolvedValue([]),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMemberRepo(overrides: Partial<IProjectMemberRepository> = {}): IProjectMemberRepository {
  return {
    add: vi.fn().mockResolvedValue({
      id: "member-1",
      projectId: "proj-1",
      userId: "user-1",
      role: "OWNER",
    } satisfies ProjectMember),
    updateRole: vi.fn().mockResolvedValue({ id: "member-1", projectId: "proj-1", userId: "user-1", role: "ADMIN" }),
    getRole: vi.fn().mockResolvedValue("OWNER"),
    list: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeApiKeyRepo(overrides: Partial<IApiKeyRepository> = {}): IApiKeyRepository {
  return {
    create: vi.fn().mockResolvedValue({ id: "key-1" }),
    findByHash: vi.fn().mockResolvedValue(null),
    revoke: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("ProjectService.createProject", () => {
  let projectRepo: IProjectRepository;
  let memberRepo: IProjectMemberRepository;
  let apiKeyRepo: IApiKeyRepository;
  let service: ProjectService;

  beforeEach(() => {
    projectRepo = makeProjectRepo();
    memberRepo = makeMemberRepo();
    apiKeyRepo = makeApiKeyRepo();
    service = new ProjectService(projectRepo, memberRepo, apiKeyRepo);
  });

  it("returns the created project and a plaintext API key", async () => {
    const { project, apiKey } = await service.createProject("user-1", "Test App");
    expect(project.id).toBe("proj-1");
    expect(typeof apiKey).toBe("string");
    expect(apiKey.startsWith("en_")).toBe(true);
  });

  it("calls projectRepo.create with the correct ownerId", async () => {
    await service.createProject("user-1", "Test App");
    expect(projectRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "user-1", name: "Test App" }),
    );
  });

  it("adds the owner as OWNER in memberRepo", async () => {
    await service.createProject("user-1", "Test App");
    expect(memberRepo.add).toHaveBeenCalledWith("proj-1", "user-1", "OWNER");
  });

  it("stores a hashed (not plaintext) key in apiKeyRepo", async () => {
    const { apiKey } = await service.createProject("user-1", "Test App");
    const [, hashArg] = (apiKeyRepo.create as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      string,
      string?,
    ];
    // The stored hash must not equal the plaintext
    expect(hashArg).not.toBe(apiKey);
    expect(hashArg).toHaveLength(64); // sha256 hex digest
  });

  it("generates a slug derived from the project name", async () => {
    await service.createProject("user-1", "My Cool App");
    const callArg = ((projectRepo.create as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]) as {
      slug: string;
    };
    expect(callArg?.slug).toMatch(/^my-cool-app-/);
  });

  it("strips special characters from the slug", async () => {
    await service.createProject("user-1", "Hello!! World??");
    const callArg = ((projectRepo.create as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]) as {
      slug: string;
    };
    expect(callArg?.slug).toMatch(/^hello-world-/);
  });
});
