'use client';

import { Troop } from '@/types/models';
import { Shield, Hash, Coins, Edit, Trash2 } from 'lucide-react';

interface TroopCardProps {
  troop: Troop;
  onEdit: (troop: Troop) => void;
  onDelete: (troop: Troop) => void;
}

export default function TroopCard({ troop, onEdit, onDelete }: TroopCardProps) {
  return (
    <div className="bg-zinc-900 border-2 border-amber-700/50">
      <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-4 py-3 flex items-center justify-between">
        <h4 className="text-lg font-bold text-amber-100">{troop.type}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(troop)}
            className="p-2 text-amber-100 hover:bg-amber-700/20 border border-amber-700/50 transition-all"
            title="Edit Troop"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(troop)}
            className="p-2 text-red-100 hover:bg-red-700/20 border border-red-700/50 transition-all"
            title="Delete Troop"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4 grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <Hash className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
              Quantity
            </p>
            <p className="text-amber-100 text-sm">{troop.quantity}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Coins className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold">
              Wage
            </p>
            <p className="text-amber-100 text-sm">{troop.wage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
