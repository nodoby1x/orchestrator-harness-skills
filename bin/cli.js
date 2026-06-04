#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'orchestrator-harness-skills';

function printHelp() {
  console.log(`
orchestrator-harness-skills — installer

Installs the "${SKILL_NAME}" Claude skill into your Claude skills directory.

Usage:
  npx orchestrator-harness-skills [options]

Options:
  -p, --project   Install into ./.claude/skills (this project only)
                  instead of ~/.claude/skills (all your projects).
  -h, --help      Show this help.

Default target: ~/.claude/skills/${SKILL_NAME}
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  if (typeof fs.cpSync !== 'function') {
    console.error('Error: Node.js 16.7 or newer is required (fs.cpSync is unavailable).');
    process.exit(1);
  }

  const projectMode = args.includes('-p') || args.includes('--project');

  const pkgRoot = path.resolve(__dirname, '..');
  const skillSrc = path.join(pkgRoot, 'skills', SKILL_NAME);

  if (!fs.existsSync(path.join(skillSrc, 'SKILL.md'))) {
    console.error('Error: could not find the bundled skill at ' + skillSrc);
    process.exit(1);
  }

  const baseDir = projectMode
    ? path.join(process.cwd(), '.claude', 'skills')
    : path.join(os.homedir(), '.claude', 'skills');
  const dest = path.join(baseDir, SKILL_NAME);

  try {
    fs.mkdirSync(baseDir, { recursive: true });
    fs.cpSync(skillSrc, dest, { recursive: true });
  } catch (err) {
    console.error('Error installing skill: ' + err.message);
    process.exit(1);
  }

  console.log('');
  console.log('  Installed "' + SKILL_NAME + '" skill');
  console.log('    -> ' + dest);
  console.log('');
  console.log('  Start a new Claude Code session and ask it to "orchestrate"');
  console.log('  or "act as orchestrator" to trigger the skill.');
  console.log('');
}

main();
