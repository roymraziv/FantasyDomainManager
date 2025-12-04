/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
      return {
        name: "fantasy-domain-frontend",
        removal: input?.stage === "production" ? "retain" : "remove",
        home: "aws",
        providers: {
          aws: {
            region: "us-east-1",
          },
        },
      };
    },
    async run() {
      new sst.aws.Nextjs("Site", {
        path: ".",
        environment: {
          NEXT_PUBLIC_API_URL: "https://api.fantasydomainmanager.com/",
          NEXT_PUBLIC_ENVIRONMENT: "Production",
        },
      });
    },
  });
