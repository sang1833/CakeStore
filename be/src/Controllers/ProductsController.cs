using cake_store_api.Entities;
using cake_store_api.Enums;
using cake_store_api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] ProductType? type, [FromQuery] bool includeInactive = false)
    {
        var products = await _productService.GetAllProductsAsync(type, includeInactive);
        return Ok(products);
    }

    [HttpPatch("{id}/visibility")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
    public async Task<IActionResult> ToggleVisibility(Guid id)
    {
        await _productService.ToggleVisibilityAsync(id);
        return Ok(new { Id = id, Message = "Visibility toggled" });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
    public async Task<ActionResult<Product>> GetProduct(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }
}
