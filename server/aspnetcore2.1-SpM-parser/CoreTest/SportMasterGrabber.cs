using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using HtmlAgilityPack;
using HtmlAgilityPack.CssSelectors.NetCore;

namespace CoreTest
{
   public class SportMasterGrabber : ISpGrabber
   {
      private int[] res;

      public IEnumerable<int> GetSportMasterPrices()
      {
         //Origin: https://www.sportmaster.ru
         //Referer: https://www.sportmaster.ru/catalog/muzhskaya_odezhda/shorty/?pageSize=120&page=2
         // Query: sortOrder=ASC&pageSize=120&sortBy=price
         //User-Agent: Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36

         var baseSPMAddr = "https://www.sportmaster.ru";
         var pageSize = 120;
         var muzOd = "muzhskaya_odezhda";
         var typeOd = "shorty";
         var pageNum = 1;
         var shortsSPMAddr = $"{baseSPMAddr}/catalog/{muzOd}/{typeOd}/?sortOrder=ASC&pageSize={pageSize}" +
            $"&page={pageNum}&sortBy=price";

         var allPrices = new List<int>(pageSize);
         var sportmasterUrl = new Uri(shortsSPMAddr);

         var client = new HttpClient();
         var parser = new HtmlDocument();

         client.DefaultRequestHeaders.Referrer = new Uri(baseSPMAddr);
         client.DefaultRequestHeaders.Add("Origin", sportmasterUrl.ToString());
         client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36");

         while (true)
         {
            var nextUrl = ConstructSimpleUrlStirng(baseSPMAddr, muzOd, typeOd, pageSize, pageNum);
            var pricesPerPage = GetPricesPerPage(parser, client, nextUrl);
            if (pricesPerPage.Count() == 0)
               break;

            allPrices.AddRange(pricesPerPage);
            Console.WriteLine("====");
            Console.WriteLine($"Amount of Discounted Shorts at Page: {pageNum}");
            Console.WriteLine(pricesPerPage.Count());
            Console.WriteLine("======");
            pageNum++;
         }

         return allPrices;

      }

      private IEnumerable<int> GetPricesPerPage(HtmlDocument parser, HttpClient client, Uri uri)
      {
         var html = client.GetStringAsync(uri).Result;
         parser.LoadHtml(html);
         var pricesPerCurrPage = ExtractRealPriceValue(parser);
         return pricesPerCurrPage;
      }

      private IEnumerable<int> ExtractRealPriceValue(HtmlDocument document) =>
         document.QuerySelectorAll(".sm-category__item ").AsParallel()
            .Where(item => item.QuerySelectorAll(".smTileOldpriceBlock").SingleOrDefault() != null)
            .Select(n => n.QuerySelectorAll("[data-price]").SingleOrDefault())
            .Select(s => s.GetAttributeValue("data-price", String.Empty))
            .Select(priceStr => int.Parse(priceStr))
            .OrderBy(price => price);
            //.Distinct();


      private Uri ConstructSimpleUrlStirng(string baseSPMAddr, string muzOd, string typeOd, int pageSize, int pageNum)
      {
         var locUri = $"{baseSPMAddr}/catalog/{muzOd}/{typeOd}/?sortOrder=ASC&pageSize={pageSize}" +
            $"&page={pageNum}&sortBy=price";

         return new Uri(locUri);
      }
   }
}
