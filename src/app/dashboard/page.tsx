const DashboardPage = () => {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
        Overview
      </p>
      <h1 className="text-3xl font-semibold text-gray-900">Dashboard Home</h1>
      <p className="text-base text-gray-600">
        This area adapts based on the signed-in role. Use the sidebar to jump
        into your available tools.
      </p>
    </section>
  );
};

export default DashboardPage;
