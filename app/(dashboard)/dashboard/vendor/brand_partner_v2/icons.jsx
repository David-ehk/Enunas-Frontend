/* global React */
// Inline stroke-based icons — 1.6 stroke, 16/18/20px, currentColor.
// Matches the Enunas storefront icon convention.

const Icon = ({ d, size = 16, fill = "none", children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  Dashboard: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></Icon>,
  Orders: (p) => <Icon {...p}><path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.8H6.5a2 2 0 0 1-2-1.8L3 7Z" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></Icon>,
  Box: (p) => <Icon {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></Icon>,
  Tag: (p) => <Icon {...p}><path d="M3 12 12 3h7v7l-9 9-7-7Z" /><circle cx="15.5" cy="7.5" r="1.2" /></Icon>,
  Users: (p) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="7" r="2.5" /><path d="M16 13a5 5 0 0 1 5.5 5" /></Icon>,
  Partners: (p) => <Icon {...p}><path d="M4 7l8-4 8 4-8 4-8-4Z" /><path d="M4 12l8 4 8-4" /><path d="M4 17l8 4 8-4" /></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Icon>,
  Wallet: (p) => <Icon {...p}><rect x="3" y="6" width="18" height="13" /><path d="M3 9h18" /><circle cx="17" cy="14" r="1.4" /></Icon>,
  Chart: (p) => <Icon {...p}><path d="M3 21V3" /><path d="M21 21H3" /><rect x="6" y="12" width="3" height="6" /><rect x="11" y="8" width="3" height="10" /><rect x="16" y="5" width="3" height="13" /></Icon>,
  Truck: (p) => <Icon {...p}><rect x="2" y="7" width="12" height="9" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></Icon>,
  Return: (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Icon>,
  Profile: (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>,
  Menu: (p) => <Icon {...p}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 4v16" /><path d="M4 12h16" /></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" /></Icon>,
  Download: (p) => <Icon {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Icon>,
  ChevronRight: (p) => <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>,
  ChevronLeft: (p) => <Icon {...p}><path d="m15 6-6 6 6 6" /></Icon>,
  ChevronsLeft: (p) => <Icon {...p}><path d="m11 6-6 6 6 6" /><path d="m19 6-6 6 6 6" /></Icon>,
  ChevronsRight: (p) => <Icon {...p}><path d="m13 6 6 6-6 6" /><path d="m5 6 6 6-6 6" /></Icon>,
  ArrowUp: (p) => <Icon {...p}><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></Icon>,
  ArrowDown: (p) => <Icon {...p}><path d="M12 5v14" /><path d="m5 12 7 7 7-7" /></Icon>,
  More: (p) => <Icon {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></Icon>,
  Check: (p) => <Icon {...p}><path d="m4 12 5 5 11-12" /></Icon>,
  X: (p) => <Icon {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></Icon>,
  External: (p) => <Icon {...p}><path d="M9 5h-4v14h14v-4" /><path d="M14 5h5v5" /><path d="m10 14 9-9" /></Icon>,
  Logout: (p) => <Icon {...p}><path d="M14 3h5v18h-5" /><path d="M10 8 4 12l6 4" /><path d="M4 12h12" /></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>,
  Mail: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" /><path d="m3 7 9 7 9-7" /></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" /><path d="M3 9h18" /><path d="M8 3v4" /><path d="M16 3v4" /></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 3 4 6v6c0 4.5 3.5 8.5 8 9 4.5-.5 8-4.5 8-9V6l-8-3Z" /></Icon>,
  Edit: (p) => <Icon {...p}><path d="M4 20h4l11-11-4-4L4 16v4Z" /></Icon>,
};

Object.assign(window, { Icon, Icons });
