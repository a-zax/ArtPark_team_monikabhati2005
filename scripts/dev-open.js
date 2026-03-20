const { spawn, exec } = require('child_process');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args =
  process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'dev']
    : ['run', 'dev'];

const next = spawn(command, args, {
  stdio: 'inherit',
});

function tryOpen(retries = 30) {
  const http = require('http');
  const req = http.get(URL, () => {
    const openCommand =
      process.platform === 'win32'
        ? `start "" "${URL}"`
        : process.platform === 'darwin'
          ? `open "${URL}"`
          : `xdg-open "${URL}"`;

    exec(openCommand);
    console.log(`\n  Browser opened at ${URL}\n`);
  });

  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => tryOpen(retries - 1), 500);
    }
  });

  req.end();
}

setTimeout(() => tryOpen(), 2500);

next.on('close', (code) => process.exit(code ?? 0));
