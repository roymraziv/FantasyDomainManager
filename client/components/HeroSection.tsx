'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, User } from 'lucide-react';
import { Hero, CreateHeroDto } from '@/types/models';
import { heroApi } from '@/lib/api';
import HeroCard from './HeroCard';
import Modal from './Modal';

interface HeroSectionProps {
  domainId: string;
  initialHeroes?: Hero[];
}

export default function HeroSection({ domainId, initialHeroes = [] }: HeroSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [heroes, setHeroes] = useState<Hero[]>(initialHeroes);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [formData, setFormData] = useState<Omit<CreateHeroDto, 'level' | 'wage'> & { level: number | '', wage: number | '' }>({
    name: '',
    role: '',
    class: '',
    level: 1,
    wage: 0,
    notes: null,
    domainId,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && heroes.length === 0 && initialHeroes.length === 0) {
      loadHeroes();
    }
  }, [isOpen]);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      const data = await heroApi.getByDomainId(domainId);
      setHeroes(data);
    } catch (err) {
      console.error('Failed to load heroes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.role || !formData.class) {
      setError('Name, Role, and Class are required');
      return;
    }

    // Validate max lengths
    if (formData.name.length > 100) {
      setError('Name must not exceed 100 characters');
      return;
    }

    if (formData.role.length > 100) {
      setError('Role must not exceed 100 characters');
      return;
    }

    if (formData.class.length > 50) {
      setError('Class must not exceed 50 characters');
      return;
    }

    if (formData.notes && formData.notes.length > 1000) {
      setError('Notes must not exceed 1000 characters');
      return;
    }

    const level = typeof formData.level === 'string' ? 1 : formData.level;
    const wage = typeof formData.wage === 'string' ? 0 : formData.wage;

    if (level <= 0) {
      setError('Level must be greater than 0');
      return;
    }

    if (wage < 0) {
      setError('Wage must be a positive value');
      return;
    }

    try {
      const submitData = {
        ...formData,
        level,
        wage,
      };
      await heroApi.create(submitData);
      setIsCreateModalOpen(false);
      resetForm();
      loadHeroes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create hero');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedHero || !formData.name || !formData.role || !formData.class) {
      setError('Name, Role, and Class are required');
      return;
    }

    // Validate max lengths
    if (formData.name.length > 100) {
      setError('Name must not exceed 100 characters');
      return;
    }

    if (formData.role.length > 100) {
      setError('Role must not exceed 100 characters');
      return;
    }

    if (formData.class.length > 50) {
      setError('Class must not exceed 50 characters');
      return;
    }

    if (formData.notes && formData.notes.length > 1000) {
      setError('Notes must not exceed 1000 characters');
      return;
    }

    const level = typeof formData.level === 'string' ? 1 : formData.level;
    const wage = typeof formData.wage === 'string' ? 0 : formData.wage;

    if (level <= 0) {
      setError('Level must be greater than 0');
      return;
    }

    if (wage < 0) {
      setError('Wage must be a positive value');
      return;
    }

    try {
      const submitData = {
        ...formData,
        level,
        wage,
        id: selectedHero.id,
      };
      await heroApi.update(selectedHero.id, submitData);
      setIsEditModalOpen(false);
      setSelectedHero(null);
      resetForm();
      loadHeroes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hero');
    }
  };

  const handleDelete = async () => {
    if (!selectedHero) return;

    try {
      await heroApi.delete(selectedHero.id);
      setIsDeleteModalOpen(false);
      setSelectedHero(null);
      loadHeroes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete hero');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      class: '',
      level: 1,
      wage: 0,
      notes: null,
      domainId,
    });
    setError('');
  };

  const openEditModal = (hero: Hero) => {
    setSelectedHero(hero);
    setFormData({
      name: hero.name,
      role: hero.role,
      class: hero.class,
      level: hero.level,
      wage: hero.wage,
      notes: hero.notes,
      domainId: hero.domainId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (hero: Hero) => {
    setSelectedHero(hero);
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
          <User className="text-amber-600" size={24} />
          <h3 className="text-xl font-bold text-amber-100">Heroes</h3>
          <span className="text-amber-200/60 text-sm">({heroes.length})</span>
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
              Add Hero
            </button>
          </div>

          {loading ? (
            <div className="text-center text-amber-200/60 py-8">Loading heroes...</div>
          ) : heroes.length === 0 ? (
            <div className="text-center text-amber-200/60 py-8">No heroes yet. Add your first hero!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroes.map((hero) => (
                <HeroCard key={hero.id} hero={hero} onEdit={openEditModal} onDelete={openDeleteModal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Hero">
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

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Role *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Class *</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              placeholder="e.g., Fighter, Wizard, Rogue"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Level *</label>
            <input
              type="number"
              min="1"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Wage *</label>
            <input
              type="number"
              min="0"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
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
              Add Hero
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Hero">
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

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Role *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Class *</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              placeholder="e.g., Fighter, Wizard, Rogue"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Level *</label>
            <input
              type="number"
              min="1"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-amber-100 font-semibold mb-2">Wage *</label>
            <input
              type="number"
              min="0"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value === '' ? '' : parseInt(e.target.value) })}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none"
              required
            />
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
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Hero">
        <div className="space-y-4">
          {error && <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">{error}</div>}
          <p className="text-amber-100 text-lg">
            Are you sure you want to delete <span className="font-bold text-amber-400">{selectedHero?.name}</span>?
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
              Delete Hero
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
