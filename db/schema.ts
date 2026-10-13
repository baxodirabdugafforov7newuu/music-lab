import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const songs = sqliteTable('songs', {id:text('id').primaryKey(),title:text('title').notNull(),artist:text('artist').notNull(),genre:text('genre').notNull(),duration:integer('duration').notNull(),audio:text('audio').notNull(),cover:text('cover').notNull()});
export const likes = sqliteTable('likes', {userId:text('user_id').notNull(),songId:text('song_id').notNull().references(()=>songs.id)}, t=>[primaryKey({columns:[t.userId,t.songId]})]);
