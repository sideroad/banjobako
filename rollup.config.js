import typescript from 'rollup-plugin-typescript2';
import reduxUnfetchPackage from './packages/redux-unfetch/package.json';
import withReduxStorePackage from './packages/with-redux-store/package.json';
console.log(Object.keys(reduxUnfetchPackage.dependencies));
export default [
  {
    input: 'packages/redux-unfetch/index.ts',
    output: [
      {
        file: 'packages/redux-unfetch/dist/index.js',
        format: 'cjs'
      }
    ],
    external: [
      ...Object.keys(reduxUnfetchPackage.dependencies || {}),
      ...Object.keys(reduxUnfetchPackage.peerDependencies || {})
    ],
    plugins: [
      typescript({
        typescript: require('typescript')
      })
    ]
  }
];
