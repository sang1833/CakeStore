using cake_store_api.Entities;
using cake_store_api.Enums;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace cake_store_api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<Product> Products { get; set; }
    public DbSet<ReadyToShipProduct> ReadyToShipProducts { get; set; }
    public DbSet<MakeToOrderProduct> MakeToOrderProducts { get; set; }
    public DbSet<ProductionSlot> ProductionSlots { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; } // Usually accessed via Order, but good to have

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // // 1. ProductionSlot: Concurrency (xmin)
        // modelBuilder.Entity<ProductionSlot>()
        //     .UseXminAsConcurrencyToken(); 

        // 2. Product: TPH Configuration
        modelBuilder.Entity<Product>()
            .UseTphMappingStrategy()
            .HasDiscriminator(p => p.Type)
            .HasValue<ReadyToShipProduct>(ProductType.ReadyToShip)
            .HasValue<MakeToOrderProduct>(ProductType.MakeToOrder);

        // 3. MakeToOrderProduct: JSONB
        modelBuilder.Entity<MakeToOrderProduct>()
            .Property(p => p.CustomizationSchema)
            .HasColumnType("jsonb");

        // 4. OrderItem: JSONB
        modelBuilder.Entity<OrderItem>()
            .Property(i => i.CustomizationData)
            .HasColumnType("jsonb");
            
        // 5. Order Config
        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
