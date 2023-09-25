import { App, Plugin } from 'vue';
import Tooltip from './src/Tooltip.vue';

export const TooltipPlugin: Plugin = {
  install(app: App) {
    app.component('re-tooltip', Tooltip);
  },
};

export { Tooltip };