import api from '../../api';

export default {
	namespaced: true,
	state: () => ({
		remoteState: "loading",
		strategies: {},
	}),
	mutations: {
		remoteState(state, status) {
			state.remoteState = status;
		},
		set(state, strategies) {
			state.strategies = {};

			for (const [key, strategy] of Object.entries(strategies)) {
				state.strategies[strategy.id] = strategy;
			}
		},
		update(state, strategy) {
			state.strategies[strategy.id] = strategy;
		}
	},
	actions: {
		update({ commit }, block) {
			//axios save
			commit('update', block);
		},
		fetch({commit}) {
			commit('remoteState', 'loading');
			api.get('/v1/strategy').then(d => {
				commit('set', d.data.strategies);
				commit('remoteState', 'loaded');
			}).catch(e => {
				alert(e)
				commit('remoteState', 'failed');
			});
		},
	}
};