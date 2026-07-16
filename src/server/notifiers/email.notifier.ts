import { BrevoClient } from "@getbrevo/brevo";
import type { INotifier } from "./notifier.interface";
import type { ErrorGroup, Project } from "../domain/entities";

export class EmailNotifier implements INotifier {
  private brevo: BrevoClient;
  private fromAddress: string;
  private recipientResolver: (project: Project) => Promise<string[]>;

  constructor(apiKey: string, fromAddress: string, recipientResolver: (project: Project) => Promise<string[]>) {
    this.brevo = new BrevoClient({ apiKey });
    this.fromAddress = fromAddress;
    this.recipientResolver = recipientResolver;
  }

  async notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void> {
    try {
      const recipients = await this.recipientResolver(project);
      if (recipients.length === 0) return;

      console.log(`[EmailNotifier] Sending critical error email via Brevo. Recipients:`, recipients);
      const response = await this.brevo.transactionalEmails.sendTransacEmail({
        sender: { email: this.fromAddress, name: "ErrorNest" },
        to: recipients.map((email) => ({ email })),
        subject: `[${project.name}] New critical error: ${group.title}`,
        textContent: `A new critical error was detected in ${project.name}.\n\n${group.title}\n\nFirst seen: ${group.firstSeenAt.toISOString()}`,
      });
      console.log(`[EmailNotifier] Brevo response for critical error:`, JSON.stringify(response, null, 2));
    } catch (err: unknown) {
      console.error("[EmailNotifier] Brevo critical error notification failed:", err);
    }
  }

  async notifyMemberInvited(project: Project, invitedUserEmail: string, role: string): Promise<void> {
    try {
      const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
      console.log(`[EmailNotifier] Sending invite email to ${invitedUserEmail} via Brevo`);
      const response = await this.brevo.transactionalEmails.sendTransacEmail({
        sender: { email: this.fromAddress, name: "ErrorNest" },
        to: [{ email: invitedUserEmail }],
        subject: `You've been added to ${project.name} on ErrorNest`,
        textContent: `Hi,\n\nYou've been added to the project "${project.name}" on ErrorNest as ${roleLabel}.\n\nVisit your project dashboard:\nhttps://errornest.app/projects/${project.id}\n\n— The ErrorNest team`,
      });
      console.log(`[EmailNotifier] Brevo response for invite:`, JSON.stringify(response, null, 2));
    } catch (err: unknown) {
      console.error("[EmailNotifier] Brevo member invite notification failed:", err);
    }
  }
}
