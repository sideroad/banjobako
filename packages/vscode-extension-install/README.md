# vscode-extension-install

```
npm i --save-dev vscode-extension-install
```

# How to use
If you use VSCode, you can have recommend setting to install extension by preparing `.vscode/extensions.json` with recommendations attribute.

This tool enforce to install vscode extension by using extensions.json file

package.json
```
{
  ...
  "scripts": {
    "postinstall": "vscode-extension-install"
  }
  ...
}
```

