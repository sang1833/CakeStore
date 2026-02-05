using System.ComponentModel.DataAnnotations;

namespace cake_store_api.Entities;

public class ProductionSlot
{
    [Key]
    public DateOnly Date { get; set; } // PK
    public int MaxCapacity { get; set; }
    public int ReservedCapacity { get; set; }


}
