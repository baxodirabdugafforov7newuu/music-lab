import MusicApp from './music-app';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user = await getChatGPTUser();
 return <MusicApp user={user ? {name:user.fullName || user.email.split('@')[0]} : null} />;
}
