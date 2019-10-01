import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import path from 'path';

const PACKAGE_ROOT_PATH = process.cwd();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, 'package.json'));
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, PKG_JSON.module);
const OUTPUT_DIR = path.join(PACKAGE_ROOT_PATH, 'dist');
const babelConfig = require('./babel.config');

const ALL_MODULES = []
  .concat(Object.keys(PKG_JSON.dependencies || {}))
  .concat(Object.keys(PKG_JSON.peerDependencies || {}))
  .filter(dependency => dependency);

export default {
  input: INPUT_FILE,
  external: ALL_MODULES,
  name: PKG_JSON.name,
  output: {
    file: path.join(OUTPUT_DIR, `index.js`),
    format: 'cjs'
  },
  amd: {
    id: PKG_JSON.name
  },
  sourcemap: true,
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      ...babelConfig
    }),
    typescript({
      typescript: require('typescript')
    })
  ]
};
