// Source of truth: public/docs/resume.pdf. Erasable TypeScript only (no enums,
// no parameter properties): this file is imported by Node scripts that rely on
// native type stripping.

export interface ExperienceEntry {
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  location?: string;
  start: string;
  end: string;
  grade?: string;
  details?: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Achievement {
  date?: string;
  text: string;
}

export interface Resume {
  name: string;
  headline: string;
  summary: string;
  about: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  achievements: Achievement[];
}

export const resume: Resume = {
  name: 'Gaurav Shinde',
  headline: 'Software Engineer II',
  summary:
    'Software Engineer II at DeepIntent building Spring Boot and GraphQL APIs; pursuing an M.Tech in Artificial Intelligence at IIT Madras (2026 - 2028).',
  about: [
    'Software Engineer II at DeepIntent in Pune, designing GraphQL-based APIs with Spring Boot and building bulk edit operations across the UI and API layers of a DSP platform.',
    "Previously worked at Ideas Revenue Solutions, Altair and Sorceo Technologies, and won DeepIntent's Annual Company-Wide GenAI Hackathon (April 2025).",
    'Holds a B.E in Information Technology from PICT (Pune University) with a CGPA of 9.64, and is now pursuing an M.Tech in Artificial Intelligence at IIT Madras (2026 - 2028).',
  ],
  experience: [
    {
      role: 'Software Engineer II',
      company: 'DeepIntent',
      location: 'Pune',
      start: 'Feb 2025',
      end: 'Present',
      bullets: [
        'Exploring time-series forecasting models to efficiently predict impressions and budget metrics across large-scale clinical datasets.',
        'Designed and implemented GraphQL-based APIs with Spring Boot, leveraging DataLoader and BatchLoader patterns to optimize query performance and reduce redundant database calls.',
        'Architected and implemented comprehensive bulk edit operations across UI and API layers for DSP platform, enabling simultaneous updates to creative assets, budget allocations, frequency capping, audience targeting rules, conversion goals, unique reach settings, and ad group flight dates across multiple campaigns.',
        'Technology Stack: Spring Boot, GraphQL, MySQL,ClickHouse Docker, K8, React.js, Python',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'DeepIntent',
      location: 'Pune',
      start: 'April 2024',
      end: 'Jan 2025',
      bullets: [
        "Led a company-wide initiative to deprecate a legacy entity that had existed since the company's inception but was no longer valuable and often caused customer confusion. Conducted in-depth research, redesigned the functionality, and coordinated changes across 10+ repositories (UI, API, and data layers), successfully simplifying the system and deploying the solution to production.",
      ],
    },
    {
      role: 'Associate Software Engineer',
      company: 'Ideas Revenue Solutions',
      location: 'Pune',
      start: 'July 2023',
      end: 'March 2024',
      bullets: [
        'Worked on UI using vaadin for G3 (revenue optimization product) and its integration with the backend services.',
        'Technology Stack: Spring Boot, Vaadin, MySQL, Docker',
      ],
    },
    {
      role: 'Software Engineering Intern',
      company: 'Altair',
      location: 'Remote',
      start: 'Feb 2022',
      end: 'April 2023',
      bullets: [
        'Improved existing API to meet the platform SLA, maintained low response times, with an average API response under 20 milliseconds even under heavy concurrent loads.',
        'Achieved 40% reduction in build size compared to the previous Spring Boot implementation, leading to faster deployment and improved system efficiency.',
        'Authored new system design architecture for health monitoring systems to be implemented in existing products.',
        'Technology Stack used: Golang, Docker, Avro Schema, Node.js, React.js',
      ],
    },
    {
      role: 'Software Engineering Intern',
      company: 'Sorceo Technologies Pvt Ltd',
      location: 'Remote',
      start: 'Aug 2021',
      end: 'Nov 2021',
      bullets: [
        'Worked on building a Vendor Management System and Auction Platform.',
        'Implemented Scalable Backend API using Express.js, Node.js, MongoDB.',
        'Technology Stack used: React.js, Node.js, MongoDB',
      ],
    },
  ],
  education: [
    {
      institution: 'IIT Madras',
      degree: 'M.Tech in Artificial Intelligence',
      location: 'Chennai',
      start: '2026',
      end: '2028',
    },
    {
      institution: 'PICT (Pune University)',
      degree: 'B.E in Information Technology',
      location: 'Pune',
      start: '2019',
      end: '2023',
      grade: 'CGPA: 9.64',
    },
  ],
  skills: [
    { label: 'Programming Languages', items: ['Go', 'Java', 'Python'] },
    {
      label: 'Backend Engineering',
      items: ['Spring Boot', 'Gin', 'MySQL', 'Redis', 'Kubernetes', 'Docker'],
    },
    { label: 'Gen AI and LLM', items: ['LangChain', 'MCP Servers', 'ChromaDB', 'FAISS'] },
  ],
  achievements: [
    {
      date: 'April 2025',
      text: "Winner of DeepIntent's Annual Company-Wide GenAI Hackathon",
    },
    { date: 'Sept. 2020', text: 'Finalist PASCKATHON' },
    { date: '03/2021 - 04/2021', text: 'Finalist Rakuten India Hackathon' }
  ],
};
