const { spawn, exec } = require('child_process');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

// Start Next.js dev server
const next = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// Wait for the server to be ready, then open browser
function tryOpen(retries = 20) {
  const http = require('http');
  const req = http.get(URL, () => {
    // Server is up - open the browser
    const cmd = process.platform === 'win32'
      ? `start ${URL}`
      : process.platform === 'darwin'
        ? `open ${URL}`
        : `xdg-open ${URL}`;
    exec(cmd);
    console.log(`\n  Browser opened at ${URL}\n`);
  });

  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => tryOpen(retries - 1), 500);
    }
  });

  req.end();
}

// Start polling after 2s head start
setTimeout(() => tryOpen(), 2000);

next.on('close', (code) => process.exit(code));
