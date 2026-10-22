import { nanoid } from "nanoid";
import { AdminAuditEntry } from "@/lib/trips/types";
import { readData, updateData } from "@/lib/data/localDb";

/** FR-11.5: records every administrator action. */
export function logAdminAction(adminId: string, action: string, detail: string): void {
  const entry: AdminAuditEntry = { id: nanoid(8), adminId, action, detail, createdAt: new Date().toISOString() };
  updateData((data) => ({ ...data, adminAuditLog: [...data.adminAuditLog, entry] }));
}

export function listAdminAuditLog(): AdminAuditEntry[] {
  return readData().adminAuditLog.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
