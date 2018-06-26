using System;
using WebApplication;

namespace WebAppHost
{
   class Program
   {
      static void Main(string[] args)
      {
         Console.WriteLine("Starting the server...");
         WebProgram.MainStart();
         Console.ReadLine();
      }
   }
}
