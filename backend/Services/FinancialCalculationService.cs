using FantasyDomainManager.DbContexts;
using FantasyDomainManager.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FantasyDomainManager.Services;

public class FinancialCalculationService
{
    private readonly DomainDb _context;
    private readonly Random _random;

    public FinancialCalculationService(DomainDb context)
    {
        _context = context;
        _random = new Random();
    }

    public async Task<FinancialCalculationResponse?> CalculateFinancials(int domainId, int months)
    {
        var domain = await _context.Domains
            .Include(d => d.Heroes)
            .Include(d => d.Troops)
            .Include(d => d.Enterprises)
            .FirstOrDefaultAsync(d => d.Id == domainId);

        if (domain == null)
        {
            return null;
        }

        var response = new FinancialCalculationResponse
        {
            TotalMonths = months
        };

        int totalIncome = 0;
        int totalExpenses = 0;

        for (int month = 1; month <= months; month++)
        {
            var breakdown = new MonthlyBreakdown
            {
                Month = month
            };

            // Calculate Domain Income (flat or random in range)
            breakdown.DomainIncome = CalculateValue(
                domain.Income,
                domain.IncomeLowerLimit,
                domain.IncomeUpperLimit
            );

            // Calculate Domain Upkeep (flat or random in range)
            breakdown.DomainUpkeep = CalculateValue(
                domain.UpkeepCost,
                domain.UpkeepCostLowerLimit,
                domain.UpkeepCostUpperLimit
            );

            // Calculate Enterprise Income and Upkeep
            foreach (var enterprise in domain.Enterprises)
            {
                breakdown.EnterpriseIncome += CalculateValue(
                    enterprise.Income,
                    enterprise.IncomeLowerLimit,
                    enterprise.IncomeUpperLimit
                );

                breakdown.EnterpriseUpkeep += CalculateValue(
                    enterprise.UpkeepCost,
                    enterprise.UpkeepCostLowerLimit,
                    enterprise.UpkeepCostUpperLimit
                );
            }

            // Calculate Hero Wages (all flat values)
            breakdown.HeroWages = domain.Heroes.Sum(h => h.Wage);

            // Calculate Troop Wages (all flat values)
            breakdown.TroopWages = domain.Troops.Sum(t => t.Wage);

            // Calculate Net Income for this month
            breakdown.NetIncome = breakdown.DomainIncome + breakdown.EnterpriseIncome
                                - breakdown.DomainUpkeep - breakdown.EnterpriseUpkeep
                                - breakdown.HeroWages - breakdown.TroopWages;

            // Add to totals
            totalIncome += breakdown.DomainIncome + breakdown.EnterpriseIncome;
            totalExpenses += breakdown.DomainUpkeep + breakdown.EnterpriseUpkeep
                          + breakdown.HeroWages + breakdown.TroopWages;

            response.MonthlyBreakdowns.Add(breakdown);
        }

        response.TotalIncome = totalIncome;
        response.TotalExpenses = totalExpenses;
        response.NetTotal = totalIncome - totalExpenses;

        return response;
    }

    private int CalculateValue(int? flatValue, int? lowerLimit, int? upperLimit)
    {
        // If flat value is set, use it
        if (flatValue.HasValue)
        {
            return flatValue.Value;
        }

        // If range is set, generate random value in range
        if (lowerLimit.HasValue && upperLimit.HasValue)
        {
            return _random.Next(lowerLimit.Value, upperLimit.Value + 1);
        }

        // Default to 0 if nothing is set
        return 0;
    }
}
