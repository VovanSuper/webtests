using System;
using CoreTest;
//using CoreTest;

namespace ConsoleApp
{
   class Program
   {
      static void Main(string[] args)
      {
         var links = new SportMasterGrabber().GetSportMasterPrices();
         foreach (var link in links)
         {
            Console.WriteLine(link);
         }
         Console.WriteLine("Done");
         Console.ReadKey();
      }
   }
}
