import App from "./app.vue";
import { config } from "./config.js";
import { ReactiveDotPlugin } from "@reactive-dot/vue";
import { createApp } from "vue";

createApp(App).use(ReactiveDotPlugin, config).mount("#root");
