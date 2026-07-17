import type { INotifier } from "./notifier.interface";
import type { ErrorGroup, Project } from "../domain/entities";

export class SlackNotifier implements INotifier {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void> {
    try {
      console.log(`[SlackNotifier] Sending critical error notification to Slack for project: ${project.name}`);
      const payload = {
        text: `🚨 *New Critical Error in Project: ${project.name}*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🚨 *New Critical Error in Project: ${project.name}*`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Error Title:*\n${group.title}`,
              },
              {
                type: "mrkdwn",
                text: `*Severity:*\n${group.severity}`,
              },
              {
                type: "mrkdwn",
                text: `*First Seen:*\n${group.firstSeenAt.toISOString()}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook returned status ${response.status}: ${await response.text()}`);
      }
      console.log(`[SlackNotifier] Slack critical error notification sent successfully.`);
    } catch (err: unknown) {
      console.error("[SlackNotifier] Slack critical error notification failed:", err);
    }
  }

  async notifyMemberInvited(project: Project, invitedUserEmail: string, role: string): Promise<void> {
    try {
      const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
      console.log(`[SlackNotifier] Sending member invited notification to Slack for project: ${project.name}`);
      const payload = {
        text: `👤 *New Team Member Added to ${project.name}*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `👤 *New Team Member Added*`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Project:*\n${project.name}`,
              },
              {
                type: "mrkdwn",
                text: `*User:*\n${invitedUserEmail}`,
              },
              {
                type: "mrkdwn",
                text: `*Role:*\n${roleLabel}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook returned status ${response.status}: ${await response.text()}`);
      }
      console.log(`[SlackNotifier] Slack member invite notification sent successfully.`);
    } catch (err: unknown) {
      console.error("[SlackNotifier] Slack member invite notification failed:", err);
    }
  }
}

export class CompositeNotifier implements INotifier {
  private notifiers: INotifier[];

  constructor(notifiers: INotifier[]) {
    this.notifiers = notifiers;
  }

  async notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void> {
    await Promise.all(
      this.notifiers.map((notifier) =>
        notifier.notifyNewCriticalError(project, group).catch((err: unknown) => {
          console.error("[CompositeNotifier] notifyNewCriticalError error caught:", err);
        })
      )
    );
  }

  async notifyMemberInvited(project: Project, invitedUserEmail: string, role: string): Promise<void> {
    await Promise.all(
      this.notifiers.map((notifier) =>
        notifier.notifyMemberInvited(project, invitedUserEmail, role).catch((err: unknown) => {
          console.error("[CompositeNotifier] notifyMemberInvited error caught:", err);
        })
      )
    );
  }
}
