using System.Threading.Tasks;
using CoreTest;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;

namespace WebApplication
{
   public class Startup
   {
      public void ConfigureServices(IServiceCollection services) => services
            .AddSingleton<ISpGrabber, SportMasterGrabber>()
            .AddRouting();

      public void Configure(IApplicationBuilder app, IHostingEnvironment env) => app
            .UseRouter(router =>
               router
                  .MapGet("/", async (req, resp, routeData) =>
                     {
                        resp.StatusCode = 301;
                        await Task.Run(() => resp.Redirect("/api/items"));
                     })
                  .MapGet("/api/items", async (req, resp, routeData) =>
                     {
                        resp.StatusCode = 200;
                        resp.Headers.Add("Content-Type", new StringValues("application/json"));
                        var spGrabber = app.ApplicationServices.GetRequiredService<ISpGrabber>();
                        var items = await spGrabber.GetItemsAsync();
                        var json = JsonConvert.SerializeObject(items);
                        await resp.WriteAsync(json);
                     })
            );
   }
}
