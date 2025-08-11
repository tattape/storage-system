// PencilIcon.tsx
import * as React from "react";
export function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.862 3.487a2.07 2.07 0 0 1 2.927 2.927l-1.1 1.1-2.927-2.927 1.1-1.1zm-2.134 2.134l2.927 2.927-9.21 9.21a2 2 0 0 1-.707.464l-3.02 1.007a.5.5 0 0 1-.632-.632l1.007-3.02a2 2 0 0 1 .464-.707l9.171-9.249z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
