using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CoreTest.Models;
using HtmlAgilityPack;
using HtmlAgilityPack.CssSelectors.NetCore;

namespace CoreTest
{
   public class SportMasterGrabber : ISpGrabber
   {
      public async Task<IEnumerable<Item>> GetItemsAsync()
      {
         //Origin: https://www.sportmaster.ru
         //Referer: https://www.sportmaster.ru/catalog/muzhskaya_odezhda/shorty/?pageSize=120&page=2
         var userAgent = @"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";

         var baseSPMAddr = "https://www.sportmaster.ru";
         var pageSize = 120;
         var muzOd = "muzhskaya_odezhda";

         var typeOd = "shorty";
         var pageNum = 1;
         var shortsSPMAddr = $"{baseSPMAddr}/catalog/{muzOd}/{typeOd}/?sortOrder=ASC&pageSize={pageSize}" +
            $"&page={pageNum}&sortBy=price";

         var allItems = new List<Item>(pageSize);
         var sportmasterUrl = new Uri(shortsSPMAddr);

         var client = new HttpClient();
         var parser = new HtmlDocument();

         client.DefaultRequestHeaders.Referrer = new Uri(baseSPMAddr);
         client.DefaultRequestHeaders.Add("Origin", sportmasterUrl.ToString());
         client.DefaultRequestHeaders.Add("User-Agent", userAgent);

         while (true)
         {
            var nextUrl = MakeSimpleUrlStr(baseSPMAddr, muzOd, typeOd, pageSize, pageNum);
            var itemsPerPage = await GetItemsPerPageAsync(parser, client, nextUrl);
            if (itemsPerPage.Count() == 0)
               break;

            allItems.AddRange(itemsPerPage);
            Console.WriteLine("====");
            Console.WriteLine($"Amount of Discounted Shorts at Page: {pageNum}");
            Console.WriteLine(itemsPerPage.Count());
            Console.WriteLine("======");
            pageNum++;
         }

         return allItems;
      }

      private async Task<IEnumerable<Item>> GetItemsPerPageAsync(HtmlDocument parser, HttpClient client, Uri uri)
      {
         var html = await client.GetStringAsync(uri);
         parser.LoadHtml(html);
         var itemPerCurrPage = GetItems(parser);
         return itemPerCurrPage;
      }

      private IEnumerable<Item> GetItems(HtmlDocument document) =>
         document.QuerySelectorAll(".sm-category__item ").AsParallel()
            .Where(item => item.QuerySelectorAll(".smTileOldpriceBlock").SingleOrDefault() != null)
            .Select(item => new Item
            {
               Name = item.QuerySelector("h2 > a").GetAttributeValue("title", "No name"),
               Discount = item.QuerySelector(".smTileOldpriceBlock > .smTileOldpriceBlock__discount")?.InnerText ?? "Not disccouted",
               OldPrice = item.QuerySelector(".smTileOldpriceBlock__oldprice sm-amount")?.GetAttributeValue("params", "No old price"),
               Price = int.Parse(item.QuerySelector(".sm-category__item-actual-price sm-amount").GetAttributeValue("params", "").Substring(7)),
               PhotoUrl = item.QuerySelector(".sm-category__item-photo > a.sm-image-holder > img").GetAttributeValue("src", ""),
               ItemUrl = item.QuerySelector(".sm-category__item-photo > a.sm-image-holder").GetAttributeValue("href", ""),
               Rating = item.QuerySelector(".sm-category__item-rating-stars")?.GetAttributeValue("title", "No Rating") ?? "No rating"
            })
            .OrderBy(item => item.Price);//.Distinct();

      private Uri MakeSimpleUrlStr(string baseSPMAddr, string muzOd, string typeOd, int pageSize, int pageNum) =>
         new Uri($"{baseSPMAddr}/catalog/{muzOd}/{typeOd}/?sortOrder=ASC&pageSize={pageSize}&sortBy=price&page={pageNum}");
   }
}
