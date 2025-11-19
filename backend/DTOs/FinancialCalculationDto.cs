namespace FantasyDomainManager.DTOs;

public class FinancialCalculationRequest
{
    public int DomainId { get; set; }
    public int Months { get; set; }
}

public class MonthlyBreakdown
{
    public int Month { get; set; }
    public int DomainIncome { get; set; }
    public int DomainUpkeep { get; set; }
    public int EnterpriseIncome { get; set; }
    public int EnterpriseUpkeep { get; set; }
    public int HeroWages { get; set; }
    public int TroopWages { get; set; }
    public int NetIncome { get; set; }
}

public class FinancialCalculationResponse
{
    public int TotalMonths { get; set; }
    public int TotalIncome { get; set; }
    public int TotalExpenses { get; set; }
    public int NetTotal { get; set; }
    public List<MonthlyBreakdown> MonthlyBreakdowns { get; set; } = new();
}
