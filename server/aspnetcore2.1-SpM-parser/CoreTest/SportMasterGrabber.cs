using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using HtmlAgilityPack;
using HtmlAgilityPack.CssSelectors.NetCore;

namespace CoreTest
{
   public class SportMasterGrabber: ISpGrabber
   {

      public IEnumerable<string> GetSportMasterPrices()
      {
         //Origin: https://www.sportmaster.ru
         //Referer: https://www.sportmaster.ru/catalog/muzhskaya_odezhda/shorty/?pageSize=120&page=2
         // Query: sortOrder=ASC&pageSize=120&sortBy=price
         //User-Agent: Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36

         var baseAddr = "https://www.sportmaster.ru";
         var muzOd = "muzhskaya_odezhda";
         var typeOd = "shorty";
         var page = 1;
         var pageSize = 120;

         var sportmasterUrl = new Uri($"{baseAddr}/catalog/{muzOd}/{typeOd}/?sortOrder=ASC&pageSize={pageSize}" +
             $"&page={page}&sortBy=price");

         var client = new HttpClient();
         var parser = new HtmlDocument();

         client.DefaultRequestHeaders.Referrer = new Uri(baseAddr);
         client.DefaultRequestHeaders.Add("Origin", sportmasterUrl.ToString());
         client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36");

         var html = client.GetStringAsync(sportmasterUrl).Result;

         parser.LoadHtml(html);
         var links = ExtractRealPriceValue(parser);

         Console.WriteLine("====");
         Console.WriteLine("Amount of Shorts: ");
         Console.WriteLine(links.Count());
         Console.WriteLine("======");
         return links;
      }

      private static IEnumerable<string> ExtractRealPriceValue(HtmlDocument document)
      {
         return document.QuerySelectorAll(".sm-category__item ").AsParallel()
             .Where(item => item.QuerySelectorAll(".smTileOldpriceBlock").SingleOrDefault() != null)
             .Select(n => n.QuerySelectorAll("[data-price]").SingleOrDefault())

             .Select(s => s.GetAttributeValue("data-price", String.Empty))
             .OrderBy(price => int.Parse(price))
             .Distinct();
      }
   }
}
