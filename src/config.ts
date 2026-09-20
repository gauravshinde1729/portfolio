/** Placeholder until deployment is decided. This is the only place the site URL is defined. */
export const SITE_URL = 'https://gauravshinde.example';

export const SITE = {
  name: 'Gaurav Shinde',
  handle: 'gaurav',
  email: 'gauravshinde1816@gmail.com',
} as const;

export const LINKS = {
  github: 'https://github.com/gauravshinde1729',
  linkedin: 'https://www.linkedin.com/in/gauravshinde18/',
  leetcode: 'https://leetcode.com/u/gauravshinde1816/',
  email: `mailto:${SITE.email}`,
  resume: '/docs/resume.pdf',
  admissionLetter: '/docs/admission-letter.pdf',
} as const;

export const NAV = [
  { id: 'intro', label: 'intro' },
  { id: 'experience', label: 'exp' },
  { id: 'education', label: 'edu' },
  { id: 'scribbles', label: 'scribbles' },
  { id: 'research', label: 'research' },
  { id: 'achievements', label: 'awards' },
  { id: 'blog', label: 'blog' },
  { id: 'contact', label: 'contact' },
] as const;
