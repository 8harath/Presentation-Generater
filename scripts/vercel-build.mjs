import { spawnSync } from "node:child_process";

const commands = [
  ["npx", ["prisma", "generate"]],
  ["npx", ["next", "build", "--turbo"]],
];

for (const [command, args] of commands) {
  const resolvedCommand = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(resolvedCommand, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
