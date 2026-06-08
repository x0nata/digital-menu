import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ImageUploader from './ImageUploader';

const defaultForm = {
  categoryId: '',
  title: '',
  description: '',
  price: '',
  imgSrc: '',
  imgAlt: '',
};

export default function DishesManager() {
  const categories = useQuery(api.menu.getAllCategories);
  const allItems = useQuery(api.menu.getAllItems);

  const addMenuItem = useMutation(api.menu.addMenuItem);
  const updateMenuItem = useMutation(api.menu.updateMenuItem);
  const deleteMenuItem = useMutation(api.menu.deleteMenuItem);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [validationError, setValidationError] = useState('');

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ...defaultForm,
      categoryId: categoryFilter || categories?.[0]?.id || '',
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setForm({
      categoryId: item.categoryId,
      title: item.title,
      description: item.description,
      price: item.price,
      imgSrc: item.imgSrc,
      imgAlt: item.imgAlt,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ ...defaultForm });
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!form.categoryId) { setValidationError('Please select a category'); return; }
    if (!form.title) { setValidationError('Please enter a dish name'); return; }
    if (!form.price) { setValidationError('Please enter a price'); return; }
    if (!form.imgSrc) { setValidationError('Please upload or paste an image URL'); return; }

    setSaving(true);
    try {
      if (isEditing) {
        await updateMenuItem({
          id: editingId,
          categoryId: form.categoryId,
          title: form.title,
          description: form.description,
          price: form.price,
          imgSrc: form.imgSrc,
          imgAlt: form.imgAlt || form.title,
        });
      } else {
        await addMenuItem({
          categoryId: form.categoryId,
          title: form.title,
          description: form.description,
          price: form.price,
          imgSrc: form.imgSrc,
          imgAlt: form.imgAlt || form.title,
        });
      }
      closeModal();
    } catch (err) {
      alert('Failed to save dish: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMenuItem({ id: deleteTarget });
    } catch (err) {
      alert('Failed to delete dish: ' + err.message);
    }
    setDeleteTarget(null);
  };

  const filteredItems = allItems?.filter(item => {
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isLoading = categories === undefined || allItems === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-brand-red text-5xl">autorenew</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all font-body-md text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all font-body-md text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.id}>{cat.tab} - {cat.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-xl font-label-bold hover:bg-brand-red/90 transition-colors shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Dish
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-variant overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-secondary font-label-bold">
            {allItems.length === 0
              ? 'No dishes yet. Add one to get started.'
              : 'No dishes match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low">
                  <th className="text-left px-5 py-3 font-label-bold text-xs text-secondary uppercase tracking-wider">Image</th>
                  <th className="text-left px-5 py-3 font-label-bold text-xs text-secondary uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 font-label-bold text-xs text-secondary uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-5 py-3 font-label-bold text-xs text-secondary uppercase tracking-wider">Price</th>
                  <th className="text-right px-5 py-3 font-label-bold text-xs text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {filteredItems.map(item => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  return (
                    <tr key={item._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-5 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-variant border border-outline/20">
                          <img src={item.imgSrc} alt={item.imgAlt} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-headline-md text-sm uppercase text-on-background leading-tight">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-secondary mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs font-label-bold text-secondary bg-surface-variant px-2 py-1 rounded-md">{cat?.title || item.categoryId}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-label-bold text-brand-red text-sm">{item.price}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="w-9 h-9 rounded-lg bg-surface-variant text-secondary hover:text-on-background hover:bg-surface-dim flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item._id)}
                            className="w-9 h-9 rounded-lg bg-error-container text-error hover:bg-red-200 flex items-center justify-center transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-xl text-brand-red">{isEditing ? 'Edit Dish' : 'Add Dish'}</h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-lg bg-surface-variant text-secondary hover:text-on-background flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.id}>{cat.tab} - {cat.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Dish Name *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. SPICY RAMEN"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Delicious hot noodles..."
                  rows="3"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all resize-none"
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Price *</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 450 ETB"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Image *</label>
                <ImageUploader
                  currentImage={form.imgSrc}
                  onUpload={(url) => setForm(prev => ({ ...prev, imgSrc: url }))}
                  onRemove={() => setForm(prev => ({ ...prev, imgSrc: '' }))}
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Or paste image URL</label>
                <input
                  type="text"
                  value={form.imgSrc}
                  onChange={e => setForm(prev => ({ ...prev, imgSrc: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Alt Text</label>
                <input
                  type="text"
                  value={form.imgAlt}
                  onChange={e => setForm({ ...form, imgAlt: e.target.value })}
                  placeholder="e.g. Spicy ramen bowl"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                />
              </div>

              {validationError && (
                <div className="flex items-center gap-1.5 text-error text-sm font-label-bold bg-error-container py-2.5 px-4 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {validationError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-red text-white font-label-bold py-3 rounded-xl hover:bg-brand-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                  ) : (
                    isEditing ? 'Update Dish' : 'Add Dish'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 bg-surface-variant text-on-surface font-label-bold py-3 rounded-xl hover:bg-surface-dim transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-error text-3xl">delete</span>
              </div>
              <h3 className="font-headline-md text-lg text-on-background mb-2">Delete Dish</h3>
              <p className="text-secondary text-sm mb-6">Are you sure you want to delete this dish? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-3 bg-surface-variant text-on-surface font-label-bold rounded-xl hover:bg-surface-dim transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-error text-white font-label-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
