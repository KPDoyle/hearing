import {context,state,response,fail} from '@/lib/server';
import {env} from '@/lib/runtime-env';
export async function GET(req:Request){let c;if(!env.DB)return response({runtime:'browser-demo'});try{c=await context(req);return response(await state(c),c)}catch(e){return fail(e,c)}}
