<template>
	<form @submit.prevent="submit">
		<div class="field">
			<label>Exchange</label>
			<Dropdown v-model="exchange" :options="{'binance.com': 'Binance'}" placeholder="Select an exchange..." />
		</div>
		<template v-if="exchange!=''">
			<div class="field">
				<label>Market</label>
				<Dropdown v-model="market" :options="groupedSymbols" placeholder="Select a market..." />
			</div>
			<template v-if="market!=''">
				<div class="field">
					<label>Block Size ({{symbolLocal}})</label>
					<input type="currency" v-model="blockSize" />
				</div>
			</template>
		</template>
		<h3 class="border-b border-gray-300 pb-2 mt-7 text-gray-500">Strategy</h3>
		<div class="field">
			<label>Schedule</label>
			<!-- <small class="text-gray-400">(e.g. '5h', '35m', '1h 30m')</small> -->
			<!-- <input v-model="duration" /> -->
			<div class="flex flex-row">
				<Counter class="mr-6" label="h" v-model="calcDuration.h" :max="200" />
				<Counter class="mr-6" label="m" v-model="calcDuration.m" />
				<Counter label="s" v-model="calcDuration.s" />
			</div>
		</div>
		<div class="field">
			<label>Algorithm</label>
			<Dropdown :options="{Basic: {'MeanLog': 'Sum Log'}, Code: {JSRuntime: 'Javascript'}}" v-model="algo" />
		</div>
		<template v-if="algo=='MeanLog'">
			<h3 class="border-b border-gray-300 pb-2 mt-7 text-gray-500">Sum Log</h3>
			<img class="m-auto my-5 w-40 h-auto" src="../assets/mean_log.svg" />
			<div class="field">
				<label>Trade Timeframe <small class="text-gray-400">(e.g. '5h', '35m', '1h 30m')</small></label>
				<input v-model="meanLog.duration" />
			</div>
			<div class="field">
				<label>Buy Threshold <small class="text-gray-400">(if T >= x)</small></label>
				<input v-model="meanLog.buy" />
			</div>
			<div class="field">
				<label>Stay Threshold <small class="text-gray-400">(if T >= x)</small></label>
				<input v-model="meanLog.stay" />
			</div>
		</template>
		<template v-if="algo == 'JSRuntime'">
			<prism-editor class="code-editor" v-model="js.code" :highlight="highlighter" line-numbers></prism-editor>
		</template>
	</form>
</template>
<script>
import {symbols} from '../helpers/symbols';
import _ from 'lodash';
import Dropdown from '../components/Dropdown.vue';
import Counter from '../components/Counter.vue';

import { PrismEditor } from 'vue-prism-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default {
	components: {
		PrismEditor,
		Dropdown,
		Counter,
	},
	data() {
		return {
			exchange: "",
			market: "",
			blockSize:"",
			algo: "",
			duration: 3600000000000,
			meanLog: {
				duration: "30m",
				buy: "0.001",
				stay: "0",
			},
			calcDuration: {
				h: 1,
				m: 0,
				s: 0,
			},
			js: {
				code: "let tr = GetTrades('binance.com', 'ADAAUD', '5m');\nvar last = 0;\nvar sum = 0.0;\n\ntr.forEach(trade => {\n\tif (last == 0) {\n\t\tlast = trade.Amount; \n\t\treturn;\n\t}\n\tsum += math.log10(trade.Amount/last);\n\tlast = trade.Amount;\n});\n\nif (sum >=0.001) {\n\treturn BUY;\n} else if (sum >=0) {\n\treturn STAY;\n}\nreturn SELL;",
			}
		}
	},
	computed: {
		groupedSymbols() {
			if (!this.exchange || this.exchange=="") return {};

			let v = _.groupBy(symbols[this.exchange], 'local')
			v = _.mapValues(v, (group) => {
				let f = _.map(group, (symb) => {
					return symb.split;
				})
				return _.mapKeys(f, (v,k) => {
					return v.replace('/', '')
				})
			})
			return v;
		},
		symbolLocal() {
			if (this.market=="") return "";
			return symbols[this.exchange][this.market].local;
		}
	},
	emits: ['submitted'],
	watch: {
		calcDuration: {
			handler(v) {
				this.calculateDuration()
			},
			deep: true,
		}
	},
	methods: {
		calculateDuration() {
			let s = this.calcDuration.s
			s += this.calcDuration.m * 60
			s += this.calcDuration.h * 60 * 60
			this.duration = s * 1000000000
		},
		highlighter(code) {
		return highlight(code, languages.js); // languages.<insert language> to return html with markup
		},
		submit() {
			let params = {};

			switch (this.algo) {
			case 'MeanLog':
				params = this.meanLog
			break;
			case 'JSRuntime':
				params = this.js
			}

			let strategy = {
				market: this.exchange,
				instrument: this.market,
				strategy: this.algo,
				params: params,
				duration: this.duration,
			}

			let block = {
				market: this.exchange,
				instrument: this.market,
				purchase: this.blockSize,
				backoutPercentage: 0.05,
			}

			this.$store.dispatch('strategies/new', {strategy}).then(resp => {
				block.strategy_id = resp.data.strategy.id
				this.$store.dispatch('blocks/new', block).then(block => {
					this.$emit('submitted', block.data)
				})
			}).catch(e => {
				alert(e);
			})
		}
	},
}
</script>
<style lang="scss" scoped>
.code-editor {
	@apply w-full h-72 border border-gray-400 py-1 rounded bg-gray-700 text-white font-mono;
}
</style>