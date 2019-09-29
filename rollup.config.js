import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'packages/redux-unfetch/index.ts',
    output: [
      {
        file: 'packages/redux-unfetch/dist/index.js',
        format: 'cjs'
      }
    ],
    external: [],
    plugins: [
      typescript({
        typescript: require('typescript')
      })
    ]
  },
  {
    input: 'packages/with-redux-store/index.jsx',
    output: [
      {
        file: 'packages/with-redux-store/dist/index.js',
        format: 'cjs'
      }
    ],
    external: ['react'],
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      typescript({
        typescript: require('typescript')
      })
    ]
  }
];
