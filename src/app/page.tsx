import { Suspense } from "react";

import { Header } from "@/components/header";
import { HealthDemoApp } from "@/components/health-demo-app";

export default function Page() {
  return (
    <>
      <Header />
      <Suspense>
        <HealthDemoApp />
      </Suspense>
    </>
  );
}
