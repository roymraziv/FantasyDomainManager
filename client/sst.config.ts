/// <reference path="./.sst/platform/config.d.ts" />
import { Nextjs } from "sst/aws";

export default $config({
  app(input: { stage?: string }) {
    return {
      name: "fantasy-domain-frontend",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",  // Change if you want different region
        },
      },
    };
  },
  async run() {
    new Nextjs("Site", {
      path: ".",
      environment: {
        NEXT_PUBLIC_API_ENDPOINT: "https://api.fantasydomainmanager.com/",
        NEXT_PUBLIC_ENVIRONMENT: "Production",
      },
    });
  },
});
