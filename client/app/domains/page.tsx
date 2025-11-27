'use client';

import { useEffect, useState } from 'react';
import { Plus, Map } from 'lucide-react';
import { Domain, CreateDomainDto } from '@/types/models';
import { domainApi } from '@/lib/api';
import DomainCard from '@/components/DomainCard';
import Modal from '@/components/Modal';

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateDomainDto, 'population'> & { population: number | '' }>({
    name: '',
    ruler: '',
    population: 0,
    upkeepCost: null,
    upkeepCostLowerLimit: null,
    upkeepCostUpperLimit: null,
    income: null,
    incomeLowerLimit: null,
    incomeUpperLimit: null,
    notes: null,
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
    const population = typeof formData.population === 'string' ? 0 : formData.population;
    if (population <= 0) {
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

    // Validate that either income OR income range is provided
    if (formData.income == null && (formData.incomeLowerLimit == null || formData.incomeUpperLimit == null)) {
      setError('Either income or both income lower limit and upper limit must be provided');
      return;
    }

    // Validate income range: min must be less than or equal to max
    if (formData.incomeLowerLimit != null && formData.incomeUpperLimit != null) {
      if (formData.incomeLowerLimit > formData.incomeUpperLimit) {
        setError('Income lower limit must be less than or equal to income upper limit');
        return;
      }
    }

    // Validate upkeep range: min must be less than or equal to max
    if (formData.upkeepCostLowerLimit != null && formData.upkeepCostUpperLimit != null) {
      if (formData.upkeepCostLowerLimit > formData.upkeepCostUpperLimit) {
        setError('Upkeep cost lower limit must be less than or equal to upkeep cost upper limit');
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
      const submitData = {
        ...formData,
        population: typeof formData.population === 'string' ? 0 : formData.population,
      };
      await domainApi.create(submitData);
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
      notes: null,
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
            <Map className="text-amber-600" size={40} />
            <h1 className="text-4xl font-bold text-amber-100 tracking-wide">
              My Domains
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
            <Map className="mx-auto mb-4 text-amber-700/30" size={64} />
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
              value={formData.ruler}
              onChange={(e) => setFormData({ ...formData, ruler: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">
              Population * 
            </label>
            <input
              type="number"
              min="0"
              value={formData.population}
              onChange={(e) => setFormData({ ...formData, population: e.target.value === '' ? '' as const : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Income (flat value) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.income ?? ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.incomeLowerLimit !== null || formData.incomeUpperLimit !== null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Min (or range) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.incomeLowerLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, incomeLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.income !== null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Income Max *
              </label>
              <input
                type="number"
                min="0"
                value={formData.incomeUpperLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, incomeUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.income !== null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">
                Upkeep Cost (flat value) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCost ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCost: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.upkeepCostLowerLimit !== null || formData.upkeepCostUpperLimit !== null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Min (or range) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCostLowerLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.upkeepCost !== null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">
                Upkeep Max *
              </label>
              <input
                type="number"
                min="0"
                value={formData.upkeepCostUpperLimit ?? ''}
                onChange={(e) => setFormData({ ...formData, upkeepCostUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.upkeepCost !== null}
                onWheel={(e) => e.currentTarget.blur()}
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
