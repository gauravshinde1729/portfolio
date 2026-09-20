import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { scribbleSchema, researchSchema, blogSchema } from './lib/schemas';

const loader = (dir: string) => glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${dir}` });

export const collections = {
  scribbles: defineCollection({ loader: loader('scribbles'), schema: scribbleSchema }),
  research: defineCollection({ loader: loader('research'), schema: researchSchema }),
  blog: defineCollection({ loader: loader('blog'), schema: blogSchema }),
};
