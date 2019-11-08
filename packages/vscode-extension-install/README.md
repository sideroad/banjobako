# vscode-extension-install

## Prerequisite
The machine should be installed vscode command line as `code`. otherwise skill process to install extension.

# How to use
VSCode can have setting to install extension by preparing `.vscode/extensions.json`.
This tool enforce to install vscode extension by using extensions.json file

.vscode/extensions.json
```
{
  "recommendations": [
      "dbaeumer.vscode-eslint", "shinnn.stylelint"
  ]
}
```

```
npm i --save-dev vscode-extension-install
```

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

# LICENSE
MIT
