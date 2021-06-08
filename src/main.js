import moment from 'moment';
import { createApp } from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import api from './api';
import App from './App.vue';
import './main.scss';
import Router from './router.js';
import { initStore } from './store';

moment.updateLocale('en', {
	relativeTime: {
		future: "%s",
        past:   "%s ago",
        s  : '%d secs',
        ss : '%d secs',
        m:  "%d min",
        mm: "%d mins",
        h:  "1 hr",
        hh: "%d hrs",
        d:  "%d day",
        dd: "%d days",
        w:  "%d week",
        ww: "%d weeks",
        M:  "%d month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
	}
});

const app = createApp(App);

app.config.globalProperties.$http = api;
const store = initStore();

app.use(VueReCaptcha, { siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY, loaderOptions: { autoHideBadge: true } });
app.use(Router);
app.use(store);
app.mount('#app');

