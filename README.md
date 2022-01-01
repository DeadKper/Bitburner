Forked from: https://github.com/SlyCedix/bitburner-typescript-template.git

## Extension Recommendations
[vscode-bitburner-connector](https://github.com/hexnaught/vscode-bitburner-connector) ([vscode extension marketplace](https://marketplace.visualstudio.com/items?itemName=hexnaught.vscode-bitburner-connector)) to upload your files into the game

[vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to use live linting in editor

[auto-snippet](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.auto-snippet) to automate inserting the file template in `.vscode/snippets.code-snippets`

## Dependencies
[Node.js](https://nodejs.org/en/download/) required for compiling typescript and installing dependencies

## Installation
```
git clone https://github.com/DeadKper/Bitburner.git
npm install
npm run defs
```

## How to use this template
The template is on it's own branch, download that template if you want to work from scratch

Write all your typescript source code in the `/src` directory

Ensure you are using absolute paths to .js files in your imports or else the game will not recognize your import paths.  
Example: use `import {} from '/lib/helpers.js'` instead of `import {} from './lib/helpers'` 

To autocompile as you save, run `npm run watch` in a terminal

To update your Netscript Definitions, run `npm run defs` in a terminal

Press F1 and Select `Bitburner: Enable File Watcher` to enable auto uploading to the game

If you run `watcher.js` in game, the game will automatically detect file changes and restart the associated scripts
