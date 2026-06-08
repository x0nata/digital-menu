import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const categories = useQuery(api.menu.getAllCategories);
  const allItems = useQuery(api.menu.getAllItems);

  const isLoading = categories === undefined || allItems === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-brand-red text-5xl">autorenew</span>
      </div>
    );
  }

  const categoryCount = categories.length;
  const itemCount = allItems.length;

  const stats = [
    {
      label: 'Total Categories',
      value: categoryCount,
      icon: 'category',
      color: 'bg-blue-500/10 text-blue-600',
      action: () => navigate('/admin/categories'),
    },
    {
      label: 'Total Dishes',
      value: itemCount,
      icon: 'restaurant_menu',
      color: 'bg-brand-red/10 text-brand-red',
      action: () => navigate('/admin/dishes'),
    },
    {
      label: 'Categories with Items',
      value: categories.filter(cat =>
        allItems.some(item => item.categoryId === cat.id)
      ).length,
      icon: 'checklist',
      color: 'bg-green-500/10 text-green-600',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            onClick={s.action}
            className="bg-white rounded-2xl border border-surface-variant p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-headline-md text-on-background">{s.value}</p>
            <p className="text-secondary text-sm font-label-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-headline-md text-lg text-on-background mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/dishes')}
            className="inline-flex items-center gap-2 bg-brand-red text-white px-5 py-3 rounded-xl font-label-bold hover:bg-brand-red/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Dish
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center gap-2 bg-surface-variant text-on-surface px-5 py-3 rounded-xl font-label-bold hover:bg-surface-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Category
          </button>
        </div>
      </div>

      {/* Recent Categories */}
      <div>
        <h2 className="font-headline-md text-lg text-on-background mb-4">Categories Overview</h2>
        <div className="bg-white rounded-2xl border border-surface-variant overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-secondary font-label-bold">
              No categories yet. Add one to get started.
            </div>
          ) : (
            <div className="divide-y divide-surface-variant">
              {categories.map(cat => {
                const count = allItems.filter(i => i.categoryId === cat.id).length;
                return (
                  <div key={cat._id} className="flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-variant border border-outline/20 shrink-0">
                        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-headline-md text-sm uppercase text-on-background">{cat.title}</p>
                        <p className="text-xs text-secondary font-label-bold">{cat.tab}</p>
                      </div>
                    </div>
                    <span className="text-sm font-label-bold text-secondary bg-surface-container-low px-3 py-1 rounded-full">
                      {count} {count === 1 ? 'dish' : 'dishes'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
