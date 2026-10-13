import { getDb } from '../../../db';
import { songs } from '../../../db/schema';
import { catalog } from '../../../lib/catalog';
export async function GET() {
 try { const db=getDb(); await db.insert(songs).values(catalog).onConflictDoNothing(); return Response.json({songs:await db.select().from(songs)}); }
 catch {return Response.json({error:'The catalog could not be loaded. Please try again.'},{status:503});}
}
