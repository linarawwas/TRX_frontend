type LogLevel = "debug" | "info" | "warn" | "error";

type LoggerOptions = {
  enabled?: boolean | (() => boolean);
};

function isAppDebugEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const search = String(window.location?.search || "");
  return (
    /(?:^|[?&])(debug|appDebug)=(1|true)(?:&|$)/i.test(search) ||
    localStorage.getItem("APP_DEBUG") === "1"
  );
}

function shouldLog(level: LogLevel, enabled?: LoggerOptions["enabled"]): boolean {
  if (level === "warn" || level === "error") {
    return true;
  }

  if (typeof enabled === "function") {
    return enabled();
  }

  if (typeof enabled === "boolean") {
    return enabled;
  }

  return isAppDebugEnabled();
}

function emit(level: LogLevel, scope: string, args: unknown[]) {
  const prefix = `[${scope}]`;
  if (level === "error") {
    console.error(prefix, ...args);
    return;
  }
  if (level === "warn") {
    console.warn(prefix, ...args);
    return;
  }
  if (level === "info") {
    console.info(prefix, ...args);
    return;
  }
  console.log(prefix, ...args);
}

export function createLogger(scope: string, options?: LoggerOptions) {
  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug", options?.enabled)) {
        emit("debug", scope, args);
      }
    },
    info: (...args: unknown[]) => {
      if (shouldLog("info", options?.enabled)) {
        emit("info", scope, args);
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn", options?.enabled)) {
        emit("warn", scope, args);
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog("error", options?.enabled)) {
        emit("error", scope, args);
      }
    },
  };
}

export const logger = createLogger("app");
