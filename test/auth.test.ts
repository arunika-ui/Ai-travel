import { describe, expect, it } from "vitest";
import { validatePassword } from "@/lib/trips/auth";

describe("validatePassword (FR-1.2)", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("ab1")).toMatch(/8 characters/);
  });
  it("rejects passwords with no letter", () => {
    expect(validatePassword("12345678")).toMatch(/letter/);
  });
  it("rejects passwords with no digit", () => {
    expect(validatePassword("abcdefgh")).toMatch(/digit/);
  });
  it("accepts a password with 8+ chars, a letter and a digit", () => {
    expect(validatePassword("abcd1234")).toBeNull();
  });
});
