#!/usr/bin/env node
const { execSync } = require("child_process");

// NPM passes the first argument as process.argv[2] when run like "npm run prisma gen"
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: npm run prisma <gen|push-force|push-reset>");
  process.exit(1);
}

const command = args[0];

try {
  if (command === "gen") {
    execSync("npx prisma generate", { cwd: "backend", stdio: "inherit" });
  } else if (command === "push-force") {
    execSync("npx prisma push --force", { cwd: "backend", stdio: "inherit" });
  } else if (command === "push-reset") {
    execSync("npx prisma push --force --reset", {
      cwd: "backend",
      stdio: "inherit",
    });
  } else {
    console.error(
      "Invalid command. Only 'gen', 'push-force', or 'push-reset' allowed."
    );
    process.exit(1);
  }

  // Always run your post-type-gen
  execSync("node ./scripts/post-typegen.js", { stdio: "inherit" });

  console.log("\n✅ Prisma command complete and post-type-gen ran!");
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
