import { App, Plugin } from 'vue';
import Badge from './src/Badge.vue';

export const BadgePlugin: Plugin = {
  install(app: App) {
    app.component('re-badge', Badge);
  },
};

export { Badge };