import api from '../../api';
import { symbols } from '../../helpers/symbols';

export default {
	namespaced: true,
	state: () => ({
		remoteState: "loading",
		blocks: {},
	}),
	mutations: {
		remoteState(state, status) {
			state.remoteState = status;
		},
		set(state, blocks) {
			state.blocks = {};

			for (const [key, block] of Object.entries(blocks)) {
				block.instrumentInfo = symbols[block.market][block.instrument];
				state.blocks[block.id] = block;
			}
		},
		update(state, block) {
			state.blocks[block.id] = block;
		}
	},
	getters: {
		withStrategy: (state, g, root) => {
			let blocks = state.blocks;

			for (const [id, block] of Object.entries(blocks)) {
				if (!block || !block.strategy_id) continue;
				blocks[id].strategy = root.strategies.strategies[block.strategy_id];
			}

			return blocks;
		},
		notEnded: state => {
			let blocks = {};

			for (const [id, block] of Object.entries(state.blocks)) {
				if (block.state != 'ENDED') blocks[id] = block;
			}

			return blocks;
		},
		notEndedWithStrategy: (state, getters, root) => {
			let blocks = getters.notEnded;

			for (const [id, block] of Object.entries(blocks)) {
				if (!block || !block.strategy_id) continue;
				blocks[id].strategy = root.strategies.strategies[block.strategy_id];
			}

			return blocks;
		}
	},
	actions: {
		update({ commit }, block) {
			//axios save
			commit('update', block);
		},
		fetch({commit}) {
			commit('remoteState', 'loading');
			api.get('/v1/blocks').then(d => {
				commit('set', d.data.blocks || {});
				commit('remoteState', 'loaded');
			}).catch(e => {
				alert(e)
				commit('remoteState', 'failed');
			});
		},
	}
};