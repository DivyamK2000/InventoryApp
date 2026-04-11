import { randomUUID } from "crypto";

export const logRunId = `${new Date().toISOString(). replace(/[:.]/g, "-")}_${randomUUID()}`;