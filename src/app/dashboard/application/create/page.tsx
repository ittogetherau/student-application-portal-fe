import NewForm from "./_components/new-form";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) => {
  const { id } = await searchParams;

  return (
    <main>
      <section className="mb-2">
        <h1 className="text-3xl font-semibold text-foreground">
          New Application
        </h1>
        <p className="text-muted-foreground">
          Complete each step to submit a new student application.
        </p>
      </section>

      <NewForm applicationId={id} />
    </main>
  );
};

export default page;
