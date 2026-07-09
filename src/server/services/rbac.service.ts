import type { IProjectMemberRepository } from "../domain/repositories";
import type { Role } from "../domain/entities";

const ROLE_RANK: Record<Role, number> = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };

export class RbacService {
  constructor(private memberRepo: IProjectMemberRepository) {}

  /** Throws if the user's role in the project is below the required level.
   *  Called at the start of every mutating server action — never trust a
   *  role sent from the client. */
  async assertRole(projectId: string, userId: string, minRole: Role): Promise<void> {
    const role = await this.memberRepo.getRole(projectId, userId);
    if (!role || ROLE_RANK[role] < ROLE_RANK[minRole]) {
      throw new Error("Forbidden: insufficient project role");
    }
  }
}
