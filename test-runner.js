#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Jest tests with TypeScript and ES module support...\n');

const jestPath = join(__dirname, 'node_modules', 'jest', 'bin', 'jest.js');
const args = process.argv.slice(2);

const child = spawn('node', ['--experimental-vm-modules', jestPath, ...args], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`\n🏁 Tests completed with exit code: ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('❌ Failed to start test runner:', error);
  process.exit(1);
});
