import { remove } from 'fs-extra';

async function cleanupFiles(path, cwd) {
  try {
    await remove(`${cwd}/${path}`);
  } catch (error) {
    console.log(`Could not clean up files. ${error}`);
  }
}

export default cleanupFiles;
