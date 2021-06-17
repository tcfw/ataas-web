const localStorageRef = 'user_settings';

export default {
	namespaced: true,
	state: () => ({
		blocks: {
			allBlocks: false,
		},
		trades: {
			candleWidth: 10,
		}
	}),
	mutations: {
		init(state) {
			let localSettings = localStorage.getItem(localStorageRef);
			if (localSettings) {
				state = Object.assign(state, JSON.parse(localSettings));
			}
		},
		set(state, setting) {
			state = Object.assign(state, setting);
			localStorage.setItem(localStorageRef, JSON.stringify(state));
		},
	},
}