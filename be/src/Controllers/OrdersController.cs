using cake_store_api.DTOs;
using cake_store_api.Entities;
using cake_store_api.Interfaces;
using cake_store_api.Services;
using cake_store_api.Enums;
using cake_store_api.Mappings;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(ProblemDetails))] // Inventory exception
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CreateOrderResponse>> PlaceOrder([FromBody] CreateOrderRequest request)
    {
        var result = await _orderService.PlaceOrderAsync(request);
        return CreatedAtAction(nameof(PlaceOrder), new { id = result.OrderId }, result);
    }

    [HttpPost("{id}/advance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
    public async Task<IActionResult> AdvanceStatus(Guid id, [FromQuery] OrderStatus status)
    {
        await _orderService.AdvanceStatusAsync(id, status);
        return Ok(new { OrderId = id, Status = status.ToString() });
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        var orders = await _orderService.GetOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(Guid id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }
}
