
namespace CoreTest.Models
{
   public class Item
   {
      public string Name { get; internal set; }
      public int Price { get; internal set; }
      public string OldPrice { get; internal set; } = null;
      public string Rating { get; internal set; } = null;
      public string PhotoUrl { get; internal set; }
      public string ItemUrl { get; internal set; }
      public string Discount { get; internal set; } = null;
   }
}
