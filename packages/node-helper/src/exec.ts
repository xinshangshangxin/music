import { type SpawnOptions, spawn } from 'node:child_process';

async function exec({
  command,
  args,
  stdin,
  options,
}: {
  command: string;
  args?: string[];
  stdin?: string;
  options?: SpawnOptions;
}) {
  return new Promise<string>((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const spawnOptions = { timeout: 10 * 1000, ...options };

    let process;
    if (args) {
      process = spawn(command, args, spawnOptions);
    } else {
      process = spawn(command, spawnOptions);
    }

    if (stdin && process.stdin) {
      process.stdin.setDefaultEncoding('utf-8');
      process.stdin.write(stdin);
      process.stdin.end();
    }

    if (process.stdout) {
      process.stdout.setEncoding('utf-8');
      process.stdout.on('data', (data) => {
        stdout += data;
      });
    }

    if (process.stderr) {
      process.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    process.on('error', (e) => {
      console.warn(e);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.warn({ code, stderr, stdout });
        return reject(new Error(stderr));
      } else {
        return resolve(stdout.trim());
      }
    });
  });
}

export { exec };
