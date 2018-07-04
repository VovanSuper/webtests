using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace WebApplication
{
   public class WebProgram
   {
      public static void MainStart(string[] args = null) =>
         CreateWebHostBuilder(args)
            .Build()
            .Run();

      public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
         new WebHostBuilder()
            .ConfigureLogging((hostingCtx, logger) =>
            {
               logger
                  .AddConfiguration(hostingCtx.Configuration.GetSection("Logging"))
                  .AddConsole(conf =>
                  {
                     conf.IncludeScopes = true;
                  })
                  .SetMinimumLevel(LogLevel.Information);
            })
            .UseKestrel()
            .UseStartup<Startup>()
            .UseUrls("http://*:8080");
   }
}
