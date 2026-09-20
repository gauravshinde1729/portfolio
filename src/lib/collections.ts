import { getCollection } from 'astro:content';
import { byDateDesc } from './format';

export async function getScribbles() {
  return (await getCollection('scribbles')).sort(byDateDesc);
}

export async function getResearch() {
  return (await getCollection('research')).sort(byDateDesc);
}

export async function getBlogPosts() {
  const posts = await getCollection('blog', ({ data }) => !import.meta.env.PROD || !data.draft);
  return posts.sort(byDateDesc);
}
