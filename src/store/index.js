import { createStore } from 'vuex';
import blocks from './modules/blocks';
import orders from './modules/orders';
import strategies from './modules/strategies';

export function initStore() {
	return createStore({
		modules: {
			blocks,
			strategies,
			orders,
		}
	});
}