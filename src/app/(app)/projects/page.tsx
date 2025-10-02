import PageHeader from "@/components/page-header";
import ProjectActions from "@/components/projects/project-actions";
import ProjectList from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Oversee all ongoing and completed projects."
      >
        <ProjectActions />
      </PageHeader>
      <ProjectList />
    </div>
  );
}
