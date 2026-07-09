import { describe, it, expect } from "vitest";
import { GroupingService } from "@/server/services/grouping.service";

describe("GroupingService", () => {
  const grouping = new GroupingService();

  it("produces the same fingerprint for errors that differ only by a dynamic id", () => {
    const a = grouping.fingerprint({ message: "User 123 not found", stackTrace: "at getUser (app.js:10)" });
    const b = grouping.fingerprint({ message: "User 456 not found", stackTrace: "at getUser (app.js:10)" });
    expect(a).toBe(b);
  });

  it("produces different fingerprints for genuinely different errors", () => {
    const a = grouping.fingerprint({ message: "User not found", stackTrace: "at getUser (app.js:10)" });
    const b = grouping.fingerprint({ message: "Payment failed", stackTrace: "at charge (billing.js:22)" });
    expect(a).not.toBe(b);
  });

  it("falls back gracefully when no stack trace is provided", () => {
    expect(() => grouping.fingerprint({ message: "Something broke" })).not.toThrow();
  });
});
