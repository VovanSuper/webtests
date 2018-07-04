using System.Collections.Generic;
using System.Threading.Tasks;
using CoreTest.Models;

namespace CoreTest
{
   public interface ISpGrabber
    {
      Task<IEnumerable<Item>> GetItemsAsync();
    }
}
