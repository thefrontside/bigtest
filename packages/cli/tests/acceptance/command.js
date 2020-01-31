import path from 'path';
import { exec } from 'child_process';
import { WritableStream } from 'memory-streams';

export default async function bigtest(args) {
  let bin = path.join(__dirname, './bin');
  let stdout = new WritableStream();
  let stderr = new WritableStream();

  await new Promise((resolve, reject) => {
    let process = exec(`${bin} ${args}`);
    process.stdout.pipe(stdout);
    process.stderr.pipe(stderr);
    process.once('error', reject);
    process.once('close', resolve);
  });

  return { stdout, stderr };
}
