import { rand } from "./utils";
import registerBundle from "../public/register.bundle.esm.js?raw";
import utilsBundle from "../public/utils.bundle.esm.js?raw";
import styles from "../public/sample-styles.css?raw";

export async function setupSample(code, {height = '450px'} = {}) {
  await import("playground-elements/playground-project.js");
  await import("playground-elements/playground-file-editor.js");
  await import("playground-elements/playground-preview.js");
  const projectElem = document.createElement('playground-project');
  projectElem.id = `project-${rand(-10000000, 1000000)}`;
  const previewElem = document.createElement('playground-preview');
  previewElem.project = projectElem.id;
  previewElem.style.height = height;
  const editorElem = document.createElement('playground-file-editor');
  editorElem.project = projectElem.id;
  projectElem.config = {
    files: {
      'index.js': {
        content: code.replaceAll('../../scripts/', './')
          .replaceAll('../scripts/', './'),
      },
      'index.html': {
        content: `<!DOCTYPE html>
          <head>
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>
            <canvas></canvas>
            <script type="module" src="./index.js">&lt;/script>
          </body>`.replace('&lt;', '<')
        ,
      },
      'register.js': {
        content: registerBundle
      },
      'utils.js': {
        content: utilsBundle
      },
      'styles.css': {
        content: styles
      },
    },
  };
  document.querySelector('[data-sample-holder]')?.append(projectElem, previewElem, editorElem);
}
