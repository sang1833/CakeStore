using System.Text.Json.Serialization;
using cake_store_api.Enums;

namespace cake_store_api.Entities;

[JsonDerivedType(typeof(ReadyToShipProduct), typeDiscriminator: "ReadyToShip")]
[JsonDerivedType(typeof(MakeToOrderProduct), typeDiscriminator: "MakeToOrder")]
public abstract class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public ProductType Type { get; set; }
    public bool IsActive { get; set; } = true;
}
