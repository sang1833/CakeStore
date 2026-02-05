using cake_store_api.Data;
using cake_store_api.Entities;
using cake_store_api.Services;
using Microsoft.EntityFrameworkCore;

namespace CakeStore.UnitTests;

public class DeliveryEstimatorServiceTests
{
    private readonly AppDbContext _dbContext;
    private readonly DeliveryEstimatorService _service;

    public DeliveryEstimatorServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
            
        _dbContext = new AppDbContext(options);
        _service = new DeliveryEstimatorService(_dbContext);
    }

    [Fact]
    public async Task EstimateDeliveryDate_TypeAOnly_ReturnsNextDay()
    {
        // Arrange
        var product = new ReadyToShipProduct { Name = "Cookie", Price = 10, StockQuantity = 100 };
        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        var items = new List<(Guid, int)> { (product.Id, 1) };

        // Act
        var result = await _service.EstimateDeliveryDateAsync(items);

        // Assert
        // Logic: T+1 (Tomorrow)
        var expected = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        Assert.Equal(expected, result);
    }
}
