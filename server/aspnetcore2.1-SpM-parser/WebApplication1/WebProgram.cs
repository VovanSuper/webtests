using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace WebApplication
{
   public class WebProgram
   {
      public static void MainStart(string[] args = null)
      {
         //CreateWebHostBuilder(args).Build().Run();
         CreateWebHostBuilder(args).ConfigureLogging((hostingCtx, logger) =>
         {
            logger.AddConfiguration(hostingCtx.Configuration.GetSection("Logging"));
            logger.AddConsole();
         })
         .Build().Run();
      }

      public static IWebHostBuilder CreateWebHostBuilder(string[] args)
      {
         //return WebHost.CreateDefaultBuilder(args)
         //          .UseStartup<Startup>();
         return new WebHostBuilder()
            .UseKestrel()
            .UseStartup<Startup>()
            .UseUrls("http://*:8080");
      }
   }
}
