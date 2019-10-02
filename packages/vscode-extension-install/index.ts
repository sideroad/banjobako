#! /usr/bin/env node

import { spawnSync } from 'child_process';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

const install = () => {
  const jsonPath = path.join(process.cwd(), '.vscode/extentions.json');
  if (existsSync) {
    const jsonFile = readFileSync(jsonPath, 'utf-8');
    const json = JSON.parse(jsonFile);
    (json.recommendations || []).forEach((lib: string) => {
      spawnSync('code', ['--install-extension', lib, '--force']);
    });
  }
};

install();
