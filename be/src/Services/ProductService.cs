using cake_store_api.Data;
using cake_store_api.Entities;
using cake_store_api.Enums;
using cake_store_api.Interfaces;
using cake_store_api.Exceptions;
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
}
