import { Book, FileText, Library, Disc, Youtube, Twitter, Linkedin } from "lucide-react";

export const NAV_LINKS = [
  { label: "Community", href: "/community" },
  { label: "Help", href: "/help" }, // Renamed from Enterprise
  { label: "Careers", href: "/careers" },
];

export const RESOURCES_MENU = {
  resources: [
    { title: "Documentation", href: "/docs", icon: Book },
    { title: "Blog", href: "/blog", icon: FileText },
    { title: "Library", href: "/gallery", icon: Library },
    // Status removed as requested
  ],
  community: [
    { title: "Discord", href: "https://discord.com", icon: Disc },
    { title: "YouTube", href: "https://youtube.com", icon: Youtube },
    { title: "Twitter/X", href: "https://x.com", icon: Twitter },
    { title: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ]
};

export const FOOTER_LINKS = [
  {
    title: "Product",
    links: ["Features", "Changelog", "Docs"]
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact"]
  },
  {
    title: "Support", 
    links: ["Help Center", "Privacy Policy", "Terms of Service"]
  }
];