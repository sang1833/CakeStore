using System.Text.Json.Nodes;
using cake_store_api.Entities;
using cake_store_api.Enums;
using Microsoft.AspNetCore.Identity;

namespace cake_store_api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Create Admin Role if it doesn't exist
        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        // Seed default admin user
        var adminEmail = "admin@cakestore.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                PhoneNumber = "0123456789",
                EmailConfirmed = true
            };
            
            var result = await userManager.CreateAsync(adminUser, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // Check if data already exists
        if (context.Products.Any())
        {
            return;   // DB has been seeded
        }

        var products = new List<Product>
        {
            // Type A: Ready To Ship
            new ReadyToShipProduct
            {
                Name = "Signature Tiramisu Box",
                Price = 25.00m,
                Description = "Our classic Italian coffee-flavored dessert. Ready to pick up.",
                ImageUrl = "assets/images/tiramisu.jpg",
                StockQuantity = 20,
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3))
            },
            new ReadyToShipProduct
            {
                Name = "Double Chocolate Macarons (Set of 6)",
                Price = 18.50m,
                Description = "Rich chocolate ganache sandwiched between airy shells.",
                ImageUrl = "assets/images/macarons.jpg",
                StockQuantity = 50,
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5))
            },
            new ReadyToShipProduct
            {
                Name = "Matcha Crepe Slice",
                Price = 8.00m,
                Description = "Layers of delicate crepes with matcha cream.",
                ImageUrl = "assets/images/matcha_crepe.jpg",
                StockQuantity = 15,
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2))
            },

            // Type B: Custom / Make To Order
            new MakeToOrderProduct
            {
                Name = "Classic Birthday Cake",
                Price = 45.00m,
                Description = "Vanilla sponge with buttercream. Fully customizable inscription.",
                ImageUrl = "assets/images/birthday_cake.jpg",
                LeadTimeHours = 24, // 1 day lead time
                CustomizationSchema = JsonNode.Parse(@"
                {
                    ""fields"": [
                        { ""key"": ""size"", ""type"": ""select"", ""label"": ""Size"", ""options"": [""6 inch"", ""8 inch"", ""10 inch""] },
                        { ""key"": ""flavor"", ""type"": ""select"", ""label"": ""Flavor"", ""options"": [""Vanilla"", ""Chocolate"", ""Red Velvet""] },
                        { ""key"": ""inscription"", ""type"": ""text"", ""label"": ""Inscription (Max 30 chars)"", ""maxLength"": 30 }
                    ]
                }")
            },
            new MakeToOrderProduct
            {
                Name = "Custom Wedding Cake Tier",
                Price = 150.00m,
                Description = "Elegant tiered cake for special occasions. Requires 48h notice.",
                ImageUrl = "assets/images/wedding_cake.jpg",
                LeadTimeHours = 48,
                CustomizationSchema = JsonNode.Parse(@"
                {
                    ""fields"": [
                        { ""key"": ""tiers"", ""type"": ""select"", ""label"": ""Tiers"", ""options"": [""2 Tiers"", ""3 Tiers""] },
                        { ""key"": ""floral_decoration"", ""type"": ""checkbox"", ""label"": ""Add Fresh Flowers (+$20)"" },
                        { ""key"": ""note"", ""type"": ""textarea"", ""label"": ""Special Instructions"" }
                    ]
                }"),
                IsActive = true
            },
            // Test Hidden Product
            new ReadyToShipProduct
            {
                Name = "Hidden Test Cake",
                Price = 999.00m,
                Description = "This product should not be visible in the catalog.",
                ImageUrl = "assets/images/tiramisu.jpg",
                StockQuantity = 0,
                ExpiryDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                IsActive = false
            }
        };

        await context.Products.AddRangeAsync(products);

        // Seed Production Slots for the next 30 days
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var slots = new List<ProductionSlot>();
        
        for (int i = 0; i < 30; i++)
        {
            slots.Add(new ProductionSlot
            {
                Date = startDate.AddDays(i),
                MaxCapacity = 20, // Example: Kitchen can handle 20 custom cakes per day
                ReservedCapacity = 0
            });
        }

        await context.ProductionSlots.AddRangeAsync(slots);

        await context.SaveChangesAsync();
    }
}
