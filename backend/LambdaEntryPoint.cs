using Amazon.Lambda.AspNetCoreServer;

namespace FantasyDomainManager;

/// <summary>
/// Lambda entry point for the ASP.NET Core application.
/// This class is used by AWS Lambda to bootstrap the application.
/// </summary>
public class LambdaEntryPoint : APIGatewayProxyFunction
{
    /// <summary>
    /// The builder has already registered the services from Program.cs
    /// Use this method to add any additional service configuration
    /// </summary>
    protected override void Init(IWebHostBuilder builder)
    {
        builder
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseLambdaServer();
    }
}

