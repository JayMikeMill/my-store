#!/usr/bin/env node
const { execSync } = require("child_process");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node update-branch-from-main.js <front|back>");
  process.exit(1);
}

const target = args[0].toLowerCase();
let branchToUpdate;
let folderToDelete;

if (target === "front") {
  branchToUpdate = "gshop-front";
  folderToDelete = "backend"; // remove backend from frontend
} else if (target === "back") {
  branchToUpdate = "gshop-back";
  folderToDelete = "frontend"; // remove frontend from backend
} else {
  console.error("Invalid argument. Use 'front' or 'back'.");
  process.exit(1);
}

try {
  // Save current branch
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();

  // Checkout target branch
  console.log(`➡️ Checking out ${branchToUpdate}...`);
  execSync(`git checkout ${branchToUpdate}`, { stdio: "inherit" });

  // Merge main into the target branch
  console.log(`➡️ Merging main into ${branchToUpdate}...`);
  execSync(`git merge main --no-ff`, { stdio: "inherit" });

  // Remove folder that should never exist
  console.log(`🗑 Ensuring ${folderToDelete} folder does not exist...`);
  execSync(`git rm -r --ignore-unmatch ${folderToDelete}`, {
    stdio: "inherit",
  });

  // Commit folder removal if needed (allow empty in case nothing changed)
  console.log("✅ Committing folder cleanup...");
  execSync(
    `git commit -m "Update from main and remove ${folderToDelete} folder" --allow-empty`,
    { stdio: "inherit" }
  );

  // Push the branch to remote
  console.log(`🚀 Pushing ${branchToUpdate} to remote...`);
  execSync(`git push origin ${branchToUpdate}`, { stdio: "inherit" });

  // Return to original branch
  console.log(`➡️ Returning to ${currentBranch} branch...`);
  execSync(`git checkout ${currentBranch}`, { stdio: "inherit" });

  console.log(
    `🎉 ${branchToUpdate} is fully updated from main and pushed to remote.`
  );
} catch (err) {
  console.error("❌ Update failed:", err.message);
  process.exit(1);
}
