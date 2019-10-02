import { spawnSync } from 'child_process';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import which from 'which';

const install = () => {
  const jsonPath = path.join(process.cwd(), '.vscode/extensions.json');
  which.sync('code');
  if (which.sync('code')) {
    if (existsSync(jsonPath)) {
      const jsonFile = readFileSync(jsonPath, 'utf-8');
      const json = JSON.parse(jsonFile);
      (json.recommendations || []).forEach((lib: string) => {
        console.log(`# Installing vscode extensions... [${lib}]`);
        spawnSync('code', ['--install-extension', lib, '--force']);
      });
    }
  } else {
    console.log(
      '# vscode command line (code) does not found. Skip to install vscode extensions'
    );
  }
};

install();
