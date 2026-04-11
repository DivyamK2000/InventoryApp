import { Request, Response } from "express"; 
import pinoHttp from "pino-http";

export const httpLogger = pinoHttp({
    genReqId: (req: Request) => req.requestId,

    customLogLevel: (req: Request, res: Response, err) => {
        if(res.statusCode >= 500 || err) return "error";
        if(res.statusCode >= 400) return "warn";
        return "info";
    },

    customProps: (req: any) => ({
        ...(req.user?.id && { userId: req.user.id.toString() })
    }),

    customSuccessMessage: (req: Request, res: Response) => {
        const responseTime = (res as any).responseTime;
        return `Request completed in ${responseTime}ms`;
    }
});