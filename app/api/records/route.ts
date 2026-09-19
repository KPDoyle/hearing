import {context,writeRecord,response,fail,checkOrigin} from '@/lib/server';
export async function POST(req:Request){let c;try{checkOrigin(req);c=await context(req);const text=await req.text();if(text.length>30000)return response({error:'This record is too large.'},c,413);return response(await writeRecord(c,JSON.parse(text)),c)}catch(e){return fail(e,c)}}
