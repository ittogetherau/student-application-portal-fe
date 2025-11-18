import { ApplicationTable } from "@/components/dashboard/applications/application-table";

const AgentApplicationPage = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Applications</h1>

      <ApplicationTable />
    </section>
  );
};

export default AgentApplicationPage;
