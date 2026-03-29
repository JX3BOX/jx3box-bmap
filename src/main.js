// 第三方UI组件
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@jx3box/jx3box-common/css/normalize.css";

import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
