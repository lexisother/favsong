import template from './template.html';
import SimpleFMClient from '@solely/simple-fm';

interface OpReq {
	type: string;
	[key: string]: any;
}
export interface Env {
	FAVSONG_KV: KVNamespace;
}

const SFMClient = new SimpleFMClient('64346b97f7b9f6b97f29b37e3e1c521c');

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const defaultData = { song: {} };

		// const setCache = (key, data) => env.EXAMPLE_TODOS.put(key, data);
		// const getCache = (key) => env.EXAMPLE_TODOS.get(key);

		// async function getTodos(request) {
		// 	const ip = request.headers.get('CF-Connecting-IP');
		// 	const cacheKey = `data-${ip}`;
		// 	let data;
		// 	const cache = await getCache(cacheKey);
		// 	if (!cache) {
		// 		await setCache(cacheKey, JSON.stringify(defaultData));
		// 		data = defaultData;
		// 	} else {
		// 		data = JSON.parse(cache);
		// 	}
		//
		// 	const body = template.replace(
		// 		'$TODOS',
		// 		JSON.stringify(
		// 			data.todos?.map((todo) => ({
		// 				id: escapeHtml(todo.id),
		// 				name: escapeHtml(todo.name),
		// 				completed: !!todo.completed,
		// 			})) ?? []
		// 		)
		// 	);
		// 	return new Response(body, {
		// 		headers: { 'Content-Type': 'text/html' },
		// 	});
		// }

		// async function updateTodos(request) {
		// 	const body = await request.text();
		// 	const ip = request.headers.get('CF-Connecting-IP');
		// 	const cacheKey = `data-${ip}`;
		// 	try {
		// 		JSON.parse(body);
		// 		await setCache(cacheKey, body);
		// 		return new Response(body, { status: 200 });
		// 	} catch (err) {
		// 		return new Response(err, { status: 500 });
		// 	}
		// }
		//
		// if (request.method === 'PUT') {
		// 	return updateTodos(request);
		// }
		// if (request.headers) return getTodos(request);

		const ops: Record<string, Function> = {
			search: async (request: Request, body: OpReq) => {
				console.log('woa');
				const query = body.query;
				const data = await SFMClient.track.search({
					track: query,
				});
				return new Response(JSON.stringify(data), {
					headers: { 'Content-Type': 'application/json' },
				});
			},
		};

		function showUI(request: Request): Response {
			const body = template.replace('$FAVSONG', 'undefined');

			return new Response(body, {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		if (request.method === 'POST') {
			const body = await request.json<OpReq>();
			const op = ops[body.op];

			if (!op)
				return new Response('{"err": true, "text": "This operation isn\'t supported."}', {
					status: 500,
				});

			return await op(request, body);
		} else return showUI(request);
	},
};
