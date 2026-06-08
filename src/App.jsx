import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { QRCodeSVG } from 'qrcode.react';

function Header({ isDarkMode, toggleDarkMode }) {
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-creamy dark:bg-zinc-950 border-b-2 border-surface-variant dark:border-zinc-800">
      <div className="flex items-center gap-2 active:scale-95 transition-transform duration-150 cursor-pointer">
        <span className="material-symbols-outlined text-brand-red dark:text-red-500">restaurant_menu</span>
      </div>
      <div className="font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-tighter text-2xl font-black text-brand-red dark:text-red-600 italic">
        mmm menu
      </div>
      <div 
        className="flex items-center gap-2 active:scale-95 transition-transform duration-150 cursor-pointer relative"
        onClick={toggleDarkMode}
      >
        <span className="material-symbols-outlined text-brand-red dark:text-red-500 text-[28px]">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="text-center pt-8 pb-4">
      <h1 className="font-headline-xl text-headline-xl text-brand-red italic uppercase">
        more Kimchi
      </h1>
    </section>
  );
}

function CategoryNav({ tabs, activeTab, setActiveTab, onTabChange }) {
  const allTabs = ['All', ...tabs];
  return (
    <nav className="sticky top-[66px] z-40 bg-creamy/95 dark:bg-zinc-950/95 backdrop-blur-md py-4 -mx-6 px-6 mb-8 flex justify-center gap-3 border-b border-surface-variant dark:border-zinc-800 shadow-sm transition-colors duration-300">
      {allTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            onTabChange();
          }}
          className={`px-6 py-2 rounded-full font-label-bold text-label-bold whitespace-nowrap transition-all border-2 border-brand-red active:scale-95 ${
            activeTab === tab
              ? 'bg-brand-red text-white'
              : 'text-brand-red hover:bg-brand-red/10'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

function SubCategoryCard({ subCategory, onClick }) {
  // Use the pre-calculated item count if available, otherwise array length
  const itemCount = subCategory.itemCount ?? (subCategory.items?.length || 0);
  
  return (
    <div 
      onClick={onClick}
      className="relative h-32 md:h-48 rounded-xl overflow-hidden cursor-pointer group shadow-md active:scale-95 transition-transform"
    >
      <img 
        src={subCategory.image} 
        alt={subCategory.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2 text-center">
        <h3 className="font-headline-md text-sm md:text-2xl uppercase tracking-wider mb-1 md:mb-2 drop-shadow-md leading-tight">
          {subCategory.title}
        </h3>
        <span className="font-label-bold text-[10px] md:text-sm bg-brand-red/90 px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-sm">
          {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
        </span>
      </div>
    </div>
  );
}

function MenuItem({ item, onAddToCart }) {
  // Parse numeric price for display if needed
  const priceValue = parseInt(item.price.replace(/\D/g, '')) || 0;

  return (
    <div className="group flex items-center justify-between p-sm border-b border-surface-variant dark:border-zinc-800 transition-colors hover:bg-white/50 dark:hover:bg-zinc-900/50 duration-300">
      <div className="flex-1 pr-md">
        <h3 className="font-headline-md text-headline-md uppercase mb-xs group-hover:text-brand-red transition-colors dark:text-zinc-100">
          {item.title}
        </h3>
        <p className="font-body-md text-body-md text-secondary dark:text-zinc-400 mb-xs">
          {item.description}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-label-bold text-label-bold text-brand-red">{item.price}</span>
          <button 
            onClick={() => onAddToCart({ ...item, numericPrice: priceValue })}
            className="flex items-center gap-1 bg-surface-variant dark:bg-zinc-800 hover:bg-surface-dim dark:hover:bg-zinc-700 active:scale-95 text-on-surface dark:text-zinc-200 px-3 py-1 rounded-full font-label-bold text-xs transition-transform duration-300"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add
          </button>
        </div>
      </div>
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-transparent flex-shrink-0 shadow-md">
        <img
          alt={item.imgAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={item.imgSrc}
        />
      </div>
    </div>
  );
}

function CategoryItemsList({ subCategory, onBack, onAddToCart }) {
  // Fetch the actual items for this subcategory from Convex
  const items = useQuery(api.menu.getItemsForCategory, { categoryId: subCategory.id });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-brand-red font-label-bold px-4 py-2 rounded-full hover:bg-brand-red/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <h2 className="flex-1 text-center font-headline-md text-headline-md uppercase mr-[90px]">
          {subCategory.title}
        </h2>
      </div>
      
      {items === undefined ? (
        <div className="flex justify-center p-8">
          <p className="text-brand-red font-label-bold text-base animate-pulse">loading...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center p-8 text-secondary font-label-bold">No dishes found in this category.</div>
      ) : (
        <div className="space-y-gutter">
          {items.map((item) => (
            <MenuItem key={item._id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });

  const settings = useQuery(api.settings.getSettings);
  const tabs = settings?.tabs ?? ['Appetizers', 'Main', 'Drinks'];
  const taxRate = settings?.taxRate ?? 15;

  const [activeTab, setActiveTab] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Sync activeTab when tabs change — reset to 'All' if current tab no longer exists
  useEffect(() => {
    if (settings && activeTab !== 'All' && !tabs.includes(activeTab)) {
      setActiveTab('All');
    }
  }, [tabs, activeTab, settings]);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlacedQR, setOrderPlacedQR] = useState(null);

  const currentCategories = useQuery(
    api.menu.getCategories,
    activeTab === 'All' ? {} : { tab: activeTab }
  );

  const handleTabChange = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSubCategory(null);
  };

  const handleBack = () => {
    setActiveSubCategory(null);
  };

  // Cart functions
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      return prev.map(i => {
        if (i._id === id) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : null;
        }
        return i;
      }).filter(Boolean); // removes nulls (items that went to 0)
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.numericPrice * item.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // Create a text summary for the QR Code
    const orderLines = cart.map(c => `${c.quantity}x ${c.title}`).join('\n');
    const qrData = `ORDER:\n${orderLines}\n\nSubtotal: ${subtotal.toFixed(0)} ETB\nTax (${taxRate}%): ${tax.toFixed(0)} ETB\nTotal: ${total.toFixed(0)} ETB`;
    
    setOrderPlacedQR(qrData);
    setIsOrderPlaced(true);
  };

  const resetOrder = () => {
    setCart([]);
    setOrderPlacedQR(null);
    setIsOrderPlaced(false);
    setIsCartOpen(false);
  };

  return (
    <div className={`bg-creamy dark:bg-zinc-950 text-on-background dark:text-zinc-100 font-body-md min-h-[100dvh] transition-colors duration-300 ${totalItems > 0 ? 'pb-28' : 'pb-8'}`}>
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="max-w-4xl mx-auto px-margin relative">
        <Hero />
        <CategoryNav 
          tabs={tabs}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onTabChange={handleTabChange} 
        />
        
        {activeSubCategory ? (
          <CategoryItemsList subCategory={activeSubCategory} onBack={handleBack} onAddToCart={addToCart} />
        ) : currentCategories === undefined ? (
          <div className="flex justify-center p-12">
            <p className="text-brand-red font-label-bold text-lg animate-pulse">loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-in fade-in duration-300">
            {currentCategories.map((subCategory) => (
              <SubCategoryCard 
                key={subCategory._id} 
                subCategory={subCategory} 
                onClick={() => setActiveSubCategory(subCategory)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button (visible if cart has items) */}
      {totalItems > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-brand-red text-white p-4 rounded-full shadow-xl hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center z-40 group"
        >
          <span className="material-symbols-outlined text-[28px]">shopping_cart_checkout</span>
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-label-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-creamy">
            {totalItems}
          </span>
        </button>
      )}

      {/* Cart Modal / Slide-over */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => !isOrderPlaced && setIsCartOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute top-0 right-0 h-[100dvh] w-[90vw] max-w-[400px] bg-creamy dark:bg-zinc-950 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-variant dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 transition-colors duration-300">
              <h2 className="font-headline-md text-xl md:text-2xl uppercase text-brand-red">
                {isOrderPlaced ? "Order Summary" : "Your Order"}
              </h2>
              {!isOrderPlaced && (
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full bg-surface-container-low dark:bg-zinc-800 hover:bg-surface-variant dark:hover:bg-zinc-700 text-on-background dark:text-zinc-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {isOrderPlaced ? (
                <div className="flex flex-col items-center animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-zinc-200 p-4 rounded-3xl shadow-sm border-2 border-outline-variant dark:border-transparent mb-4 shrink-0 transition-colors duration-300">
                    <QRCodeSVG 
                      value={orderPlacedQR} 
                      size={180}
                      bgColor={isDarkMode ? "#e4e4e7" : "#ffffff"}
                      fgColor={"#1b1b1b"}
                      level={"L"}
                    />
                  </div>
                  <p className="text-brand-red text-center mb-6 font-label-bold px-4 text-sm uppercase">
                    Scan at the counter to order
                  </p>
                  
                  <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-surface-variant dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="bg-surface-container-low dark:bg-zinc-800 px-4 py-3 border-b border-surface-variant dark:border-zinc-800 font-headline-md text-sm uppercase text-secondary dark:text-zinc-400 transition-colors duration-300">Items</div>
                    <ul className="divide-y divide-surface-variant dark:divide-zinc-800">
                      {cart.map((item) => (
                        <li key={item._id} className="p-3 flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3 text-on-background dark:text-zinc-100">
                            <span className="font-label-bold text-brand-red bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md">{item.quantity}x</span>
                            <span className="font-headline-md uppercase">{item.title}</span>
                          </div>
                          <span className="text-secondary dark:text-zinc-400 font-label-bold shrink-0">{(item.numericPrice * item.quantity).toFixed(0)} ETB</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-surface-container-lowest dark:bg-zinc-950/50 p-4 border-t border-surface-variant dark:border-zinc-800 space-y-2 transition-colors duration-300">
                      <div className="flex justify-between text-secondary dark:text-zinc-400 text-sm font-label-bold">
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(0)} ETB</span>
                      </div>
                      <div className="flex justify-between text-secondary dark:text-zinc-400 text-sm font-label-bold">
                        <span>Tax ({taxRate}%)</span>
                        <span>{tax.toFixed(0)} ETB</span>
                      </div>
                      <div className="flex justify-between font-headline-md text-xl pt-3 mt-3 border-t border-surface-variant dark:border-zinc-800 text-on-background dark:text-zinc-100">
                        <span>Total</span>
                        <span className="text-brand-red">{total.toFixed(0)} ETB</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-secondary dark:text-zinc-500">
                  <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">shopping_basket</span>
                  <p className="font-label-bold text-lg">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-surface-variant dark:border-zinc-800 shadow-sm transition-colors duration-300">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-variant dark:bg-zinc-800 shrink-0 border border-outline/20 dark:border-zinc-700 transition-colors duration-300">
                        <img src={item.imgSrc} alt={item.imgAlt} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-headline-md text-sm sm:text-base uppercase leading-tight truncate text-on-background dark:text-zinc-100">{item.title}</h4>
                        <div className="text-brand-red font-label-bold text-xs sm:text-sm mt-1">{item.price}</div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 bg-surface-container-low dark:bg-zinc-800 rounded-full p-1 shrink-0 border border-surface-variant dark:border-zinc-700 transition-colors duration-300">
                        <button 
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center text-on-surface dark:text-zinc-200 hover:text-brand-red transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                        </button>
                        <span className="font-label-bold w-5 sm:w-6 text-center text-sm text-on-background dark:text-zinc-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center text-on-surface dark:text-zinc-200 hover:text-brand-red transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-surface-variant dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 transition-colors duration-300">
              {isOrderPlaced ? (
                <button 
                  onClick={resetOrder}
                  className="w-full bg-surface-container-high dark:bg-zinc-800 text-on-surface dark:text-zinc-100 font-label-bold py-4 rounded-xl hover:bg-surface-dim dark:hover:bg-zinc-700 transition-colors uppercase tracking-wide"
                >
                  Start New Order
                </button>
              ) : cart.length > 0 ? (
                <>
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-secondary dark:text-zinc-400 font-label-bold text-sm">
                      <span>Subtotal</span>
                      <span>{subtotal.toFixed(0)} ETB</span>
                    </div>
                    <div className="flex justify-between text-secondary dark:text-zinc-400 font-label-bold text-sm">
                      <span>Tax ({taxRate}%)</span>
                      <span>{tax.toFixed(0)} ETB</span>
                    </div>
                    <div className="flex justify-between font-headline-md text-xl pt-3 border-t border-surface-variant dark:border-zinc-800 text-on-background dark:text-zinc-100">
                      <span>Total</span>
                      <span className="text-brand-red">{total.toFixed(0)} ETB</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-brand-red text-white font-label-bold py-4 rounded-xl hover:bg-brand-red/90 transition-colors uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-brand-red/20 active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                    Place Order
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;