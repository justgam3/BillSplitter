using BillSplitter.Application.Expenses.Commands.CreateExpense;
using BillSplitter.Application.Expenses.Queries.GetBalances;
using BillSplitter.Application.Expenses.Queries.GetExpenseTimeline;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BillSplitter.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly ISender _sender;

    public ExpensesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var command = new CreateExpenseCommand(
                userId,
                request.Description,
                request.Amount,
                request.CurrencyCode,
                request.SplitType,
                new PaidByDto(request.PaidBy.Type, request.PaidBy.BuddyId),
                request.Participants.Select(p => new ParticipantDto(p.BuddyId, p.Self, p.Amount)).ToList()
            );
            var result = await _sender.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("balances")]
    public async Task<IActionResult> GetBalances()
    {
        var userId = GetCurrentUserId();
        var result = await _sender.Send(new GetBalancesQuery(userId));
        return Ok(result);
    }

    [HttpGet("timeline")]
    public async Task<IActionResult> GetTimeline([FromQuery] int days = 7)
    {
        var userId = GetCurrentUserId();
        var result = await _sender.Send(new GetExpenseTimelineQuery(userId, Math.Clamp(days, 7, 30)));
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("Invalid token");
        return userId;
    }
}

public record PaidByRequest(string Type, Guid? BuddyId);
public record ParticipantRequest(Guid? BuddyId, bool Self, decimal Amount);
public record CreateExpenseRequest(
    string Description,
    decimal Amount,
    string CurrencyCode,
    string SplitType,
    PaidByRequest PaidBy,
    List<ParticipantRequest> Participants
);
