"use client";

import { useCallback, useEffect, useState } from "react";
import { Toast } from "@/components/Toast";
import type { ToastState } from "@/components/Toast";
import {
  updateMemberRoleAction,
  removeMemberAction,
  getTeamMembersAction,
} from "./actions";
import type { MemberWithUser, AssignableRole } from "./actions";
import { MemberTable } from "./components/MemberTable";
import { InviteForm } from "./components/InviteForm";

type ViewerRole = "OWNER" | "ADMIN";

interface Props {
  projectId: string;
  projectName: string;
  currentUserId: string;
  currentRole: ViewerRole;
  initialMembers: MemberWithUser[];
}

export function TeamClient({
  projectId,
  projectName,
  currentUserId,
  currentRole,
  initialMembers,
}: Props) {
  const [members, setMembers] = useState<MemberWithUser[]>(initialMembers);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const fresh = await getTeamMembersAction(projectId);
        setMembers((current) => {
          if (current.length !== fresh.length) {
            return fresh;
          }
          const currentSorted = [...current].sort((x, y) => x.id.localeCompare(y.id));
          const freshSorted = [...fresh].sort((x, y) => x.id.localeCompare(y.id));
          const isEqual = currentSorted.every((memberA, index) => {
            const memberB = freshSorted[index];
            return (
              memberB &&
              memberA.id === memberB.id &&
              memberA.projectId === memberB.projectId &&
              memberA.userId === memberB.userId &&
              memberA.role === memberB.role &&
              memberA.userName === memberB.userName &&
              memberA.userEmail === memberB.userEmail
            );
          });
          if (isEqual) {
            return current;
          }
          return fresh;
        });
      } catch {
      }
    };

    const intervalId = setInterval(checkAndFetch, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndFetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projectId]);

  const ownerCount = members.filter((m) => m.role === "OWNER").length;

  const handleRoleChange = useCallback(
    async (targetUserId: string, role: AssignableRole) => {
      const prev = members;
      setMembers((ms) =>
        ms.map((m) => (m.userId === targetUserId ? { ...m, role } : m)),
      );

      const result = await updateMemberRoleAction(projectId, targetUserId, role);

      if (!result.ok) {
        setMembers(prev);
        setToast({ message: result.error, variant: "error" });
        return;
      }
      setToast({ message: "Role updated", variant: "success" });
    },
    [projectId, members],
  );

  const handleRemove = useCallback(
    async (targetUserId: string) => {
      const prev = members;
      setMembers((ms) => ms.filter((m) => m.userId !== targetUserId));

      const result = await removeMemberAction(projectId, targetUserId);

      if (!result.ok) {
        setMembers(prev);
        setToast({ message: result.error, variant: "error" });
        return;
      }
      setToast({ message: "Member removed", variant: "success" });
    },
    [projectId, members],
  );

  const handleInviteSuccess = useCallback((member: MemberWithUser) => {
    setMembers((ms) => [...ms, member]);
    setToast({ message: `${member.userEmail} added to the project`, variant: "success" });
  }, []);

  return (
    <div className="mt-8 space-y-8 animate-hero" style={{ animationDelay: "60ms" }}>
      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Members
        </h2>
        <MemberTable
          members={members}
          ownerCount={ownerCount}
          currentUserId={currentUserId}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
          onToast={setToast}
        />
      </section>

      <section aria-labelledby="invite-heading" className="animate-hero" style={{ animationDelay: "120ms" }}>
        <h2 id="invite-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Invite a new member
        </h2>
        <InviteForm
          projectId={projectId}
          projectName={projectName}
          onSuccess={handleInviteSuccess}
          onToast={setToast}
        />
      </section>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
      )}
    </div>
  );
}
