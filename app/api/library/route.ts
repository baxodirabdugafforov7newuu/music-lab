import { and, eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { likes, songs } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { catalog } from '../../../lib/catalog';
export async function GET() {
 const user=await getChatGPTUser(); if(!user)return Response.json({error:'Sign in to view your library.'},{status:401});
 try { return Response.json({likes:(await getDb().select().from(likes).where(eq(likes.userId,user.userId))).map(x=>x.songId)}); }
 catch{return Response.json({error:'Could not load your library.'},{status:503});}
}
export async function POST(req:Request){
 const user=await getChatGPTUser(); if(!user)return Response.json({error:'Sign in to save songs.'},{status:401});
 try {const body=await req.json() as {songId:string;liked:boolean}; if(!catalog.some(s=>s.id===body.songId)||typeof body.liked!=='boolean')return Response.json({error:'Invalid song.'},{status:400});
 const db=getDb(); await db.insert(songs).values(catalog).onConflictDoNothing();
 if(body.liked)await db.insert(likes).values({userId:user.userId,songId:body.songId}).onConflictDoNothing();
 else await db.delete(likes).where(and(eq(likes.userId,user.userId),eq(likes.songId,body.songId)));
 return Response.json({ok:true}); }catch{return Response.json({error:'Could not save your change. Please try again.'},{status:503});}
}
