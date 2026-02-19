export interface GuideNode {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  icon?: string;
  order: number;
  keywords: string[];
  children?: GuideNode[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  children?: NavItem[];
}

export interface GuideSection {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  section: string;
  keywords: string[];
}
