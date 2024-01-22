import template from './template.html';
import SimpleFMClient from '@solely/simple-fm';
import { TrackType } from '@solely/simple-fm/dist/typings/index';

type Song = TrackType & {
	mbid: string;
	listeners: number;
};

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
		const setSong = (data: Song) => env.FAVSONG_KV.put('song', JSON.stringify(data));
		const getSong = () => env.FAVSONG_KV.get('song');

		const ops: Record<string, Function> = {
			getCurrentSong: async (request: Request, body: OpReq) => {
				let data = await getSong();
				return new Response(data, {
					headers: { 'Content-Type': 'application/json' },
				});
			},
			search: async (request: Request, body: OpReq) => {
				const query = body.query;
				const data = await SFMClient.track.search({
					track: query,
				});
				return new Response(JSON.stringify(data), {
					headers: { 'Content-Type': 'application/json' },
				});
			},
			save: async (request: Request, body: OpReq) => {
				const data = {};
				await setSong(body.song);
				return new Response(JSON.stringify(data), {
					headers: { 'Content-Type': 'application/json' },
				});
			},
		};

		async function showUI(request: Request): Promise<Response> {
			let body = template;
			const song = await getSong();
			if (song) body = template.replace('$FAVSONG', `JSON.parse(${song})`);
			else body = template.replace('$FAVSONG', undefined);

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
