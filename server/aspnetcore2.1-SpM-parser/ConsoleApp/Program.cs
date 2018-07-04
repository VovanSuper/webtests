using System;
using CoreTest;

namespace ConsoleApp
{
   class Program
   {
      static void Main(string[] args)
      {
         var items = (new SportMasterGrabber().GetItemsAsync()).Result;
         //Console.WriteLine("{0,-20} {1,5}\n", "Name", "New Price");
         foreach (var item in items)
         {
            Console.WriteLine($"Item :   {item.Name}  --  {item.Price} ");
         }
         Console.WriteLine("Done");
         Console.ReadKey();
      }
   }
}
