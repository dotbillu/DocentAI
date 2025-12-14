import { Book, FileText, Image as ImageIcon, Activity, Disc, Youtube, Twitter, Linkedin } from "lucide-react";

export const NAV_LINKS = [
  { label: "Community", href: "/community" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Careers", href: "/careers" },
  { label: "Pricing", href: "/pricing" },
];

export const RESOURCES_MENU = {
  resources: [
    { title: "Docs & Help Center", href: "/docs", icon: Book },
    { title: "Blog", href: "/blog", icon: FileText },
    { title: "Bolt Gallery", href: "/gallery", icon: ImageIcon },
    { title: "Status", href: "/status", icon: Activity },
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
    links: ["Features", "Pricing", "Enterprise", "Changelog", "Docs"]
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact", "Partners"]
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"]
  }
];