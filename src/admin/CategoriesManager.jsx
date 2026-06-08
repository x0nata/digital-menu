import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ImageUploader from './ImageUploader';

const DEFAULT_TABS = ['Main', 'Drinks'];

const defaultForm = {
  tab: '',
  id: '',
  title: '',
  image: '',
};

export default function CategoriesManager() {
  const categories = useQuery(api.menu.getAllCategories);
  const settings = useQuery(api.settings.getSettings);
  const TABS = settings?.tabs ?? DEFAULT_TABS;

  const addCategory = useMutation(api.menu.addCategory);
  const updateCategory = useMutation(api.menu.updateCategory);
  const deleteCategory = useMutation(api.menu.deleteCategory);

  const [tabFilter, setTabFilter] = useState('');
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
    setForm({ ...defaultForm });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat._id);
    setForm({
      tab: cat.tab,
      id: cat.id,
      title: cat.title,
      image: cat.image,
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
    if (!form.tab) { setValidationError('Please select a tab'); return; }
    if (!form.title) { setValidationError('Please enter a category title'); return; }
    if (!form.id) { setValidationError('Please enter a URL slug'); return; }
    if (!form.image) { setValidationError('Please upload or paste an image URL'); return; }

    setSaving(true);
    try {
      if (isEditing) {
        await updateCategory({
          _id: editingId,
          tab: form.tab,
          id: form.id,
          title: form.title,
          image: form.image,
        });
      } else {
        await addCategory({
          tab: form.tab,
          id: form.id,
          title: form.title,
          image: form.image,
        });
      }
      closeModal();
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory({ id: deleteTarget });
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
    setDeleteTarget(null);
  };

  const filteredCategories = categories?.filter(cat =>
    !tabFilter || cat.tab === tabFilter
  );

  const isLoading = categories === undefined;

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTabFilter('')}
            className={`px-4 py-2 rounded-full font-label-bold text-sm transition-colors ${
              !tabFilter
                ? 'bg-brand-red text-white'
                : 'bg-surface-variant text-secondary hover:bg-surface-dim'
            }`}
          >
            All
          </button>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`px-4 py-2 rounded-full font-label-bold text-sm transition-colors ${
                tabFilter === tab
                  ? 'bg-brand-red text-white'
                  : 'bg-surface-variant text-secondary hover:bg-surface-dim'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-xl font-label-bold hover:bg-brand-red/90 transition-colors shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Category
        </button>
      </div>

      {/* Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center text-secondary font-label-bold">
          {categories.length === 0
            ? 'No categories yet. Add one to get started.'
            : 'No categories match the selected tab.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl border border-surface-variant overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-headline-md text-sm uppercase text-white drop-shadow-md">{cat.title}</h3>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-label-bold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                  {cat.tab}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-secondary font-label-bold">Slug: {cat.id}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-8 h-8 rounded-lg bg-surface-variant text-secondary hover:text-on-background hover:bg-surface-dim flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat._id)}
                    className="w-8 h-8 rounded-lg bg-error-container text-error hover:bg-red-200 flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-xl text-brand-red">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="w-9 h-9 rounded-lg bg-surface-variant text-secondary hover:text-on-background flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Tab *</label>
                <select
                  value={form.tab}
                  onChange={e => setForm({ ...form, tab: e.target.value })}
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                >
                  <option value="" disabled>Select a tab</option>
                  {TABS.map(tab => (
                    <option key={tab} value={tab}>{tab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sushi & Rolls"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">URL Slug (ID) *</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={e => setForm({ ...form, id: e.target.value })}
                  placeholder="e.g. sushi-rolls"
                  className="w-full p-4 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
                  required
                  disabled={isEditing}
                />
                <p className="text-xs text-secondary mt-1">Unique identifier used in URLs. Cannot be changed after creation.</p>
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Image *</label>
                <ImageUploader
                  currentImage={form.image}
                  onUpload={(url) => setForm(prev => ({ ...prev, image: url }))}
                  onRemove={() => setForm(prev => ({ ...prev, image: '' }))}
                />
              </div>

              <div>
                <label className="block font-label-bold text-sm mb-1.5 text-on-background">Or paste image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
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
                    isEditing ? 'Update Category' : 'Add Category'
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
              <h3 className="font-headline-md text-lg text-on-background mb-2">Delete Category</h3>
              <p className="text-secondary text-sm mb-6">Are you sure? Items in this category may become orphaned.</p>
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
