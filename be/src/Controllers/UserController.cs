using System.Security.Claims;
using cake_store_api.DTOs;
using cake_store_api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace cake_store_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null) return NotFound();

        return Ok(new UserProfileDto(
            user.Id,
            user.Email!,
            user.FullName ?? "",
            user.PhoneNumber ?? "",
            user.Address ?? ""
        ));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null) return NotFound();

        user.FullName = request.FullName;
        user.PhoneNumber = request.Phone;
        user.Address = request.Address;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            return Ok(new { Message = "Profile updated successfully" });
        }

        return BadRequest(result.Errors);
    }
}
