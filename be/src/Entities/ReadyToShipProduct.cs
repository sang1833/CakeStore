using cake_store_api.Enums;

namespace cake_store_api.Entities;

public class ReadyToShipProduct : Product
{
    public int StockQuantity { get; set; }
    public DateOnly? ExpiryDate { get; set; }

    public ReadyToShipProduct()
    {
        Type = ProductType.ReadyToShip;
    }
}
