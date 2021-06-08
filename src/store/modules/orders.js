import api from '../../api';

export default {
	namespaced: true,
	state: () => ({
		remoteStates: {},
		orders: {},
	}),
	mutations: {
		remoteState(state, {blockID, status}) {
			state.remoteStates[blockID] = status;
		},
		set(state, { blockID, orders }) {
			state.orders[blockID] = {};

			for (const [key, order] of Object.entries(orders)) {
				state.orders[blockID][order.id] = order;
			}
		},
	},
	actions: {
		fetch({commit}, blockID) {
			commit('remoteState', blockID, 'loading');

			return new Promise((resolve, reject) => {
				api.get('/v1/orders/' + blockID).then(d => {
					let orders = d.data.orders;
					commit('set', { blockID, orders });
					commit('remoteState', { blockID, status: 'loaded' });
					resolve(d.data.orders);
				}).catch(e => {
					reject(e);
					alert(e);
					commit('remoteState', blockID, 'failed');
				});
			});
		},
	}
};