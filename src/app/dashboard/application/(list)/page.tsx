import { Suspense } from "react";

import ApplicationListPage from "./list-page";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <ApplicationListPage />
    </Suspense>
  );
};

export default Page;
