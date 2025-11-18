'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Crown, Users, Coins, TrendingDown } from 'lucide-react';
import { Domain } from '@/types/models';
import { domainApi } from '@/lib/api';
import Modal from '@/components/Modal';
import HeroSection from '@/components/HeroSection';
import EnterpriseSection from '@/components/EnterpriseSection';
import TroopSection from '@/components/TroopSection';

export default function DomainDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Domain>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    loadDomain();
  }, [params.id]);

  const loadDomain = async () => {
    try {
      setLoading(true);
      const data = await domainApi.getById(parseInt(params.id));
      setDomain(data);
      setFormData(data);
    } catch (err) {
      console.error('Failed to load domain:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.ruler) {
      setError('Name and Ruler are required');
      return;
    }

    try {
      await domainApi.update(parseInt(params.id), formData);
      setIsEditModalOpen(false);
      loadDomain();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update domain');
    }
  };

  const handleDelete = async () => {
    try {
      await domainApi.delete(parseInt(params.id));
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
          onClick={() => router.push('/')}
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
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Crown className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                  Ruler
                </p>
                <p className="text-amber-100 text-lg font-medium">{domain.ruler}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                  Population
                </p>
                <p className="text-amber-100 text-lg font-medium">
                  {domain.population.toLocaleString()}
                </p>
              </div>
            </div>

            {(domain.income !== null || domain.incomeLowerLimit !== null || domain.incomeUpperLimit !== null) && (
              <div className="flex items-start gap-3">
                <Coins className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                    Income
                  </p>
                  <p className="text-amber-100 text-lg font-medium">
                    {domain.income !== null && domain.income}
                    {domain.incomeLowerLimit !== null && domain.incomeUpperLimit !== null &&
                      ` (${domain.incomeLowerLimit} - ${domain.incomeUpperLimit})`}
                  </p>
                </div>
              </div>
            )}

            {(domain.upkeepCost !== null || domain.upkeepCostLowerLimit !== null || domain.upkeepCostUpperLimit !== null) && (
              <div className="flex items-start gap-3">
                <TrendingDown className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="text-xs text-amber-200/60 uppercase tracking-wider font-semibold mb-1">
                    Upkeep Cost
                  </p>
                  <p className="text-amber-100 text-lg font-medium">
                    {domain.upkeepCost !== null && domain.upkeepCost}
                    {domain.upkeepCostLowerLimit !== null && domain.upkeepCostUpperLimit !== null &&
                      ` (${domain.upkeepCostLowerLimit} - ${domain.upkeepCostUpperLimit})`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sections for Heroes, Troops, Enterprises */}
        <div className="space-y-6">
          <HeroSection domainId={domain.id} />
          <TroopSection domainId={domain.id} />
          <EnterpriseSection domainId={domain.id} />
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
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Population
            </label>
            <input
              type="number"
              value={formData.population || 0}
              onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Income
              </label>
              <input
                type="number"
                value={formData.income || ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Min
              </label>
              <input
                type="number"
                value={formData.incomeLowerLimit || ''}
                onChange={(e) => setFormData({ ...formData, incomeLowerLimit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Max
              </label>
              <input
                type="number"
                value={formData.incomeUpperLimit || ''}
                onChange={(e) => setFormData({ ...formData, incomeUpperLimit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Upkeep Cost
              </label>
              <input
                type="number"
                value={formData.upkeepCost || ''}
                onChange={(e) => setFormData({ ...formData, upkeepCost: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Min
              </label>
              <input
                type="number"
                value={formData.upkeepCostLowerLimit || ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostLowerLimit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Max
              </label>
              <input
                type="number"
                value={formData.upkeepCostUpperLimit || ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostUpperLimit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              />
            </div>
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
