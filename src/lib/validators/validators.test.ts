import { describe, it, expect } from "vitest";
import { createProjectSchema } from "@/lib/validators/project.validators";
import { signupSchema, loginSchema } from "@/lib/validators/auth.validators";

describe("createProjectSchema", () => {
  it("accepts a valid project name", () => {
    const result = createProjectSchema.safeParse({ name: "My App" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createProjectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });

  it("rejects a name longer than 60 characters", () => {
    const result = createProjectSchema.safeParse({ name: "a".repeat(61) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Name must be 60 characters or fewer",
    );
  });

  it("accepts exactly 60 characters", () => {
    const result = createProjectSchema.safeParse({ name: "a".repeat(60) });
    expect(result.success).toBe(true);
  });
});

describe("signupSchema", () => {
  const valid = { name: "Alice", email: "alice@example.com", password: "secret12" };

  it("accepts valid signup data", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty name", () => {
    const r = signupSchema.safeParse({ ...valid, name: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Name is required");
  });

  it("rejects an invalid email", () => {
    const r = signupSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Enter a valid email address");
  });

  it("rejects a password shorter than 8 characters", () => {
    const r = signupSchema.safeParse({ ...valid, password: "abc" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Password must be at least 8 characters");
  });

  it("rejects a password longer than 128 characters", () => {
    const r = signupSchema.safeParse({ ...valid, password: "a".repeat(129) });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "pass" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = loginSchema.safeParse({ email: "bad", password: "pass" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Enter a valid email address");
  });

  it("rejects an empty password", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Password is required");
  });
});
