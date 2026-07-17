"use server";

import { redirect } from "next/navigation";
import { getServerUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  PrismaProjectMemberRepository,
} from "@/server/repositories/prisma-project.repository";
import { RbacService } from "@/server/services/rbac.service";
import { EmailNotifier } from "@/server/notifiers/email.notifier";
import { SlackNotifier, CompositeNotifier } from "@/server/notifiers/slack.notifier";
import type { Role } from "@/server/domain/entities";
import type { MemberWithUser } from "@/server/domain/repositories";

export type { MemberWithUser };

export type AssignableRole = "ADMIN" | "MEMBER" | "VIEWER";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type InviteResult =
  | { ok: true; member: MemberWithUser }
  | { ok: false; error: string; noAccount?: true };

export async function inviteMemberAction(
  projectId: string,
  email: string,
  role: AssignableRole,
): Promise<InviteResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const rbac = new RbacService(memberRepo);

  try {
    await rbac.assertRole(projectId, userId, "ADMIN");
  } catch {
    return { ok: false, error: "You do not have permission to invite members." };
  }

  const target = await db.user.findUnique({ where: { email } });
  if (!target) {
    return { ok: false, error: "No account found for that email.", noAccount: true };
  }

  const existing = await memberRepo.getRole(projectId, target.id);
  if (existing) {
    return { ok: false, error: "This user is already a member of the project." };
  }

  try {
    await memberRepo.add(projectId, target.id, role as Role);
    const members = await memberRepo.listWithUserDetails(projectId);
    const added = members.find((m) => m.userId === target.id);
    if (!added) return { ok: false, error: "Failed to retrieve new member." };

    // Notification failure must not roll back the membership — it's the source of truth.
    const activeNotifiers = [];
    if (env.BREVO_API_KEY) {
      activeNotifiers.push(
        new EmailNotifier(
          env.BREVO_API_KEY,
          env.EMAIL_FROM ?? "alerts@errornest.dev",
          async () => []
        )
      );
    }
    if (env.SLACK_WEBHOOK_URL) {
      activeNotifiers.push(new SlackNotifier(env.SLACK_WEBHOOK_URL));
    }

    if (activeNotifiers.length > 0) {
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (project) {
        const notifier = new CompositeNotifier(activeNotifiers);
        notifier.notifyMemberInvited(project, target.email, role)
          .then(() => console.log("[inviteMember] notifications sent successfully to", target.email))
          .catch((err: unknown) => {
            console.error("[inviteMember] notification send failed:", err);
          });
      }
    }

    return { ok: true, member: added };
  } catch {
    return { ok: false, error: "Failed to add member. Please try again." };
  }
}

export async function updateMemberRoleAction(
  projectId: string,
  targetUserId: string,
  role: AssignableRole,
): Promise<ActionResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  if (userId === targetUserId) {
    return { ok: false, error: "You cannot change your own role." };
  }

  const memberRepo = new PrismaProjectMemberRepository();
  const rbac = new RbacService(memberRepo);

  try {
    await rbac.assertRole(projectId, userId, "ADMIN");
  } catch {
    return { ok: false, error: "You do not have permission to change roles." };
  }

  const allMembers = await memberRepo.listWithUserDetails(projectId);
  const owners = allMembers.filter((m) => m.role === "OWNER");
  const targetIsLastOwner =
    owners.length === 1 && owners[0]?.userId === targetUserId;

  if (targetIsLastOwner) {
    return { ok: false, error: "Cannot demote the last owner." };
  }

  try {
    await memberRepo.updateRole(projectId, targetUserId, role as Role);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update role. Please try again." };
  }
}

export async function removeMemberAction(
  projectId: string,
  targetUserId: string,
): Promise<ActionResult> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const rbac = new RbacService(memberRepo);

  try {
    await rbac.assertRole(projectId, userId, "OWNER");
  } catch {
    return { ok: false, error: "Only owners can remove members." };
  }

  const allMembers = await memberRepo.listWithUserDetails(projectId);
  const owners = allMembers.filter((m) => m.role === "OWNER");
  const targetIsLastOwner =
    owners.length === 1 && owners[0]?.userId === targetUserId;

  if (targetIsLastOwner) {
    return { ok: false, error: "Cannot remove the last owner." };
  }

  try {
    await memberRepo.remove(projectId, targetUserId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to remove member. Please try again." };
  }
}

export async function getTeamMembersAction(
  projectId: string,
): Promise<MemberWithUser[]> {
  const userId = await getServerUserId();
  if (!userId) redirect("/login");

  const memberRepo = new PrismaProjectMemberRepository();
  const role = await memberRepo.getRole(projectId, userId);
  if (!role) {
    throw new Error("Access denied");
  }

  return memberRepo.listWithUserDetails(projectId);
}

