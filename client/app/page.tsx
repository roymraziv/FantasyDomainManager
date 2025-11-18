'use client';

import { useEffect, useState } from 'react';
import { Plus, Castle } from 'lucide-react';
import { Domain, CreateDomainDto } from '@/types/models';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';
import Modal from '@/components/Modal';

export default function Home() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDomainDto>({
    name: '',
    ruler: '',
    population: 0,
    upkeepCost: null,
    upkeepCostLowerLimit: null,
    upkeepCostUpperLimit: null,
    income: null,
    incomeLowerLimit: null,
    incomeUpperLimit: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await domainApi.getAll();
      setDomains(data);
    } catch (err) {
      console.error('Failed to load domains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.ruler) {
      setError('Name and Ruler are required');
      return;
    }

    try {
      await domainApi.create(formData);
      setIsModalOpen(false);
      resetForm();
      loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create domain');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ruler: '',
      population: 0,
      upkeepCost: null,
      upkeepCostLowerLimit: null,
      upkeepCostUpperLimit: null,
      income: null,
      incomeLowerLimit: null,
      incomeUpperLimit: null,
    });
    setError('');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Castle className="text-amber-600" size={40} />
            <h1 className="text-4xl font-bold text-amber-100 tracking-wide">
              Fantasy Domain Manager
            </h1>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-amber-100 px-6 py-3 border-2 border-amber-900 font-semibold transition-all hover:shadow-lg hover:shadow-amber-900/30"
          >
            <Plus size={20} />
            Add Domain
          </button>
        </div>

        {/* Domain Grid */}
        {loading ? (
          <div className="text-center text-amber-200/60 py-20">
            Loading domains...
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center text-amber-200/60 py-20">
            <Castle className="mx-auto mb-4 text-amber-700/30" size={64} />
            <p className="text-xl">No domains yet. Create your first domain to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>

      {/* Create Domain Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Domain"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formData.name}
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
              value={formData.ruler}
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
              value={formData.population}
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
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 font-semibold transition-all"
            >
              Create Domain
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
