
import PrintReportView from "@/components/projects/print-report-view";

export default async function PrintReportPage({ params, searchParams }: { params: { id: string, week: string }, searchParams: { reportId?: string }}) {
  const reportNumber = parseInt(params.week, 10);
  const reportId = searchParams.reportId;

  return (
    <PrintReportView projectId={params.id} reportNumber={reportNumber} reportId={reportId} />
  );
}
