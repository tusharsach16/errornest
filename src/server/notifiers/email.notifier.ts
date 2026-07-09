import { Resend } from "resend";
import type { INotifier } from "./notifier.interface";
import type { ErrorGroup, Project } from "../domain/entities";

export class EmailNotifier implements INotifier {
  private resend: Resend;
  private fromAddress: string;
  private recipientResolver: (project: Project) => Promise<string[]>;

  constructor(apiKey: string, fromAddress: string, recipientResolver: (project: Project) => Promise<string[]>) {
    this.resend = new Resend(apiKey);
    this.fromAddress = fromAddress;
    this.recipientResolver = recipientResolver;
  }

  async notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void> {
    const recipients = await this.recipientResolver(project);
    if (recipients.length === 0) return;

    await this.resend.emails.send({
      from: this.fromAddress,
      to: recipients,
      subject: `[${project.name}] New critical error: ${group.title}`,
      text: `A new critical error was detected in ${project.name}.\n\n${group.title}\n\nFirst seen: ${group.firstSeenAt.toISOString()}`,
    });
  }
}
