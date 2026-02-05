using cake_store_api.DTOs;
using cake_store_api.Interfaces;
using cake_store_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly IDeliveryEstimatorService _deliveryEstimator;

    public CartController(IDeliveryEstimatorService deliveryEstimator)
    {
        _deliveryEstimator = deliveryEstimator;
    }

    [HttpPost("validate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ValidateCartResponse>> ValidateCart([FromBody] ValidateCartRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            return BadRequest("Cart is empty");

        // Convert DTO to Tuple for service
        var serviceItems = request.Items
            .Select(i => (i.ProductId, i.Quantity))
            .ToList();

        DateOnly availableDate = await _deliveryEstimator.EstimateDeliveryDateAsync(serviceItems);

        // Simple check: In MVP, if Estimate returns a date, it means it's available (logic handles finding next available).
        // So IsSlotAvailable is generally true for the returned date.
        // Unless date exceeds horizon (e.g. > 30 days).
        
        bool available = availableDate <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));

        return Ok(new ValidateCartResponse(
            IsSlotAvailable: available,
            EarliestAvailableDate: availableDate,
            Message: available ? "Slot available" : "No slot available within 30 days"
        ));
    }
}
