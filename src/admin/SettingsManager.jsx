import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function TabEditor({ tabs, onChange }) {
  const [input, setInput] = useState("");

  const addTab = () => {
    const trimmed = input.trim();
    if (!trimmed || tabs.includes(trimmed)) return;
    onChange([...tabs, trimmed]);
    setInput("");
  };

  const removeTab = (tab) => {
    onChange(tabs.filter((t) => t !== tab));
  };

  return (
    <div>
      <label className="block font-label-bold text-sm mb-2 text-on-background">
        Tab Names
      </label>
      <p className="text-xs text-secondary mb-3">
        Each tab appears as a filter button on the public menu. "All" is always
        included by default.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-3 py-1.5 rounded-full bg-surface-variant text-on-surface font-label-bold text-sm border-2 border-dashed border-brand-red/40">
          All
        </span>
        {tabs.map((tab) => (
          <span
            key={tab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-red/10 text-brand-red font-label-bold text-sm group"
          >
            {tab}
            <button
              onClick={() => removeTab(tab)}
              className="w-4 h-4 rounded-full hover:bg-brand-red/20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTab())}
          placeholder="New tab name..."
          className="flex-1 p-2.5 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
        />
        <button
          onClick={addTab}
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-brand-red text-white font-label-bold rounded-xl hover:bg-brand-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ThemeEditor({ theme, onChange }) {
  const update = (key, value) => onChange({ ...theme, [key]: value });

  return (
    <div>
      <label className="block font-label-bold text-sm mb-2 text-on-background">
        Theme Colors
      </label>
      <p className="text-xs text-secondary mb-4">
        Customize the brand colors used throughout the menu.
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={theme.brandRed}
              onChange={(e) => update("brandRed", e.target.value)}
              className="w-12 h-12 rounded-xl border border-surface-variant cursor-pointer bg-white p-0.5"
            />
          </div>
          <div className="flex-1">
            <label className="font-label-bold text-xs text-on-background">
              Brand text
            </label>
            <input
              type="text"
              value={theme.brandRed}
              onChange={(e) => update("brandRed", e.target.value)}
              className="block w-full mt-0.5 p-2 border border-surface-variant rounded-lg bg-white focus:outline-none focus:border-brand-red transition-all text-sm font-mono"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={theme.creamy}
              onChange={(e) => update("creamy", e.target.value)}
              className="w-12 h-12 rounded-xl border border-surface-variant cursor-pointer bg-white p-0.5"
            />
          </div>
          <div className="flex-1">
            <label className="font-label-bold text-xs text-on-background">
              Background color (light mode)
            </label>
            <input
              type="text"
              value={theme.creamy}
              onChange={(e) => update("creamy", e.target.value)}
              className="block w-full mt-0.5 p-2 border border-surface-variant rounded-lg bg-white focus:outline-none focus:border-brand-red transition-all text-sm font-mono"
            />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div
            className="w-12 h-12 rounded-xl border border-surface-variant flex items-center justify-center text-xs text-secondary"
            style={{ backgroundColor: theme.creamy }}
          >
            <span style={{ color: theme.brandRed, fontWeight: 700 }}>Aa</span>
          </div>
          <div className="flex-1 text-xs text-secondary">
            Preview of how the colors work together.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsManager() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const seedSettings = useMutation(api.settings.seedSettings);


  const [tabs, setTabs] = useState([]);
  const [taxRate, setTaxRate] = useState(15);
  const [theme, setTheme] = useState({
    brandRed: "#E60000",
    creamy: "#F5EBE0",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (settings) {
      setTabs(settings.tabs);
      setTaxRate(settings.taxRate);
      setTheme(settings.theme);
    }
  }, [settings]);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const handleSave = async () => {
    setError("");
    if (tabs.length === 0) {
      setError("At least one tab is required");
      return;
    }
    if (taxRate < 0 || taxRate > 100) {
      setError("Tax rate must be between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      await updateSettings({ tabs, taxRate, theme });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seedSettings();
      if (result === "Settings already exist") {
        setError("Settings already exist — use the form to update them.");
      }
    } catch (err) {
      setError(err.message || "Failed to seed");
    }
  };

  if (settings === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-brand-red text-5xl">
          autorenew
        </span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">
          settings
        </span>
        <h2 className="font-headline-md text-xl text-on-background mb-2">
          No Settings Found
        </h2>
        <p className="text-secondary font-body-md mb-6">
          Click below to create default settings.
        </p>
        <button
          onClick={handleSeed}
          className="bg-brand-red text-white font-label-bold py-3 px-8 rounded-xl hover:bg-brand-red/90 transition-all"
        >
          Create Default Settings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="font-headline-md text-xl text-on-background mb-1">
          Settings
        </h2>
        <p className="text-sm text-secondary">
          Control how the menu looks and behaves.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-surface-variant p-6 space-y-6">
        <h3 className="font-label-bold text-sm uppercase tracking-wide text-secondary">
          Menu Tabs
        </h3>
        <TabEditor tabs={tabs} onChange={setTabs} />
      </section>

      <section className="bg-white rounded-2xl border border-surface-variant p-6 space-y-4">
        <h3 className="font-label-bold text-sm uppercase tracking-wide text-secondary">
          Tax
        </h3>
        <div>
          <label className="block font-label-bold text-sm mb-1.5 text-on-background">
            Tax Rate (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min="0"
              max="100"
              step="0.5"
              className="w-28 p-2.5 border border-surface-variant rounded-xl bg-white focus:outline-none focus:border-brand-red transition-all"
            />
            <span className="text-secondary text-sm">%</span>
          </div>
          <p className="text-xs text-secondary mt-1.5">
            Applied to the subtotal in the customer's cart.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-surface-variant p-6 space-y-4">
        <h3 className="font-label-bold text-sm uppercase tracking-wide text-secondary">
          Theme
        </h3>
        <ThemeEditor theme={theme} onChange={setTheme} />
      </section>

      {error && (
        <div className="flex items-center gap-2 text-error text-sm font-label-bold bg-error-container py-2.5 px-4 rounded-lg">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-red text-white font-label-bold py-3 px-8 rounded-xl hover:bg-brand-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">
                autorenew
              </span>
              Saving...
            </>
          ) : saved ? (
            <>
              <span className="material-symbols-outlined text-[18px]">
                check
              </span>
              Saved
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}
