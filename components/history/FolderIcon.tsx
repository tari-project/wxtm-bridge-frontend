
import React from 'react';

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#A0A0A0"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-folder"
    {...props}
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

export default FolderIcon;
