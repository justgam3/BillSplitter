using BillSplitter.Application.Buddies.Commands.AddBuddy;
using BillSplitter.Application.Buddies.Commands.UpdateBuddyNickname;
using BillSplitter.Application.Buddies.Queries.GetBuddies;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BillSplitter.API.Controllers;

[ApiController]
[Route("api/buddies")]
[Authorize]
public class BuddiesController : ControllerBase
{
    private readonly ISender _sender;

    public BuddiesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> AddBuddy([FromBody] AddBuddyRequest request)
    {
        try
        {
            var ownerId = GetCurrentUserId();
            var command = new AddBuddyCommand(ownerId, request.Email, request.Nickname);
            var result = await _sender.Send(command);
            return CreatedAtAction(nameof(GetBuddies), result);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message.Contains("already exists") ? Conflict(new { message = ex.Message }) : BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetBuddies()
    {
        var ownerId = GetCurrentUserId();
        var result = await _sender.Send(new GetBuddiesQuery(ownerId));
        return Ok(result);
    }

    [HttpPatch("{id}/nickname")]
    public async Task<IActionResult> UpdateNickname(Guid id, [FromBody] UpdateNicknameRequest request)
    {
        try
        {
            var ownerId = GetCurrentUserId();
            var command = new UpdateBuddyNicknameCommand(ownerId, id, request.Nickname);
            var result = await _sender.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("Invalid token");
        return userId;
    }
}

public record AddBuddyRequest(string Email, string? Nickname);
public record UpdateNicknameRequest(string Nickname);
