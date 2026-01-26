import React from "react";
import clsx from "clsx";
import ContainerLayout from "./container-layout";

interface TwoColumnLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  reversed?: boolean;
  sticky?: boolean;
  className?: string;
  mainClassName?: string;
  sidebarClassName?: string;
  isEqual?: boolean;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  children,
  sidebar,
  reversed = false,
  sticky = true,
  className = "",
  mainClassName = "",
  sidebarClassName = "",
  isEqual = false,
}) => {
  const stickyClass = sticky
    ? "h-fit md:sticky md:top-8 md:right-0 w-full"
    : "";

  const mainBaseCols = isEqual
    ? "md:col-span-2 xl:col-span-4"
    : "md:col-span-3 xl:col-span-7";

  const sidebarBaseCols = isEqual
    ? "md:col-span-2 xl:col-span-4"
    : "md:col-span-1 xl:col-span-2";

  const MainSection = (
    <section className={clsx(mainBaseCols, mainClassName)}>
      <div className={stickyClass}>{children}</div>
    </section>
  );

  const SidebarSection = (
    <aside className={clsx(sidebarBaseCols, sidebarClassName)}>
      <div className={stickyClass}>{sidebar}</div>
    </aside>
  );

  return (
    <ContainerLayout
      className={clsx(
        "grid grid-cols-1 md:grid-cols-4 xl:grid-cols-9 gap-4 gap-y-10 relative",
        className
      )}
    >
      {reversed ? (
        <>
          {SidebarSection}
          {MainSection}
        </>
      ) : (
        <>
          {MainSection}
          {SidebarSection}
        </>
      )}
    </ContainerLayout>
  );
};

export default TwoColumnLayout;
