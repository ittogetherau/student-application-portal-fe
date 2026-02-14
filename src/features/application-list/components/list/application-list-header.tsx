type ApplicationListHeaderProps = {
  heading: string;
  errorMessage?: string;
};

export default function ApplicationListHeader({
  heading,
  errorMessage,
}: ApplicationListHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {heading}
          </h1>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Error loading applications</p>
          <p className="mt-1 text-xs opacity-90">{errorMessage}</p>
        </div>
      ) : null}
    </>
  );
}
