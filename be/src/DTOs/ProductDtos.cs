using cake_store_api.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Nodes;

namespace cake_store_api.DTOs;

public record CreateProductRequest(
    [Required] string Name,
    [Required] decimal Price,
    string? Description,
    string? ImageUrl,
    [Required] ProductType Type,
    // ReadyToShip specific
    int? StockQuantity,
    DateOnly? ExpiryDate,
    // MakeToOrder specific
    int? LeadTimeHours,
    string? CustomizationSchema // JSON string
);

public record UpdateProductRequest(
    string? Name,
    decimal? Price,
    string? Description,
    string? ImageUrl,
    // ReadyToShip specific
    int? StockQuantity,
    DateOnly? ExpiryDate,
    // MakeToOrder specific
    int? LeadTimeHours,
    string? CustomizationSchema // JSON string
);
