import { createRouter, createWebHistory } from 'vue-router';
import Cookies from './helpers/cookies.js';
import Blocks from './pages/Blocks.vue';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';

const routes = [
	{path: "/login", name: 'login', component: Login},
	{path: "/blocks/:id?", name: 'blocks', component: Blocks},
	{path: "/", name: 'home', component: Home},
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