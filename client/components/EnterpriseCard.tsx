'use client';

import { Enterprise } from '@/types/models';
import { Building2, Coins, TrendingDown, Edit, Trash2 } from 'lucide-react';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onEdit: (enterprise: Enterprise) => void;
  onDelete: (enterprise: Enterprise) => void;
}

export default function EnterpriseCard({ enterprise, onEdit, onDelete }: EnterpriseCardProps) {
  return (
    <div className="bg-zinc-900 border-2 border-amber-700/50">
      <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-4 py-3 flex items-center justify-between">
        <h4 className="text-lg font-bold text-amber-100">{enterprise.name}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(enterprise)}
            className="p-2 text-amber-100 hover:bg-amber-700/20 border border-amber-700/50 transition-all"
            title="Edit Enterprise"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(enterprise)}
            className="p-2 text-red-100 hover:bg-red-700/20 border border-red-700/50 transition-all"
            title="Delete Enterprise"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        {(enterprise.income !== null || enterprise.incomeLowerLimit !== null || enterprise.incomeUpperLimit !== null) && (
          <div className="flex items-start gap-2">
            <Coins className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
                Income
              </p>
              <p className="text-amber-100 text-sm">
                {enterprise.income !== null
                  ? enterprise.income.toLocaleString()
                  : enterprise.incomeLowerLimit !== null && enterprise.incomeUpperLimit !== null
                  ? `${enterprise.incomeLowerLimit.toLocaleString()}-${enterprise.incomeUpperLimit.toLocaleString()}`
                  : '-'}
              </p>
            </div>
          </div>
        )}
        {(enterprise.upkeepCost !== null || enterprise.upkeepCostLowerLimit !== null || enterprise.upkeepCostUpperLimit !== null) && (
          <div className="flex items-start gap-2">
            <TrendingDown className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
                Upkeep Cost
              </p>
              <p className="text-amber-100 text-sm">
                {enterprise.upkeepCost !== null
                  ? enterprise.upkeepCost.toLocaleString()
                  : enterprise.upkeepCostLowerLimit !== null && enterprise.upkeepCostUpperLimit !== null
                  ? `${enterprise.upkeepCostLowerLimit.toLocaleString()}-${enterprise.upkeepCostUpperLimit.toLocaleString()}`
                  : '-'}
              </p>
            </div>
          </div>
        )}
      </div>
      {enterprise.notes && (
        <div className="px-4 pb-4 border-t-2 border-amber-700/30 pt-3">
          <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-2">
            Notes
          </p>
          <p className="text-amber-100 text-sm whitespace-pre-wrap">{enterprise.notes}</p>
        </div>
      )}
    </div>
  );
}
