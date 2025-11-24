'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Building2 } from 'lucide-react';
import { Enterprise, CreateEnterpriseDto } from '@/types/models';
import { enterpriseApi } from '@/lib/api';
import EnterpriseCard from './EnterpriseCard';
import Modal from './Modal';

interface EnterpriseSectionProps {
  domainId: string;
  initialEnterprises?: Enterprise[];
}

export default function EnterpriseSection({ domainId, initialEnterprises = [] }: EnterpriseSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>(initialEnterprises);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState<CreateEnterpriseDto>({
    name: '',
    income: null,
    incomeLowerLimit: null,
    incomeUpperLimit: null,
    upkeepCost: null,
    upkeepCostLowerLimit: null,
    upkeepCostUpperLimit: null,
    notes: null,
    domainId,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && enterprises.length === 0 && initialEnterprises.length === 0) {
      loadEnterprises();
    }
  }, [isOpen]);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const data = await enterpriseApi.getByDomainId(domainId);
      setEnterprises(data);
    } catch (err) {
      console.error('Failed to load enterprises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    // Validate max lengths
    if (formData.name.length > 100) {
      setError('Name must not exceed 100 characters');
      return;
    }

    if (formData.notes && formData.notes.length > 1000) {
      setError('Notes must not exceed 1000 characters');
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
      await enterpriseApi.create(formData);
      setIsCreateModalOpen(false);
      resetForm();
      loadEnterprises();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enterprise');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEnterprise || !formData.name) {
      setError('Name is required');
      return;
    }

    // Validate max lengths
    if (formData.name.length > 100) {
      setError('Name must not exceed 100 characters');
      return;
    }

    if (formData.notes && formData.notes.length > 1000) {
      setError('Notes must not exceed 1000 characters');
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
      await enterpriseApi.update(selectedEnterprise.id, { ...formData, id: selectedEnterprise.id });
      setIsEditModalOpen(false);
      setSelectedEnterprise(null);
      resetForm();
      loadEnterprises();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update enterprise');
    }
  };

  const handleDelete = async () => {
    if (!selectedEnterprise) return;

    try {
      await enterpriseApi.delete(selectedEnterprise.id);
      setIsDeleteModalOpen(false);
      setSelectedEnterprise(null);
      loadEnterprises();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete enterprise');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      income: null,
      incomeLowerLimit: null,
      incomeUpperLimit: null,
      upkeepCost: null,
      upkeepCostLowerLimit: null,
      upkeepCostUpperLimit: null,
      notes: null,
      domainId,
    });
    setError('');
  };

  const openEditModal = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      income: enterprise.income,
      incomeLowerLimit: enterprise.incomeLowerLimit,
      incomeUpperLimit: enterprise.incomeUpperLimit,
      upkeepCost: enterprise.upkeepCost,
      upkeepCostLowerLimit: enterprise.upkeepCostLowerLimit,
      upkeepCostUpperLimit: enterprise.upkeepCostUpperLimit,
      notes: enterprise.notes,
      domainId: enterprise.domainId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-zinc-900 border-2 border-amber-700/50">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4 flex items-center justify-between hover:bg-zinc-950 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="text-amber-600" size={24} />
          <h3 className="text-xl font-bold text-amber-100">Enterprises</h3>
          <span className="text-amber-200/60 text-sm">({enterprises.length})</span>
        </div>
        {isOpen ? <ChevronUp className="text-amber-600" /> : <ChevronDown className="text-amber-600" />}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 py-6">
          <div className="mb-4">
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-amber-100 px-4 py-2 border-2 border-amber-900 font-semibold transition-all"
            >
              <Plus size={18} />
              Add Enterprise
            </button>
          </div>

          {loading ? (
            <div className="text-center text-amber-200/60 py-8">Loading enterprises...</div>
          ) : enterprises.length === 0 ? (
            <div className="text-center text-amber-200/60 py-8">No enterprises yet. Add your first enterprise!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enterprises.map((enterprise) => (
                <EnterpriseCard
                  key={enterprise.id}
                  enterprise={enterprise}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Enterprise">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">Income (flat value)</label>
              <input
                type="number"
                value={formData.income ?? ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.incomeLowerLimit != null || formData.incomeUpperLimit != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Income Min (or range)</label>
              <input
                type="number"
                value={formData.incomeLowerLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, incomeLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.income != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Income Max</label>
              <input
                type="number"
                value={formData.incomeUpperLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, incomeUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.income != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">Upkeep Cost (flat value)</label>
              <input
                type="number"
                value={formData.upkeepCost ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCost: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCostLowerLimit != null || formData.upkeepCostUpperLimit != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Upkeep Min (or range)</label>
              <input
                type="number"
                value={formData.upkeepCostLowerLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCostLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCost != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Upkeep Max</label>
              <input
                type="number"
                value={formData.upkeepCostUpperLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCostUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCost != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Notes</label>
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
              onClick={() => setIsCreateModalOpen(false)}
              className="px-6 py-2 border-2 border-amber-700/50 text-amber-100 hover:bg-zinc-800 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 border-2 border-amber-900 font-semibold transition-all"
            >
              Add Enterprise
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Enterprise">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">Income (flat value)</label>
              <input
                type="number"
                value={formData.income ?? ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value === '' ? null : parseInt(e.target.value) })}
                disabled={formData.incomeLowerLimit != null || formData.incomeUpperLimit != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Income Min (or range)</label>
              <input
                type="number"
                value={formData.incomeLowerLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, incomeLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.income != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Income Max</label>
              <input
                type="number"
                value={formData.incomeUpperLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, incomeUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.income != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-100 font-semibold mb-2">Upkeep Cost (flat value)</label>
              <input
                type="number"
                value={formData.upkeepCost ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCost: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCostLowerLimit != null || formData.upkeepCostUpperLimit != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Upkeep Min (or range)</label>
              <input
                type="number"
                value={formData.upkeepCostLowerLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCostLowerLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCost != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-amber-100 font-semibold mb-2 text-sm">Upkeep Max</label>
              <input
                type="number"
                value={formData.upkeepCostUpperLimit ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, upkeepCostUpperLimit: e.target.value === '' ? null : parseInt(e.target.value) })
                }
                disabled={formData.upkeepCost != null}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Notes</label>
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

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Enterprise">
        <div className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}
          <p className="text-amber-100 text-lg">
            Are you sure you want to delete{' '}
            <span className="font-bold text-amber-400">{selectedEnterprise?.name}</span>?
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
              Delete Enterprise
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
