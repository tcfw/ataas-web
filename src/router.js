import { createRouter, createWebHistory } from 'vue-router';
import Cookies from './helpers/cookies.js';
import Blocks from './pages/Blocks.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Settings from './pages/Settings.vue';
import SettingsExchanges from './pages/Settings/Exchanges.vue';
import SettingsHome from './pages/Settings/Home.vue';
import SettingsProfile from './pages/Settings/Profile.vue';
import SettingsSecurity from './pages/Settings/Security.vue';

const routes = [
	{path: "/login", name: 'login', component: Login},
	{path: "/blocks/:id?", name: 'blocks', component: Blocks, props: true},
	{path: "/", name: 'home', component: Home},
	{
		path: "/settings",
		name: 'settings',
		component: Settings,
		children: [
			{
				path: '',
				name: 'settings.home',
				component: SettingsHome
			},
			{
				path: 'profile',
				name: 'settings.profile',
				component: SettingsProfile
			},
			{
				path: 'security',
				name: 'settings.security',
				component: SettingsSecurity
			},
			{
				path: 'exchanges',
				name: 'settings.exchanges',
				component: SettingsExchanges
			}
		]
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

//Auth guard
router.beforeEach((to, from, next) => {
	let cookies = Cookies.get();
	let isAuthenticated = cookies.auth != undefined;

	if (to.name !== 'login' && !isAuthenticated) {
		next({ name: 'login' });
	} else {
		next();
	}
});

export default router;