import { Suspense } from "react";

import { HealthDemoApp } from "@/components/health-demo-app";

export default function Page() {
  return (
    <Suspense>
      <HealthDemoApp />
    </Suspense>
  );
}
