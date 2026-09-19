import {context,response,fail,checkOrigin,addMember} from '@/lib/server';
export async function POST(req:Request){let c;try{checkOrigin(req);c=await context(req);return response(await addMember(c,await req.json()),c)}catch(e){return fail(e,c)}}
