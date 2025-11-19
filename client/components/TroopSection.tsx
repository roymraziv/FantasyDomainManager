'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Shield } from 'lucide-react';
import { Troop, CreateTroopDto } from '@/types/models';
import { troopApi } from '@/lib/api';
import TroopCard from './TroopCard';
import Modal from './Modal';

interface TroopSectionProps {
  domainId: number;
  initialTroops?: Troop[];
}

export default function TroopSection({ domainId, initialTroops = [] }: TroopSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [troops, setTroops] = useState<Troop[]>(initialTroops);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTroop, setSelectedTroop] = useState<Troop | null>(null);
  const [formData, setFormData] = useState<CreateTroopDto & { quantity: number | '', wage: number | '' }>({
    type: '',
    quantity: 0,
    wage: 0,
    notes: null,
    domainId,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && troops.length === 0 && initialTroops.length === 0) {
      loadTroops();
    }
  }, [isOpen]);

  const loadTroops = async () => {
    try {
      setLoading(true);
      const data = await troopApi.getByDomainId(domainId);
      setTroops(data);
    } catch (err) {
      console.error('Failed to load troops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.type) {
      setError('Type is required');
      return;
    }

    const quantity = formData.quantity === '' ? 0 : formData.quantity;
    const wage = formData.wage === '' ? 0 : formData.wage;

    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    if (wage < 0) {
      setError('Wage cannot be negative');
      return;
    }

    try {
      const submitData = {
        ...formData,
        quantity,
        wage,
      };
      await troopApi.create(submitData);
      setIsCreateModalOpen(false);
      resetForm();
      loadTroops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create troop');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTroop || !formData.type) {
      setError('Type is required');
      return;
    }

    const quantity = formData.quantity === '' ? 0 : formData.quantity;
    const wage = formData.wage === '' ? 0 : formData.wage;

    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    if (wage < 0) {
      setError('Wage cannot be negative');
      return;
    }

    try {
      const submitData = {
        ...formData,
        quantity,
        wage,
        id: selectedTroop.id,
      };
      await troopApi.update(selectedTroop.id, submitData);
      setIsEditModalOpen(false);
      setSelectedTroop(null);
      resetForm();
      loadTroops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update troop');
    }
  };

  const handleDelete = async () => {
    if (!selectedTroop) return;

    try {
      await troopApi.delete(selectedTroop.id);
      setIsDeleteModalOpen(false);
      setSelectedTroop(null);
      loadTroops();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete troop');
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      quantity: 0,
      wage: 0,
      notes: null,
      domainId,
    });
    setError('');
  };

  const openEditModal = (troop: Troop) => {
    setSelectedTroop(troop);
    setFormData({
      type: troop.type,
      quantity: troop.quantity,
      wage: troop.wage,
      notes: troop.notes,
      domainId: troop.domainId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (troop: Troop) => {
    setSelectedTroop(troop);
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
          <Shield className="text-amber-600" size={24} />
          <h3 className="text-xl font-bold text-amber-100">Troops</h3>
          <span className="text-amber-200/60 text-sm">({troops.length})</span>
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
              Add Troop
            </button>
          </div>

          {loading ? (
            <div className="text-center text-amber-200/60 py-8">Loading troops...</div>
          ) : troops.length === 0 ? (
            <div className="text-center text-amber-200/60 py-8">No troops yet. Add your first troop!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {troops.map((troop) => (
                <TroopCard key={troop.id} troop={troop} onEdit={openEditModal} onDelete={openDeleteModal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Troop">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Type *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Wage</label>
            <input
              type="number"
              min="0"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none min-h-[100px] resize-y"
              placeholder="Add any notes or descriptions..."
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
              Add Troop
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Troop">
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Type *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Wage</label>
            <input
              type="number"
              min="0"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none min-h-[100px] resize-y"
              placeholder="Add any notes or descriptions..."
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Troop">
        <div className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}
          <p className="text-amber-100 text-lg">
            Are you sure you want to delete <span className="font-bold text-amber-400">{selectedTroop?.type}</span>?
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
              Delete Troop
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
