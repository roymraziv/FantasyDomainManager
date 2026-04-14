using System;
using FantasyDomainManager.DTOs.CreateDtos;
using FantasyDomainManager.Models;

namespace FantasyDomainManager.Extensions;

public static class CreateDomainDtoExtensions
{
    public static Domain ToDomain(this CreateDomainDto createDomainDto, User user)
    {
        var domainId = Guid.NewGuid().ToString();
        var userId = user.Id;
        return new Domain
        {
            Id = domainId,
            Name = createDomainDto.Name,
            Ruler = createDomainDto.Ruler,
            Population = createDomainDto.Population,
            UpkeepCost = createDomainDto.UpkeepCost,
            UpkeepCostLowerLimit = createDomainDto.UpkeepCostLowerLimit,
            UpkeepCostUpperLimit = createDomainDto.UpkeepCostUpperLimit,
            Income = createDomainDto.Income,
            IncomeLowerLimit = createDomainDto.IncomeLowerLimit,
            IncomeUpperLimit = createDomainDto.IncomeUpperLimit,
            Notes = createDomainDto.Notes,
            UserId = userId
        };
    }
}
