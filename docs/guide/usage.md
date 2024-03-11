# Usage

Using the zoom and pan plugin is very simple. Once the plugin is [registered](./integration) zoom options provided to the chart will be used. In this example, scroll zoom is enabled.

<playground-project id="projectUsage"></playground-project>
<playground-preview project="projectUsage" style="height: 420px"></playground-preview>
<playground-file-editor project="projectUsage" style="height: max-content"></playground-file-editor>

<script setup>
import {onMounted} from 'vue';
import code from "./usage-example.js?raw";
import registerBundle from "../public/register.bundle.esm.js?raw";

onMounted(async () => {
  await import("playground-elements/playground-project.js");
  await import("playground-elements/playground-file-editor.js");
  await import("playground-elements/playground-preview.js");
  
  const projElem = document.querySelector('playground-project');
  projElem.config = {
    files: {
      'index.js': {
        content: code,
      },
      'index.html': {
        content: `<!doctype html>
          <body>
          <canvas></canvas>
          <button type="button">Reset zoom</button>
            <script type="module" src="./index.js">&lt;/script>
          </body>`.replace('&lt;', '<')
        ,
      },
      'register.js': {
        content: registerBundle
      },
    },
  };
})
</script>
