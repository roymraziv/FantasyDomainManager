'use client';

import { Domain } from '@/types/models';
import { Users, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DomainCardProps {
  domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/domains/${domain.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-zinc-900 border-2 border-amber-700/50 hover:border-amber-600 transition-all cursor-pointer hover:shadow-lg hover:shadow-amber-900/20 group"
    >
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
  );
}
