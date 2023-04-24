import { boot } from 'quasar/wrappers';
import JsonViewer from 'vue3-json-viewer';

import 'vue3-json-viewer/dist/index.css';

export default boot(({ app }) => {
  app.use(JsonViewer);
});
