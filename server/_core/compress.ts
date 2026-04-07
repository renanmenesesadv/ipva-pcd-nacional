import { createGzip } from "zlib";
import type { Request, Response, NextFunction } from "express";

export function compress() {
  return (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers["accept-encoding"] || "";
    if (!acceptEncoding.includes("gzip")) return next();

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    // Skip for small responses, streams, or already encoded
    const originalSend = res.send.bind(res);
    res.send = function (body: any) {
      if (typeof body === "string" && body.length > 1024 && !res.headersSent) {
        const gzip = createGzip();
        const chunks: Buffer[] = [];
        gzip.on("data", (chunk: Buffer) => chunks.push(chunk));
        gzip.on("end", () => {
          const compressed = Buffer.concat(chunks);
          res.setHeader("Content-Encoding", "gzip");
          res.setHeader("Content-Length", compressed.length);
          res.removeHeader("Content-Length");
          originalSend.call(res, compressed);
        });
        gzip.end(body);
        return res;
      }
      return originalSend.call(res, body);
    } as any;

    next();
  };
}
