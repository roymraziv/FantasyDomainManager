/// <reference path="./.sst/platform/config.d.ts" />

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
    const { Nextjs } = await import("sst/aws");
    new Nextjs("Site", {
      path: ".",
      environment: {
        NEXT_PUBLIC_API_ENDPOINT: "https://api.fantasydomainmanager.com/",
        NEXT_PUBLIC_ENVIRONMENT: "Production",
      },
    });
  },
});
