import { spawnSync } from 'child_process';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import which from 'which';

const install = () => {
  const jsonPath = path.join(process.cwd(), '.vscode/extensions.json');
  which.sync('code');
  if (which.sync('code')) {
    if (existsSync(jsonPath)) {
      const jsonFile: string = readFileSync(jsonPath, 'utf-8');
      const json: {
        recommendations: string[];
      } = JSON.parse(jsonFile);

      const installed = spawnSync('code', ['--list-extensions'], {stdio: 'pipe', shell: true})
        .stdout.toString()
        .split(/\r?\n/g)
        .filter(extension => extension);

      (json.recommendations || []).forEach((lib: string) => {
        if (installed.find(ext => lib === ext)) {
          console.log(`# Extension already exists. skip install. [${lib}]`);
        } else {
          console.log(`# Installing vscode extensions... [${lib}]`);
          spawnSync('code', ['--install-extension', lib, '--force']);
        }
      });
    }
  } else {
    console.log(
      '# vscode command line (code) does not found. Skip to install vscode extensions'
    );
  }
};

install();
