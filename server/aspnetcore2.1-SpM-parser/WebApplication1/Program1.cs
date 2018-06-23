using Microsoft.AspNetCore.Hosting;

namespace WebApplication1
{
   public class Program1
   {
      public static void MainStart(string[] args = null)
      {
         //CreateWebHostBuilder(args).Build().Run();
         CreateWebHostBuilder(args).Build().Run();
      }

      public static IWebHostBuilder CreateWebHostBuilder(string[] args)
      {
         //return WebHost.CreateDefaultBuilder(args)
         //          .UseStartup<Startup>();
         return new WebHostBuilder().UseKestrel().UseStartup<Startup>().UseUrls("http://*:8080");

         //return new WebHostBuilder().UseStartup<Startup>();
      }
   }
}
