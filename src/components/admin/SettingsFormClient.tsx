'use client';

import React, { useState } from 'react';
import {
  Save,
  Check,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsFormClient({ initialConfig }: { initialConfig: any }) {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<'branding' | 'logistics' | 'payment' | 'courier' | 'sections'>(
    'branding'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        showToast('Store configuration saved to MongoDB Atlas!', 'success');
      } else {
        showToast(data.error || 'Failed to save configuration', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const moveSectionOrder = (id: string, direction: 'up' | 'down') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = [...config.homeSections].sort((a: any, b: any) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const tempOrder = sorted[idx].order;
    sorted[idx].order = sorted[swapIdx].order;
    sorted[swapIdx].order = tempOrder;

    setConfig({ ...config, homeSections: sorted });
  };

  const toggleSection = (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = config.homeSections.map((s: any) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    setConfig({ ...config, homeSections: updated });
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Theme', icon: Sparkles },
    { id: 'logistics', label: 'Logistics & Delivery', icon: Truck },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'courier', label: 'Steadfast Courier', icon: Sliders },
    { id: 'sections', label: 'Homepage Sections', icon: Layers },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-700 text-white text-xs uppercase tracking-widest shadow-2xl rounded-md animate-fade-in">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-850">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Store Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure global store identity, Bangladesh courier logistics, and payment gateways.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-widest transition cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/10"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-900 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-700 shadow-sm'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: BRANDING & THEME
      ====================================================================== */}
      {activeTab === 'branding' && (
        <div className="bg-zinc-900/70 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Brand Identity & Palette
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              These values dynamically theme the storefront header, monogram, and buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Store Name
              </label>
              <input
                type="text"
                value={config.branding?.storeName || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, storeName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Tagline
              </label>
              <input
                type="text"
                value={config.branding?.tagline || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    branding: { ...config.branding, tagline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Accent Gold / Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.branding?.colors?.accent || '#B8860B'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: {
                        ...config.branding,
                        colors: { ...config.branding.colors, accent: e.target.value },
                      },
                    })
                  }
                  className="w-10 h-10 rounded border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={config.branding?.colors?.accent || '#B8860B'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: {
                        ...config.branding,
                        colors: { ...config.branding.colors, accent: e.target.value },
                      },
                    })
                  }
                  className="w-40 font-mono px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <span className="text-[11px] text-zinc-500">
                  Default: <strong className="text-zinc-300">#B8860B</strong> (Antique Gold)
                </span>
              </div>
            </div>

            {/* Theme Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Default Theme Surface
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['LIGHT', 'DARK'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, themeMode: mode },
                      })
                    }
                    className={`py-2.5 text-xs font-bold rounded-md border text-center transition cursor-pointer ${
                      config.branding?.themeMode === mode
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    {mode} MODE
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BANGLADESH LOGISTICS & DELIVERY
      ====================================================================== */}
      {activeTab === 'logistics' && (
        <div className="bg-zinc-900/70 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Logistics & Delivery Fees
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set standard courier rates and free delivery thresholds for Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Inside Dhaka Delivery Fee (৳)
              </label>
              <input
                type="number"
                value={config.logistics?.insideDhakaFee || 70}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    logistics: {
                      ...config.logistics,
                      insideDhakaFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Outside Dhaka Delivery Fee (৳)
              </label>
              <input
                type="number"
                value={config.logistics?.outsideDhakaFee || 130}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    logistics: {
                      ...config.logistics,
                      outsideDhakaFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Free Shipping Threshold (৳)
              </label>
              <input
                type="number"
                value={config.logistics?.freeShippingThreshold || 2500}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    logistics: {
                      ...config.logistics,
                      freeShippingThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
              <span className="text-[11px] text-zinc-500">
                Orders equal or above this amount get free delivery automatically.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Support Phone / Hotline
              </label>
              <input
                type="text"
                value={config.logistics?.supportPhone || '01700000000'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    logistics: {
                      ...config.logistics,
                      supportPhone: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Showroom / Hub Address
              </label>
              <input
                type="text"
                value={config.logistics?.showroomAddress || 'Banani 11, Dhaka, Bangladesh'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    logistics: {
                      ...config.logistics,
                      showroomAddress: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: PAYMENT METHODS
      ====================================================================== */}
      {activeTab === 'payment' && (
        <div className="bg-zinc-900/70 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Payment Gateways & Wallets
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enable Cash on Delivery or Manual bKash/Nagad Send Money options.
            </p>
          </div>

          <div className="space-y-6">
            {/* Cash on Delivery (COD) Card */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cash on Delivery (COD)
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Allow customers across 64 districts in Bangladesh to pay cash to courier.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      cod: {
                        ...config.payment.cod,
                        enabled: !config.payment.cod?.enabled,
                      },
                    },
                  })
                }
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  config.payment?.cod?.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                {config.payment?.cod?.enabled ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            {/* Manual bKash Send Money Card */}
            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                    Manual bKash Send Money
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Customers send money to your bKash personal/merchant wallet and enter TrxID.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      payment: {
                        ...config.payment,
                        manualBkash: {
                          ...config.payment.manualBkash,
                          enabled: !config.payment.manualBkash?.enabled,
                        },
                      },
                    })
                  }
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    config.payment?.manualBkash?.enabled
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {config.payment?.manualBkash?.enabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              {config.payment?.manualBkash?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-900">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      bKash Wallet Number
                    </label>
                    <input
                      type="text"
                      value={config.payment?.manualBkash?.number || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          payment: {
                            ...config.payment,
                            manualBkash: {
                              ...config.payment.manualBkash,
                              number: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={config.payment?.manualBkash?.instructions || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          payment: {
                            ...config.payment,
                            manualBkash: {
                              ...config.payment.manualBkash,
                              instructions: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: STEADFAST COURIER AUTOMATION
      ====================================================================== */}
      {activeTab === 'courier' && (
        <div className="bg-zinc-900/70 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Steadfast Courier API Integration
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automate parcel creation and consignment generation through Steadfast Courier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                API Key
              </label>
              <input
                type="password"
                placeholder="Enter Steadfast API Key"
                value={config.courier?.steadfast?.apiKey || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      steadfast: {
                        ...config.courier.steadfast,
                        apiKey: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Secret Key
              </label>
              <input
                type="password"
                placeholder="Enter Steadfast Secret Key"
                value={config.courier?.steadfast?.secretKey || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      steadfast: {
                        ...config.courier.steadfast,
                        secretKey: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Steadfast API Base URL
              </label>
              <input
                type="text"
                value={config.courier?.steadfast?.baseUrl || 'https://portal.packzy.com/api/v1'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      steadfast: {
                        ...config.courier.steadfast,
                        baseUrl: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: HOMEPAGE SECTIONS MANAGER
      ====================================================================== */}
      {activeTab === 'sections' && (
        <div className="bg-zinc-900/70 border border-zinc-850 rounded-lg p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Homepage Layout Sections
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reorder, show, or hide dynamic storefront components without writing code.
            </p>
          </div>

          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {config.homeSections?.map((section: any, idx: number) => (
              <div
                key={section.id}
                className="p-4 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center">
                    {section.order}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {section.title || section.id}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Type: <span className="font-mono text-zinc-400">{section.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Order Up/Down */}
                  <div className="flex items-center border border-zinc-800 rounded">
                    <button
                      type="button"
                      onClick={() => moveSectionOrder(section.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSectionOrder(section.id, 'down')}
                      disabled={idx === config.homeSections.length - 1}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer border-l border-zinc-800"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                      section.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    {section.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{section.isActive ? 'VISIBLE' : 'HIDDEN'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
