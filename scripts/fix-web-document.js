const fs = require('node:fs');
const path = require('node:path');

const documentPath = path.join(process.cwd(), 'dist', 'index.html');
let html = fs.readFileSync(documentPath, 'utf8');

html = html.replace(
  /<meta name="viewport" content="[^"]*"\s*\/?>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
);

html = html.replace('</head>', `  <style id="ripple-root-canvas">
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background-color: #05030d;
    }
    html { min-height: 100%; overscroll-behavior-y: none; }
    body {
      min-height: 100vh;
      min-height: 100svh;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
      color: #ffffff;
    }
    #root {
      min-height: 100vh;
      min-height: 100svh;
      min-height: 100dvh;
      background-color: #05030d;
      isolation: isolate;
    }
  </style>
</head>`);

fs.writeFileSync(documentPath, html);
