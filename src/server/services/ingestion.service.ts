import type { IErrorRepository, IProjectRepository } from "../domain/repositories";
import type { INotifier } from "../notifiers/notifier.interface";
import type { IncomingErrorPayload } from "../domain/entities";
import { GroupingService } from "./grouping.service";

/**
 * Decides what to store when an error arrives. Depends only on interfaces
 * (IErrorRepository, IProjectRepository, INotifier) — never imports Prisma
 * or Resend directly, so it's unit-testable with in-memory fakes and the
 * concrete implementations can be swapped without touching this file.
 */
export class IngestionService {
  constructor(
    private errorRepo: IErrorRepository,
    private projectRepo: IProjectRepository,
    private notifier: INotifier,
    private grouping: GroupingService = new GroupingService()
  ) {}

  async ingest(projectId: string, payload: IncomingErrorPayload) {
    const fingerprint = this.grouping.fingerprint(payload);
    const existing = await this.errorRepo.findGroupByFingerprint(projectId, fingerprint);

    const group = existing
      ? await this.errorRepo.incrementGroup(existing.id)
      : await this.errorRepo.createGroup({
          projectId,
          fingerprint,
          title: this.grouping.titleFor(payload),
          severity: payload.severity ?? "ERROR",
        });

    await this.errorRepo.appendEvent({
      errorGroupId: group.id,
      message: payload.message,
      stackTrace: payload.stackTrace ?? null,
      browser: payload.browser ?? null,
      url: payload.url ?? null,
      userContext: payload.userContext ?? null,
    });

    // Only alert on the *first* occurrence of a new critical error, not
    // every single event, to avoid inbox flooding.
    if (!existing && group.severity === "CRITICAL") {
      const project = await this.projectRepo.findById(projectId);
      if (project) await this.notifier.notifyNewCriticalError(project, group);
    }

    return group;
  }
}
