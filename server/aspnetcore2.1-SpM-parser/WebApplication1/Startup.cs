using CoreTest;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace WebApplication1
{
   public class Startup
   {
      // This method gets called by the runtime. Use this method to add services to the container.
      // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
      public void ConfigureServices(IServiceCollection services)
      {
         services
            .AddSingleton<ISpGrabber, SportMasterGrabber>()
            .AddRouting();
      }


      // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
      public void Configure(IApplicationBuilder app, IHostingEnvironment env)
      {
         if (env.IsDevelopment())
         {
            app.UseDeveloperExceptionPage();
         }
         app.UseRouter(router =>
         {
            router.MapGet("/", async (req, resp, routeData) =>
            {
               resp.StatusCode = 200;
               resp.Headers.Add("Content-Type", new Microsoft.Extensions.Primitives.StringValues("text/html"));
               var spGrabber = app.ApplicationServices.GetRequiredService<ISpGrabber>();
               var prices = spGrabber.GetSportMasterPrices();

               await resp.WriteAsync(@"Prices are: \n ");
               foreach (var item in prices)
               {
                  await resp.WriteAsync($"\n{item}");
               }
            });

         });

         //app.Run(async (context) =>
         //   {
         //      var spGrabber = app.ApplicationServices.GetRequiredService<ISpGrabber>();
         //      var prices = spGrabber.GetSportMasterPrices();

         //      await context.Response.WriteAsync(@"Prices are: \n ");
         //      foreach (var item in prices)
         //      {
         //         await context.Response.WriteAsync($"\n{item}");
         //      }
         //   });
      }
   }
}
