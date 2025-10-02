import React from 'react';

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-black">
      {children}
    </div>
  );
}
