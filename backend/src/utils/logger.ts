import pino from "pino";
import { logRunId } from "./logRun";
import path from "path";
import fs from "fs";

const isDev = process.env.NODE_ENV !== "production";

const baseDir = path.join(process.cwd(), "logs");

const infoDir = path.join(baseDir, "info");
const errorDir = path.join(baseDir, "error");

[infoDir, errorDir].forEach(dir => {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const infoFile = path.join(infoDir, `info-${logRunId}.json`);
const errorFile = path.join(errorDir, `error-warn-${logRunId}.json`);

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    transport: {
        targets: [
            ...(isDev ? [{
                target: "pino-pretty",
                options: { colorize: true },
                level: "info"
            }] : []),

            {
                target:  "pino/file",
                options: { destination: infoFile },
                level: "info"
            },

            {
                target: "pino/file",
                options: { destination: errorFile },
                level: "warn"
            }
        ]
    },

    base: {
        app: "Mera-Inventory"
    },

    timestamp: pino.stdTimeFunctions.isoTime
});