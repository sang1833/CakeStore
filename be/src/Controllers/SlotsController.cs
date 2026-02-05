using cake_store_api.Entities;
using cake_store_api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly IProductionSlotService _slotService;

    public SlotsController(IProductionSlotService slotService)
    {
        _slotService = slotService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<ProductionSlot>>> GetSlots([FromQuery] DateOnly start, [FromQuery] DateOnly end)
    {
        if (start > end)
        {
            return BadRequest("Start date must be before end date.");
        }

        var slots = await _slotService.GetSlotsAsync(start, end);
        return Ok(slots);
    }
}
