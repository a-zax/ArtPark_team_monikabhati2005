const { spawn, exec } = require('child_process');
const http = require('http');
const readline = require('readline');

const DEFAULT_PORTS = [3000, 3001, 3002, 3003, 3004];

function openBrowser(url) {
  const openCommand =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

  exec(openCommand);
  console.log(`\n  Browser opened at ${url}\n`);
}

function canConnect(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function findRunningServer() {
  for (const port of DEFAULT_PORTS) {
    const url = `http://localhost:${port}`;
    if (await canConnect(url)) {
      return url;
    }
  }
  return null;
}

async function main() {
  const runningUrl = await findRunningServer();
  if (runningUrl) {
    console.log(`Detected an already running local server at ${runningUrl}.`);
    openBrowser(runningUrl);
    return;
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args =
    process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm run dev']
      : ['run', 'dev'];

  const next = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let opened = false;
  let sawReady = false;

  const handleLine = (line) => {
    process.stdout.write(`${line}\n`);

    const urlMatch = line.match(/Local:\s+(http:\/\/localhost:\d+)/i);
    if (urlMatch) {
      main.localUrl = urlMatch[1];
    }

    if (/ready in/i.test(line)) {
      sawReady = true;
    }

    if (!opened && sawReady && main.localUrl) {
      opened = true;
      openBrowser(main.localUrl);
    }
  };

  readline.createInterface({ input: next.stdout }).on('line', handleLine);
  readline.createInterface({ input: next.stderr }).on('line', handleLine);

  next.on('close', (code) => process.exit(code ?? 0));
  next.on('error', (error) => {
    console.error('Failed to start Next.js dev server:', error);
    process.exit(1);
  });
}

main.localUrl = null;
main();
