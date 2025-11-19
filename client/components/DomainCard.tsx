'use client';

import { Domain } from '@/types/models';
import { Users, Crown, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from './Modal';

interface DomainCardProps {
  domain: Domain;
}

interface MonthlyBreakdown {
  month: number;
  domainIncome: number;
  domainUpkeep: number;
  enterpriseIncome: number;
  enterpriseUpkeep: number;
  heroWages: number;
  troopWages: number;
  netIncome: number;
}

interface FinancialCalculationResult {
  totalMonths: number;
  totalIncome: number;
  totalExpenses: number;
  netTotal: number;
  monthlyBreakdowns: MonthlyBreakdown[];
}

export default function DomainCard({ domain }: DomainCardProps) {
  const router = useRouter();
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [months, setMonths] = useState<number | ''>('');
  const [calculationResult, setCalculationResult] = useState<FinancialCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    router.push(`/domains/${domain.id}`);
  };

  const handleCalculateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsCalculateModalOpen(true);
    setCalculationResult(null);
    setError('');
  };

  const handleCalculate = async () => {
    const monthsValue = typeof months === 'number' ? months : parseInt(months) || 0;

    if (monthsValue <= 0) {
      setError('Months must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5223/api/Read/domains/${domain.id}/calculate-financials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ months: monthsValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate financials');
      }

      const data = await response.json();
      setCalculationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate financials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-zinc-900 border-2 border-amber-700/50 hover:border-amber-600 transition-all hover:shadow-lg hover:shadow-amber-900/20 group">
        <div onClick={handleClick} className="cursor-pointer">
          {/* Header with domain name */}
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h3 className="text-2xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors tracking-wide">
              {domain.name}
            </h3>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-3">
            {/* Ruler */}
            <div className="flex items-center gap-3">
              <Crown className="text-amber-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
                  Ruler
                </p>
                <p className="text-amber-100 font-medium">{domain.ruler}</p>
              </div>
            </div>

            {/* Population */}
            <div className="flex items-center gap-3">
              <Users className="text-amber-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
                  Population
                </p>
                <p className="text-amber-100 font-medium">
                  {domain.population.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Calculate Button */}
        <div className="border-t-2 border-amber-700/30 px-6 py-3">
          <button
            onClick={handleCalculateClick}
            className="flex items-center gap-2 w-full justify-center bg-amber-700/20 hover:bg-amber-700/30 text-amber-100 py-2 border border-amber-700/50 font-semibold transition-all"
          >
            <Calculator size={18} />
            Calculate Income
          </button>
        </div>
      </div>

      {/* Calculate Income Modal */}
      <Modal
        isOpen={isCalculateModalOpen}
        onClose={() => setIsCalculateModalOpen(false)}
        title="Calculate Financial Projection"
      >
        <div className="space-y-6">
          {!calculationResult ? (
            <>
              {error && (
                <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Number of Months
                </label>
                <input
                  type="number"
                  min="1"
                  value={months}
                  onChange={(e) => setMonths(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
                />
                <p className="text-amber-200/60 text-sm mt-1">
                  Calculate projected income and expenses for the specified period
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsCalculateModalOpen(false)}
                  className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Calculating...' : 'Calculate'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results Display */}
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-zinc-950/50 border-2 border-amber-700/50 p-4">
                  <h3 className="text-lg font-bold text-amber-100 mb-3">
                    {calculationResult.totalMonths} Month Projection for {domain.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                        Total Income
                      </p>
                      <p className="text-green-400 text-xl font-bold">
                        +{calculationResult.totalIncome.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                        Total Expenses
                      </p>
                      <p className="text-red-400 text-xl font-bold">
                        -{calculationResult.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-amber-700/30">
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                      Net Total
                    </p>
                    <p className={`text-3xl font-bold ${calculationResult.netTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {calculationResult.netTotal >= 0 ? '+' : ''}{calculationResult.netTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  <h4 className="text-md font-bold text-amber-100 sticky top-0 bg-zinc-900 py-2">
                    Monthly Breakdown
                  </h4>
                  {calculationResult.monthlyBreakdowns.map((breakdown) => (
                    <div key={breakdown.month} className="bg-zinc-800 border border-amber-700/30 p-3 text-sm">
                      <p className="font-bold text-amber-100 mb-2">Month {breakdown.month}</p>
                      <div className="grid grid-cols-2 gap-2 text-amber-200/80">
                        <div>
                          <span className="text-amber-200/60">Domain Income:</span>
                          <span className="float-right text-green-400">+{breakdown.domainIncome}</span>
                        </div>
                        <div>
                          <span className="text-amber-200/60">Domain Upkeep:</span>
                          <span className="float-right text-red-400">-{breakdown.domainUpkeep}</span>
                        </div>
                        <div>
                          <span className="text-amber-200/60">Enterprise Income:</span>
                          <span className="float-right text-green-400">+{breakdown.enterpriseIncome}</span>
                        </div>
                        <div>
                          <span className="text-amber-200/60">Enterprise Upkeep:</span>
                          <span className="float-right text-red-400">-{breakdown.enterpriseUpkeep}</span>
                        </div>
                        <div>
                          <span className="text-amber-200/60">Hero Wages:</span>
                          <span className="float-right text-red-400">-{breakdown.heroWages}</span>
                        </div>
                        <div>
                          <span className="text-amber-200/60">Troop Wages:</span>
                          <span className="float-right text-red-400">-{breakdown.troopWages}</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-amber-700/30 mt-1">
                          <span className="font-semibold text-amber-100">Net:</span>
                          <span className={`float-right font-bold ${breakdown.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {breakdown.netIncome >= 0 ? '+' : ''}{breakdown.netIncome}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t-2 border-amber-700/30">
                <button
                  onClick={() => {
                    setCalculationResult(null);
                    setMonths('');
                  }}
                  className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
                >
                  Calculate Again
                </button>
                <button
                  onClick={() => setIsCalculateModalOpen(false)}
                  className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
