import React from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
