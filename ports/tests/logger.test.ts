import { describe, expect, it } from "vitest";
import type { LogRecord, Logger } from "../logger";
import { StructuredLogger, createLogger, silentSink } from "../logger";

function captureLogger(): { logger: Logger; records: LogRecord[] } {
  const records: LogRecord[] = [];
  const logger = new StructuredLogger({ write: (r) => records.push(r) }, "test", "debug");
  return { logger, records };
}

describe("logger", () => {
  it("emits JSON-shaped records at info+", () => {
    const { logger, records } = captureLogger();
    logger.info("hello", { foo: 1 });
    expect(records).toHaveLength(1);
    expect(records[0]?.level).toBe("info");
    expect(records[0]?.msg).toBe("hello");
    expect(records[0]?.ctx?.foo).toBe(1);
    expect(records[0]?.ctx?.scope).toBe("test");
    expect(typeof records[0]?.ts).toBe("string");
  });
  it("suppresses below threshold", () => {
    const records: LogRecord[] = [];
    const logger = new StructuredLogger({ write: (r) => records.push(r) }, "thr", "info");
    logger.debug("d");
    logger.info("i");
    expect(records.map((r) => r.msg)).toEqual(["i"]);
  });
  it("child prefixes scope", () => {
    const { logger, records } = captureLogger();
    const child = logger.child("sub");
    child.warn("x");
    expect(records[0]?.ctx?.scope).toBe("test.sub");
  });
  it("error level routes through stderr-like path", () => {
    const lines: string[] = [];
    const orig = console.error;
    console.error = (l: string) => lines.push(l);
    try {
      const logger = createLogger({ scope: "e", level: "debug" });
      logger.error("boom");
      expect(lines).toHaveLength(1);
      const parsed = JSON.parse(lines[0] as string);
      expect(parsed.level).toBe("error");
      expect(parsed.msg).toBe("boom");
    } finally {
      console.error = orig;
    }
  });
  it("silentSink emits nothing", () => {
    const logger = new StructuredLogger(silentSink, "s", "debug");
    expect(() => {
      logger.info("noop");
      logger.error("noop");
    }).not.toThrow();
  });
});
