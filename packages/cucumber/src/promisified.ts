import { promisify } from 'util';
import fs from 'fs';
import globber from 'glob';

export const glob = promisify(globber);

export const readFile = promisify(fs.readFile);
