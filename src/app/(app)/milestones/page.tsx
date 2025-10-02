'use client';

import PageHeader from '@/components/page-header';
import MilestoneActions from '@/components/milestones/milestone-actions';
import MilestoneList from '@/components/milestones/milestone-list';

export default function MilestonesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Milestones"
        description="Manage predefined project milestones for all project types."
      >
        <MilestoneActions />
      </PageHeader>
      <MilestoneList />
    </div>
  );
}
