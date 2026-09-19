import {context,state,response,fail} from '@/lib/server';
export async function GET(req:Request){let c;try{c=await context(req);return response(await state(c),c)}catch(e){return fail(e,c)}}
