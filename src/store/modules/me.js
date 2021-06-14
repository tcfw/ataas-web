import api from '../../api';

export default {
	namespaced: true,
	state: () => ({
		remoteState: "loading",
		me: {},
	}),
	mutations: {
		remoteState(state, status) {
			state.remoteState = status;
		},
		set(state, me) {
			state.me = me ||{};
		},
	},
	actions: {
		fetch({ commit }) {
			commit('remoteState', 'loading');
			api.get('/v1/me').then(d => {
				commit('set', d.data || {});
				commit('remoteState', 'loaded');
			}).catch(e => {
				alert(e)
				commit('remoteState', 'failed');
			});
		}
	}
}