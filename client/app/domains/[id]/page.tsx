'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Crown, Users, Coins, TrendingDown } from 'lucide-react';
import { Domain } from '@/types/models';
import { domainApi } from '@/lib/api';
import Modal from '@/components/Modal';
import HeroSection from '@/components/HeroSection';
import EnterpriseSection from '@/components/EnterpriseSection';
import TroopSection from '@/components/TroopSection';

export default function DomainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Domain>>({});
  const [error, setError] = useState('');

  const loadDomain = useCallback(async () => {
    try {
      setLoading(true);
      const data = await domainApi.getById(id);
      setDomain(data);
      // Only set domain fields for formData, exclude collections
      const { ...domainFields } = data;
      setFormData(domainFields);
    } catch (err) {
      console.error('Failed to load domain:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDomain();
  }, [loadDomain]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.ruler) {
      setError('Name and Ruler are required');
      return;
    }

    // Validate max lengths
    if (formData.name.length > 100) {
      setError('Name must not exceed 100 characters');
      return;
    }

    if (formData.ruler.length > 100) {
      setError('Ruler must not exceed 100 characters');
      return;
    }

    if (formData.notes && formData.notes.length > 1000) {
      setError('Notes must not exceed 1000 characters');
      return;
    }

    // Validate population
    if (formData.population !== undefined && formData.population <= 0) {
      setError('Population must be greater than 0');
      return;
    }

    // Validate income: cannot have both flat value and range
    if (formData.income != null && (formData.incomeLowerLimit != null || formData.incomeUpperLimit != null)) {
      setError('Income must be null when income lower limit and upper limit are provided');
      return;
    }

    // Validate upkeep: cannot have both flat value and range
    if (formData.upkeepCost != null && (formData.upkeepCostLowerLimit != null || formData.upkeepCostUpperLimit != null)) {
      setError('Upkeep cost must be null when upkeep cost lower limit and upper limit are provided');
      return;
    }

    // Validate income range: min must be less than max
    if (formData.incomeLowerLimit !== null && formData.incomeUpperLimit !== null) {
      if (formData.incomeLowerLimit !== undefined && formData.incomeUpperLimit !== undefined && formData.incomeLowerLimit >= formData.incomeUpperLimit) {
        setError('Income minimum must be less than income maximum');
        return;
      }
    }

    // Validate upkeep range: min must be less than max
    if (formData.upkeepCostLowerLimit !== null && formData.upkeepCostLowerLimit !== undefined && 
        formData.upkeepCostUpperLimit !== null && formData.upkeepCostUpperLimit !== undefined) {
      if (formData.upkeepCostLowerLimit >= formData.upkeepCostUpperLimit) {
        setError('Upkeep cost minimum must be less than upkeep cost maximum');
        return;
      }
    }

    // Validate positive values
    if (formData.income != null && formData.income < 0) {
      setError('Income must be a positive value');
      return;
    }
    if (formData.incomeLowerLimit != null && formData.incomeLowerLimit < 0) {
      setError('Income lower limit must be a positive value');
      return;
    }
    if (formData.incomeUpperLimit != null && formData.incomeUpperLimit < 0) {
      setError('Income upper limit must be a positive value');
      return;
    }
    if (formData.upkeepCost != null && formData.upkeepCost < 0) {
      setError('Upkeep cost must be a positive value');
      return;
    }
    if (formData.upkeepCostLowerLimit != null && formData.upkeepCostLowerLimit < 0) {
      setError('Upkeep cost lower limit must be a positive value');
      return;
    }
    if (formData.upkeepCostUpperLimit != null && formData.upkeepCostUpperLimit < 0) {
      setError('Upkeep cost upper limit must be a positive value');
      return;
    }

    try {
      await domainApi.update(id, formData);
      setIsEditModalOpen(false);
      loadDomain();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update domain');
    }
  };

  const handleDelete = async () => {
    try {
      await domainApi.delete(id);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Loading domain...</div>
      </div>
    );
  }

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Domain not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/domains')}
          className="flex items-center gap-2 text-amber-100 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Domains
        </button>

        {/* Domain Header */}
        <div className="bg-zinc-900 border-2 border-amber-700/50 mb-6">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-100 tracking-wide">
              {domain.name}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-amber-100 px-4 py-2 border-2 border-amber-900 font-semibold transition-all"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-red-100 px-4 py-2 border-2 border-red-950 font-semibold transition-all"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>

          {/* Domain Information */}
          <div className="px-6 py-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 border-b border-amber-700/30 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Crown className="text-amber-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                      Ruler
                    </p>
                    <p className="text-amber-100 font-medium">{domain.ruler}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-amber-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                      Population
                    </p>
                    <p className="text-amber-100 font-medium">
                      {domain.population.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Finances Section */}
            <div>
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 border-b border-amber-700/30 pb-2">
                Finances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upkeep (Left) */}
                <div className="flex items-start gap-3">
                  <TrendingDown className="text-amber-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                      Upkeep Cost
                    </p>
                    <p className="text-amber-100 font-medium">
                      {domain.upkeepCost !== null && domain.upkeepCost !== undefined
                        ? domain.upkeepCost.toLocaleString()
                        : domain.upkeepCostLowerLimit !== null && domain.upkeepCostLowerLimit !== undefined && 
                          domain.upkeepCostUpperLimit !== null && domain.upkeepCostUpperLimit !== undefined
                        ? `${domain.upkeepCostLowerLimit.toLocaleString()}-${domain.upkeepCostUpperLimit.toLocaleString()}`
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Income (Right) */}
                <div className="flex items-start gap-3">
                  <Coins className="text-amber-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                      Income
                    </p>
                    <p className="text-amber-100 font-medium">
                      {domain.income !== null && domain.income !== undefined
                        ? domain.income.toLocaleString()
                        : domain.incomeLowerLimit !== null && domain.incomeLowerLimit !== undefined && 
                          domain.incomeUpperLimit !== null && domain.incomeUpperLimit !== undefined
                        ? `${domain.incomeLowerLimit.toLocaleString()}-${domain.incomeUpperLimit.toLocaleString()}`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 border-b border-amber-700/30 pb-2">
                Notes
              </h3>
              <div className="bg-zinc-800 border-2 border-amber-700/50 px-4 py-3 min-h-[100px]">
                <p className="text-amber-100 whitespace-pre-wrap">
                  {domain.notes || 'No notes'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections for Heroes, Troops, Enterprises */}
        <div className="space-y-6">
          <HeroSection domainId={domain.id.toString()} initialHeroes={domain.heroes} />
          <TroopSection domainId={domain.id.toString()} initialTroops={domain.troops} />
          <EnterpriseSection domainId={domain.id.toString()} initialEnterprises={domain.enterprises} />
        </div>
      </div>

      {/* Edit Domain Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Domain"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Domain Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Ruler *
            </label>
            <input
              type="text"
              value={formData.ruler || ''}
              onChange={(e) => setFormData({ ...formData, ruler: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Population
            </label>
            <input
              type="number"
              min="0"
              value={formData.population ?? 0}
              onChange={(e) => setFormData({ ...formData, population: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Income (flat value)
              </label>
              <input
                type="number"
                min="0"
                value={formData.income ?? ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.incomeLowerLimit != null || formData.incomeUpperLimit != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Min (or range)
              </label>
              <input
                type="number"
                min="0"
                value={formData.incomeLowerLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, incomeLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.income != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Max
              </label>
              <input
                type="number"
                min="0"
                value={formData.incomeUpperLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, incomeUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.income != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Upkeep Cost (flat value)
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCost ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCost: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.upkeepCostLowerLimit != null || formData.upkeepCostUpperLimit != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Min (or range)
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCostLowerLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.upkeepCost != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Max
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCostUpperLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                disabled={formData.upkeepCost != null}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none min-h-[100px] resize-y"
              placeholder="Add any notes or descriptions..."
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 font-semibold transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Domain"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
              {error}
            </div>
          )}
          <p className="text-amber-100 text-lg">
            Are you sure you want to delete <span className="font-bold text-amber-400">{domain.name}</span>?
          </p>
          <p className="text-amber-200/60">
            This action cannot be undone. Make sure all heroes, troops, and enterprises are removed first.
          </p>
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-800 hover:bg-red-700 text-red-100 border-2 border-red-950 font-semibold transition-all"
            >
              Delete Domain
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
