using System.Text.Json.Nodes;

using cake_store_api.Enums;

namespace cake_store_api.Entities;

public class MakeToOrderProduct : Product
{
    public int LeadTimeHours { get; set; }
    
    // JSONB: Schema definition for allowed customizations (size, flavor options, etc.)
    public JsonNode? CustomizationSchema { get; set; }

    public MakeToOrderProduct()
    {
        Type = ProductType.MakeToOrder;
    }
}
