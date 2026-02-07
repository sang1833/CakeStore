using cake_store_api.Data;
using cake_store_api.Entities;
using cake_store_api.Enums;
using cake_store_api.Interfaces;
using cake_store_api.Exceptions;
using cake_store_api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace cake_store_api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync(ProductType? type, bool includeInactive = false)
    {
        var query = _context.Products.AsQueryable();

        if (type.HasValue)
        {
            query = query.Where(p => p.Type == type.Value);
        }

        if (!includeInactive)
        {
            query = query.Where(p => p.IsActive);
        }

        return await query.ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(Guid id)
    {
        return await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task ToggleVisibilityAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) throw new NotFoundException($"Product {id} not found");

        product.IsActive = !product.IsActive;
        await _context.SaveChangesAsync();
    }

    public async Task<Product> CreateProductAsync(CreateProductRequest request)
    {
        Product product = request.Type switch
        {
            ProductType.ReadyToShip => new ReadyToShipProduct
            {
                Name = request.Name,
                Price = request.Price,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                StockQuantity = request.StockQuantity ?? 0,
                ExpiryDate = request.ExpiryDate
            },
            ProductType.MakeToOrder => new MakeToOrderProduct
            {
                Name = request.Name,
                Price = request.Price,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                LeadTimeHours = request.LeadTimeHours ?? 24,
                CustomizationSchema = string.IsNullOrEmpty(request.CustomizationSchema) 
                    ? null 
                    : System.Text.Json.Nodes.JsonNode.Parse(request.CustomizationSchema)
            },
            _ => throw new ValidationException("Invalid product type")
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateProductAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) throw new NotFoundException($"Product {id} not found");

        if (request.Name != null) product.Name = request.Name;
        if (request.Price.HasValue) product.Price = request.Price.Value;
        if (request.Description != null) product.Description = request.Description;
        if (request.ImageUrl != null) product.ImageUrl = request.ImageUrl;

        if (product is ReadyToShipProduct rts)
        {
            if (request.StockQuantity.HasValue) rts.StockQuantity = request.StockQuantity.Value;
            if (request.ExpiryDate.HasValue) rts.ExpiryDate = request.ExpiryDate.Value;
        }
        else if (product is MakeToOrderProduct mto)
        {
            if (request.LeadTimeHours.HasValue) mto.LeadTimeHours = request.LeadTimeHours.Value;
            if (request.CustomizationSchema != null)
            {
                mto.CustomizationSchema = System.Text.Json.Nodes.JsonNode.Parse(request.CustomizationSchema);
            }
        }

        await _context.SaveChangesAsync();
        return product;
    }

    public async Task DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) throw new NotFoundException($"Product {id} not found");

        product.IsActive = false;
        await _context.SaveChangesAsync();
    }
}
