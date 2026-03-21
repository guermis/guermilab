export type BlockType = 'video' | 'image' | 'text' | 'quote';

export interface ContentBlock {
  id: string;
  type: BlockType;
  order: number;
  // video/image
  src?: string;
  alt?: string;
  caption?: string;
  // text
  heading?: string;
  body?: string;
  // quote
  quote?: string;
  author?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  year: string;
  category: string;
  thumbnail: string;
  heroImage: string;
  mainVideo?: string;
  // Narrative structure
  context: string;
  execution: string;
  result: string;
  // Block-based content
  blocks: ContentBlock[];
  // Meta
  client?: string;
  role?: string;
  duration?: string;
}
