import { createStore } from 'vuex';
import blocks from './modules/blocks';
import me from './modules/me';
import orders from './modules/orders';
import strategies from './modules/strategies';
import user_settings from './modules/user_settings';

export function initStore() {
	return createStore({
		modules: {
			blocks,
			strategies,
			orders,
			me,
			user_settings,
		}
	});
}