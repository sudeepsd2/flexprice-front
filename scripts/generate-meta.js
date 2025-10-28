import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const versionId = execSync('git rev-parse HEAD').toString().trim();

const meta = { versionId };

const outPath = path.resolve(process.cwd(), 'public', 'meta.json');
fs.writeFileSync(outPath, JSON.stringify(meta));
console.log('Generated meta.json with versionId:', versionId);
