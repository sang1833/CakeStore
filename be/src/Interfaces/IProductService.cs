using cake_store_api.Entities;
using cake_store_api.Enums;
using cake_store_api.DTOs;

namespace cake_store_api.Interfaces;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync(ProductType? type, bool includeInactive = false);
    Task<Product?> GetProductByIdAsync(Guid id);
    Task ToggleVisibilityAsync(Guid id);
    Task<Product> CreateProductAsync(CreateProductRequest request);
    Task<Product> UpdateProductAsync(Guid id, UpdateProductRequest request);
    Task DeleteProductAsync(Guid id);
}
