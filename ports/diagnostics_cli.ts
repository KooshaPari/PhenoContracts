/** T80: PhenoContracts diagnostics CLI — `bun run diagnostics` or `node ports/diagnostics_cli.ts`. */
import { defaultVerifiers, reportHealth, runDiagnostics } from "./diagnostics";
import { createLogger } from "./logger";

const SAMPLE_CONTRACTS = [
  { name: "add_overflow", predicate: "forall x:i32. x + 1 > x", target: "add" },
  { name: "nonnegative_inc", predicate: "x >= 0 -> x + 1 >= 0", target: "inc" },
];

async function main(): Promise<void> {
  const logger = createLogger({ scope: "cli", level: "info" });
  const verifiers = defaultVerifiers(logger);
  logger.info("cli.boot", { contracts: SAMPLE_CONTRACTS.length, backends: verifiers.length });
  const report = await runDiagnostics(SAMPLE_CONTRACTS, verifiers, logger);
  const health = reportHealth(verifiers);
  logger.info("cli.summary", report.summary);
  console.log(JSON.stringify({ report, health }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ level: "error", msg: "cli.fail", err: String(err) }));
  process.exit(1);
});
