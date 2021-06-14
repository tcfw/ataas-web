<template>
	<div>
		<button class="btn sm secondary mb-5" @click="showAdd=true">Add Exchange</button>
		<table class="datatable">
			<thead>
				<tr>
					<th class="w-1/3">Exchange</th>
					<th class="w-1/3">Key</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="cred in exchanges" :key="cred.id">
					<td>{{cred.exchange}}</td>
					<td class="overflow-hidden overflow-ellipsis max-w-lg">{{cred.key}}</td>
					<td class="text-right">
						<button class="text-yellow-500 hover:text-yellow-400">Edit</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<Dialog :visible="showAdd" @bgClick="showAdd = !showAdd">
		<template v-slot:header>Add Exchange</template>
		<template v-slot:body>
			<div class="field">
				<label>Exchange</label>
				<Dropdown v-model="add.exchange" :options="{'binance.com': 'Binance', 'test': 'Test'}" placeholder="Select an exchange..." />
			</div>
			<div class="field">
				<label>Key</label>
				<input v-model="add.key" />
			</div>
			<div class="field">
				<label>Secret</label>
				<input v-model="add.secret" type="password" />
			</div>
		</template>
		<template v-slot:footer>
			<button class="ml-4 btn primary sm" @click="addCred">Add</button>
			<button class="btn sm" @click="showAdd = !showAdd">Cancel</button>
		</template>
	</Dialog>
</template>
<script>
import Dialog from '../../components/Dialog.vue';
import Dropdown from '../../components/Dropdown.vue';

export default {
	components: {
		Dialog,
		Dropdown
	},
	data() {
		return {
			exchanges: [],
			loading: true,
			showAdd: false,
			add: {
				exchange: "",
				key: "",
				secret: "",
			},
		}
	},
	created() {
		this.load()
	},
	methods: {
		addCred() {
			this.$http.post('/v1/excreds', this.add).then(d => {
				this.load()
				this.showAdd = false;
				this.resetAdd()
			}).catch(e => {
				alert(e)
			})
		},
		resetAdd() {
			this.add = {exchange: "", key: "", secret: ""};
		},
		load() {
			this.$http.get('/v1/excreds').then(d => {
				this.loading = false;
				this.exchanges = d.data.creds;
			}).catch(e => {
				alert(e)
			})
		}
	}
}
</script>