/** T80: PhenoContracts structured logger. Zero-dep console wrapper emitting JSON records. */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
  readonly ts: string;
  readonly level: LogLevel;
  readonly msg: string;
  readonly ctx?: Readonly<Record<string, unknown>>;
  readonly err?: { name: string; message: string; stack?: string };
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  child(scope: string): Logger;
}

export interface LogSink {
  write(rec: LogRecord): void;
}

export const consoleSink: LogSink = {
  write(rec) {
    const line = JSON.stringify(rec);
    if (rec.level === "error" || rec.level === "warn") {
      console.error(line);
    } else {
      console.log(line);
    }
  },
};

export const silentSink: LogSink = { write: () => {} };

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class StructuredLogger implements Logger {
  private readonly minLevel: number;
  constructor(
    private readonly sink: LogSink,
    private readonly scope: string,
    minLevel: LogLevel = "info",
  ) {
    this.minLevel = LEVELS[minLevel];
  }
  debug(msg: string, ctx?: Record<string, unknown>): void {
    this.emit("debug", msg, ctx);
  }
  info(msg: string, ctx?: Record<string, unknown>): void {
    this.emit("info", msg, ctx);
  }
  warn(msg: string, ctx?: Record<string, unknown>): void {
    this.emit("warn", msg, ctx);
  }
  error(msg: string, ctx?: Record<string, unknown>): void {
    this.emit("error", msg, ctx);
  }
  child(scope: string): Logger {
    return new StructuredLogger(this.sink, `${this.scope}.${scope}`, this.levelName());
  }
  private levelName(): LogLevel {
    for (const [name, v] of Object.entries(LEVELS)) {
      if (v === this.minLevel) return name as LogLevel;
    }
    return "info";
  }
  private emit(level: LogLevel, msg: string, ctx?: Record<string, unknown>): void {
    if (LEVELS[level] < this.minLevel) return;
    const rec: LogRecord = {
      ts: new Date().toISOString(),
      level,
      msg,
      ctx: ctx ? { scope: this.scope, ...ctx } : { scope: this.scope },
    };
    this.sink.write(rec);
  }
}

export function createLogger(opts?: { sink?: LogSink; level?: LogLevel; scope?: string }): Logger {
  return new StructuredLogger(
    opts?.sink ?? consoleSink,
    opts?.scope ?? "phenocontracts",
    opts?.level ?? "info",
  );
}
