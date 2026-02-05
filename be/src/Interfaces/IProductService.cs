using cake_store_api.Entities;
using cake_store_api.Enums;

namespace cake_store_api.Interfaces;

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllProductsAsync(ProductType? type, bool includeInactive = false);
    Task<Product?> GetProductByIdAsync(Guid id);
    Task ToggleVisibilityAsync(Guid id);
}
