import type { ErrorGroup, Project } from "../domain/entities";

/**
 * Any alert channel implements this. notification.service.ts depends only
 * on this interface, so adding Slack/Discord/webhook alerts later is a new
 * class here — zero changes to existing code (Open/Closed principle).
 */
export interface INotifier {
  notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void>;
  notifyMemberInvited(project: Project, invitedUserEmail: string, role: string): Promise<void>;
}
