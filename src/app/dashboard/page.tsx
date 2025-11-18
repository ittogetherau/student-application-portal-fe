const DashboardPage = () => {
  return (
    <section className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Overview
      </p>
      <h1 className="text-3xl font-semibold text-foreground">Dashboard Home</h1>
      <p className="text-base text-muted-foreground">
        This area adapts based on the signed-in role. Use the sidebar to jump
        into your available tools.
      </p>
    </section>
  );
};

export default DashboardPage;
