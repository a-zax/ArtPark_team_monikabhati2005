const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Removed .next cache successfully.');
} catch (error) {
  console.error('Failed to remove .next cache:', error);
  process.exit(1);
}
