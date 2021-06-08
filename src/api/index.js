import axios from 'axios';

let baseURL = import.meta.env.VITE_API_ENDPOINT;
let headers = {
	"X-GOBBLE": "it-was-me.i-was-the-turkey"
};

const ax = axios.create({
	baseURL: baseURL,
	headers: headers,
	withCredentials: true,
});

getCSRF();

export function getCSRF() {
	ax.get('/v1/gw/csrf').then(d => {
		var exp = new Date();
		exp.setDate(exp.getDate() + 7);

		ax.defaults.headers['X-CSRF'] = d.data;
	});
}

export default ax;