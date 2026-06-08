import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

function parseOrderQR(text) {
  const lines = text.split('\n').filter(Boolean);
  if (!lines[0]?.trim().startsWith('ORDER:')) return null;

  const items = [];
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Subtotal')) break;
    const match = line.match(/^(\d+)x\s+(.+)/);
    if (match) {
      items.push({ quantity: parseInt(match[1]), name: match[2] });
    } else if (!line.startsWith('Tax') && !line.startsWith('Total') && line.length > 0) {
      items.push({ quantity: 1, name: line });
    }
  }

  const summary = { subtotal: '', tax: '', total: '' };
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Subtotal')) summary.subtotal = line.replace('Subtotal: ', '');
    if (line.startsWith('Tax')) summary.tax = line.replace(/Tax \(.*?\): /, '');
    if (line.startsWith('Total')) summary.total = line.replace('Total: ', '');
  }

  return { items, ...summary };
}

export default function WaiterScanner() {
  const [mode, setMode] = useState('idle');
  const [orderData, setOrderData] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const scannerRef = useRef(null);

  const saveOrder = useMutation(api.scannedOrders.saveOrder);
  const discardOrder = useMutation(api.scannedOrders.discardOrder);
  const todayOrders = useQuery(api.scannedOrders.getTodayOrders);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  useEffect(() => {
    if (mode !== 'scanning') return;
    if (scannerRef.current) return;

    let cancelled = false;

    (async () => {
      setCameraError('');
      setError('');
      try {
        scannerRef.current = new Html5Qrcode('qr-scanner');
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 30,
            qrbox: (vw, vh) => ({ width: Math.floor(vw * 0.85), height: Math.floor(vh * 0.85) }),
            aspectRatio: 1,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          },
          (decodedText) => {
            const parsed = parseOrderQR(decodedText);
            if (parsed && parsed.items.length > 0) {
              scannerRef.current?.pause();
              setOrderData(parsed);
              setScanTime(new Date().toLocaleTimeString());
              setMode('scanned');
              saveOrder({ orderData: parsed });
            } else {
              navigator.vibrate?.(100);
              setError('Invalid order QR code');
              setTimeout(() => setError(''), 1500);
            }
          },
          () => {}
        );
      } catch (err) {
        if (!cancelled) {
          setCameraError(err.message || 'Camera access denied or unavailable');
          setMode('idle');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [mode, saveOrder]);

  const startScanning = useCallback(() => {
    setCameraError('');
    setError('');
    setMode('scanning');
  }, []);

  const handleScanAgain = useCallback(async () => {
    setOrderData(null);
    setScanTime(null);
    setError('');
    setMode('scanning');
    try {
      if (scannerRef.current) {
        await scannerRef.current.resume();
      }
    } catch (err) {
      setCameraError(err.message || 'Failed to restart scanner');
      setMode('idle');
    }
  }, []);

  const handleDone = useCallback(async () => {
    await stopScanner();
    setOrderData(null);
    setScanTime(null);
    setMode('idle');
  }, [stopScanner]);

  const handleDiscard = useCallback(async (id) => {
    await discardOrder({ id });
  }, [discardOrder]);

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (mode === 'scanned' && orderData) {
    return (
      <div className="min-h-[100dvh] bg-creamy flex flex-col">
        <div className="flex-1 flex flex-col items-center px-4 sm:px-8 py-10 animate-fade-in">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-pop-in">
                <span className="material-symbols-outlined text-green-600 text-4xl">check</span>
              </div>
              <h1 className="font-headline-md text-3xl text-on-background mb-1">Order Received</h1>
              <p className="text-secondary font-body-md">Scanned at {scanTime}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-surface-variant overflow-hidden">
              <div className="px-5 sm:px-7 py-4 bg-surface-container-low border-b border-surface-variant flex items-center justify-between">
                <span className="font-label-bold text-sm text-secondary uppercase tracking-wide">Items</span>
                <span className="text-xs text-secondary">{orderData.items.length} item{orderData.items.length !== 1 ? 's' : ''}</span>
              </div>

              <ul className="divide-y divide-surface-variant">
                {orderData.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 px-5 sm:px-7 py-4">
                    <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-label-bold flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-body-md text-on-background text-lg">{item.name}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-surface-variant px-5 sm:px-7 py-5 space-y-2">
                {orderData.subtotal && (
                  <div className="flex justify-between text-secondary">
                    <span>Subtotal</span>
                    <span>{orderData.subtotal}</span>
                  </div>
                )}
                {orderData.tax && (
                  <div className="flex justify-between text-secondary">
                    <span>Tax (15%)</span>
                    <span>{orderData.tax}</span>
                  </div>
                )}
                {orderData.total && (
                  <div className="flex justify-between text-lg font-label-bold text-on-background pt-3 border-t border-surface-variant">
                    <span>Total</span>
                    <span className="text-brand-red">{orderData.total}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleScanAgain}
                className="flex-1 bg-brand-red text-white font-label-bold py-4 rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                Scan Next
              </button>
              <button
                onClick={handleDone}
                className="flex-1 bg-white text-on-background font-label-bold py-4 rounded-xl border border-surface-variant hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'scanning') {
    return (
      <div className="min-h-[100dvh] bg-black flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <div id="qr-scanner" className="w-full h-full" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-14 h-14 border-t-[5px] border-l-[5px] border-brand-red rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-14 h-14 border-t-[5px] border-r-[5px] border-brand-red rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-14 h-14 border-b-[5px] border-l-[5px] border-brand-red rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-14 h-14 border-b-[5px] border-r-[5px] border-brand-red rounded-br-2xl" />
                <div className="absolute left-6 right-6 h-[3px] bg-gradient-to-r from-transparent via-brand-red to-transparent animate-scan rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-white/70 text-base mt-8 font-body-md text-center">
            Point camera at the customer's QR code
          </p>

          {error && (
            <div className="mt-4 px-5 py-3 bg-red-500/20 rounded-xl flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
              <span className="text-red-300 text-sm font-label-bold">{error}</span>
            </div>
          )}

          <button
            onClick={handleDone}
            className="mt-8 px-10 py-3.5 rounded-xl bg-white/10 text-white/80 font-label-bold hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>

        <div className="px-6 py-4 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-white/40 text-[18px]">restaurant_menu</span>
          <span className="font-headline-md text-sm text-white/40 tracking-wide uppercase">mmm menu · Waiter</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-creamy flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 sm:px-8 py-8">
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-[32px] bg-brand-red/10 flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-brand-red text-7xl">qr_code_scanner</span>
          </div>

          <h1 className="font-headline-md text-4xl sm:text-5xl lg:text-6xl text-on-background mb-3">Waiter Scanner</h1>
          <p className="text-secondary text-lg sm:text-xl font-body-md mb-10">
            Scan customer order QR codes to view and process orders
          </p>

          {cameraError && (
            <div className="w-full mb-6 px-5 py-4 bg-error-container rounded-xl flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">warning</span>
              <div>
                <p className="text-error font-label-bold">Camera unavailable</p>
                <p className="text-error/80 text-sm mt-0.5">{cameraError}</p>
              </div>
            </div>
          )}

          <button
            onClick={startScanning}
            className="w-full bg-brand-red text-white font-label-bold py-5 rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xl shadow-lg shadow-brand-red/20"
          >
            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
            Start Scanning
          </button>

        </div>

        {/* Today's Orders History */}
        <div className="w-full max-w-2xl mt-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-on-background text-[22px]">history</span>
            <h2 className="font-label-bold text-xl text-on-background">Today's Orders</h2>
            {todayOrders && (
              <span className="text-sm text-secondary font-body-md ml-auto">{todayOrders.length} order{todayOrders.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {!todayOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todayOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-variant px-6 py-10 text-center">
              <span className="material-symbols-outlined text-secondary/40 text-5xl mb-3">receipt_long</span>
              <p className="text-secondary font-body-md">No orders scanned today yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayOrders.map((order) => {
                const isExpanded = expandedOrder === order._id;
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-surface-variant overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-label-bold flex items-center justify-center shrink-0">
                        {order.orderData.items.length}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-label-bold text-on-background truncate">
                          {order.orderData.items.length} item{order.orderData.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-secondary font-body-md mt-0.5">
                          {formatTime(order._creationTime)}
                        </div>
                      </div>
                      {order.orderData.total && (
                        <span className="font-label-bold text-brand-red">{order.orderData.total}</span>
                      )}
                      <span className="material-symbols-outlined text-secondary text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-surface-variant animate-fade-in">
                        <ul className="divide-y divide-surface-variant">
                          {order.orderData.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 px-5 py-3">
                              <span className="w-8 h-8 rounded-lg bg-brand-red/10 text-brand-red text-xs font-label-bold flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-body-md text-on-background">{item.name}</span>
                            </li>
                          ))}
                        </ul>

                        {(order.orderData.subtotal || order.orderData.tax || order.orderData.total) && (
                          <div className="border-t border-surface-variant px-5 py-3 space-y-1 text-sm">
                            {order.orderData.subtotal && (
                              <div className="flex justify-between text-secondary">
                                <span>Subtotal</span>
                                <span>{order.orderData.subtotal}</span>
                              </div>
                            )}
                            {order.orderData.tax && (
                              <div className="flex justify-between text-secondary">
                                <span>Tax</span>
                                <span>{order.orderData.tax}</span>
                              </div>
                            )}
                            {order.orderData.total && (
                              <div className="flex justify-between font-label-bold text-on-background pt-2 border-t border-surface-variant mt-2">
                                <span>Total</span>
                                <span className="text-brand-red">{order.orderData.total}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-variant flex justify-end">
                          <button
                            onClick={() => handleDiscard(order._id)}
                            className="inline-flex items-center gap-1.5 text-sm font-label-bold text-error hover:text-error/80 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-surface-variant">
        <span className="material-symbols-outlined text-secondary text-[18px]">restaurant_menu</span>
        <span className="font-headline-md text-sm text-secondary tracking-wide uppercase">mmm menu</span>
      </div>
    </div>
  );
}
