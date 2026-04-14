using Amazon.Lambda.AspNetCoreServer;

namespace FantasyDomainManager;

/// <summary>
/// Lambda entry point. Uses Startup so the host builder has a configured application (required for .NET 6+ minimal-style apps in Lambda).
/// </summary>
public class LambdaEntryPoint : APIGatewayProxyFunction
{
    protected override void Init(IWebHostBuilder builder)
    {
        builder
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseStartup<Startup>()
            .UseLambdaServer();
    }
}
