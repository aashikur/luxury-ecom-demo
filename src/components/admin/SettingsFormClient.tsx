'use client';

import React, { useState } from 'react';
import {
  Save,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  Sliders,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Activity,
  ToggleLeft,
  ShieldAlert,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  Textarea,
  Badge,
  Breadcrumb,
} from '@/components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsFormClient({ initialConfig }: { initialConfig: any }) {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<
    'branding' | 'logistics' | 'payment' | 'courier' | 'tracking' | 'sections' | 'features'
  >('branding');
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
        showToast('Store settings saved successfully', 'success');
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
    const sorted = [...(config.homeSections || [])].sort((a: any, b: any) => a.order - b.order);
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
    const updated = (config.homeSections || []).map((s: any) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    setConfig({ ...config, homeSections: updated });
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Identity', icon: Sparkles },
    { id: 'logistics', label: 'Logistics & Contacts', icon: Truck },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'courier', label: 'Courier & Fraud Shield', icon: ShieldAlert },
    { id: 'tracking', label: 'Marketing & Pixels', icon: Activity },
    { id: 'sections', label: 'Homepage Layout', icon: Layers },
    { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
  ];

  return (
    <div className="w-full space-y-6 max-w-6xl pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-[#060d11] border border-slate-700 text-white text-xs uppercase tracking-wider shadow-2xl rounded-md animate-fade-in">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error' ? 'bg-rose-500' : 'bg-[#076E46]'
            }`}
          />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header and Breadcrumbs */}
      <div className="space-y-2">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Settings', href: '/admin/settings' },
            {
              label: tabs.find((t) => t.id === activeTab)?.label || 'General',
            },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#060d11]">Store Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage global store identity, Bangladesh delivery charges, payment gateways, and courier fraud rules.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#076E46] text-white hover:bg-[#055C3A] inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-100 text-[#060d11] font-semibold border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-[#060d11] hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#076E46]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: BRANDING & IDENTITY
      ====================================================================== */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Store title, tagline, logo URLs, and niche categorization.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Store Name</label>
                <Input
                  value={config.branding?.storeName || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, storeName: e.target.value },
                    })
                  }
                  placeholder="e.g. Aurem Luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Tagline</label>
                <Input
                  value={config.branding?.tagline || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, tagline: e.target.value },
                    })
                  }
                  placeholder="e.g. Engineered Streetwear & Minimal Garments"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Store Niche</label>
                <Select
                  value={config.branding?.storeNiche || 'CLOTHING'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, storeNiche: e.target.value },
                    })
                  }
                >
                  <option value="CLOTHING">Clothing & Streetwear Apparel</option>
                  <option value="GADGETS">Gadgets, Electronics & Accessories</option>
                  <option value="FOOD">Food & Beverage Items</option>
                  <option value="GENERAL">General Multi-Niche Store</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Store Architecture Mode</label>
                <Select
                  value={config.branding?.storeMode || 'MULTI_PRODUCT'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, storeMode: e.target.value },
                    })
                  }
                >
                  <option value="MULTI_PRODUCT">Multi-Product Catalog Store</option>
                  <option value="SINGLE_PRODUCT_FUNNEL">Single-Product Funnel</option>
                </Select>
              </div>

              {config.branding?.storeMode === 'SINGLE_PRODUCT_FUNNEL' && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#060d11]">
                    Featured Product Slug (Landing Hero)
                  </label>
                  <Input
                    value={config.branding?.featuredProductSlug || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, featuredProductSlug: e.target.value },
                      })
                    }
                    placeholder="e.g. heavyweight-acid-wash-hoodie"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Logo Image URL</label>
                <Input
                  value={config.branding?.logo?.url || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: {
                        ...config.branding,
                        logo: { ...config.branding.logo, url: e.target.value },
                      },
                    })
                  }
                  placeholder="https://your-r2-cdn.com/logo.png"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Favicon URL</label>
                <Input
                  value={config.branding?.favicon?.url || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: {
                        ...config.branding,
                        favicon: { ...config.branding.favicon, url: e.target.value },
                      },
                    })
                  }
                  placeholder="https://your-r2-cdn.com/favicon.ico"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Currency Symbol</label>
                <Input
                  value={config.branding?.currencySymbol || '৳'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, currencySymbol: e.target.value },
                    })
                  }
                  placeholder="৳"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Currency Code</label>
                <Input
                  value={config.branding?.currencyCode || 'BDT'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, currencyCode: e.target.value },
                    })
                  }
                  placeholder="BDT"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme Tokens & Layout</CardTitle>
              <CardDescription>
                Primary accent color, surface mode, and top announcement banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Accent Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.branding?.colors?.accent || '#076E46'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: {
                          ...config.branding,
                          colors: { ...config.branding.colors, accent: e.target.value },
                        },
                      })
                    }
                    className="w-10 h-10 rounded border border-slate-300 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={config.branding?.colors?.accent || '#076E46'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: {
                          ...config.branding,
                          colors: { ...config.branding.colors, accent: e.target.value },
                        },
                      })
                    }
                    className="font-mono text-xs w-36"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Default Theme Mode</label>
                <Select
                  value={config.branding?.themeMode || 'LIGHT'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, themeMode: e.target.value },
                    })
                  }
                >
                  <option value="LIGHT">Light Theme</option>
                  <option value="DARK">Dark Theme</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Hero Banner Variant</label>
                <Select
                  value={config.branding?.heroVariant || 'CENTER'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, heroVariant: e.target.value },
                    })
                  }
                >
                  <option value="CENTER">Center Clean Layout</option>
                  <option value="SPLIT">Split Dual-Column Layout</option>
                  <option value="FULL_SLIDER">Full-Width Slider</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Announcement Bar</label>
                <Select
                  value={config.branding?.announcementBarEnabled ? 'true' : 'false'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: {
                        ...config.branding,
                        announcementBarEnabled: e.target.value === 'true',
                      },
                    })
                  }
                >
                  <option value="true">Active (Show Top Marquee)</option>
                  <option value="false">Disabled</option>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">Announcement Bar Text</label>
                <Input
                  value={config.branding?.announcementBarText || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, announcementBarText: e.target.value },
                    })
                  }
                  placeholder="e.g. Free express delivery across Bangladesh on orders over ৳2,500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 2: LOGISTICS & CONTACTS
      ====================================================================== */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Rates (Bangladesh)</CardTitle>
              <CardDescription>
                Configure regional courier delivery tariffs and free shipping threshold.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Inside Dhaka (৳)</label>
                <Input
                  type="number"
                  value={config.logistics?.insideDhakaFee ?? 70}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        insideDhakaFee: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">
                  Dhaka Suburbs (Gazipur, Savar, Narayanganj) (৳)
                </label>
                <Input
                  type="number"
                  value={config.logistics?.suburbsDhakaFee ?? 100}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        suburbsDhakaFee: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Outside Dhaka (৳)</label>
                <Input
                  type="number"
                  value={config.logistics?.outsideDhakaFee ?? 130}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        outsideDhakaFee: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Free Shipping Policy</label>
                <Select
                  value={config.logistics?.isFreeShippingEnabled !== false ? 'true' : 'false'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        isFreeShippingEnabled: e.target.value === 'true',
                      },
                    })
                  }
                >
                  <option value="true">Active (Enable Progress Bar)</option>
                  <option value="false">Disabled</option>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">Free Shipping Threshold (৳)</label>
                <Input
                  type="number"
                  value={config.logistics?.freeShippingThreshold ?? 2500}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        freeShippingThreshold: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Contacts & Helpdesk</CardTitle>
              <CardDescription>
                Hotline numbers, WhatsApp chat link, email, and showroom address.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Support Phone / Hotline</label>
                <Input
                  value={config.logistics?.supportPhone || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        supportPhone: e.target.value,
                      },
                    })
                  }
                  placeholder="01700000000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">WhatsApp Order Hotline</label>
                <Input
                  value={config.logistics?.whatsappNumber || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        whatsappNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="8801700000000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Support Email</label>
                <Input
                  value={config.logistics?.supportEmail || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        supportEmail: e.target.value,
                      },
                    })
                  }
                  placeholder="support@aurem.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Helpline Hours</label>
                <Input
                  value={config.logistics?.helplineHours || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        helplineHours: e.target.value,
                      },
                    })
                  }
                  placeholder="10:00 AM - 10:00 PM (Everyday)"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">Showroom / Outlet Address</label>
                <Input
                  value={config.logistics?.showroomAddress || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        showroomAddress: e.target.value,
                      },
                    })
                  }
                  placeholder="Banani 11, Dhaka, Bangladesh"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">Delivery Policy Note</label>
                <Input
                  value={config.logistics?.deliveryPolicyNote || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        deliveryPolicyNote: e.target.value,
                      },
                    })
                  }
                  placeholder="পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: PAYMENT GATEWAYS
      ====================================================================== */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Cash on Delivery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Cash on Delivery (COD)</CardTitle>
                <CardDescription>
                  Allow customers across Bangladesh to pay upon parcel delivery.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.cod?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      cod: { ...config.payment.cod, enabled: e.target.value === 'true' },
                    },
                    features: {
                      ...config.features,
                      codEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            <CardContent>
              <label className="text-xs font-semibold text-[#060d11]">Checkout Note</label>
              <Input
                value={config.payment?.cod?.note || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      cod: { ...config.payment.cod, note: e.target.value },
                    },
                  })
                }
                placeholder="Cash on delivery across 64 districts in Bangladesh"
                className="mt-1.5"
              />
            </CardContent>
          </Card>

          {/* Manual bKash */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Manual bKash Send Money</CardTitle>
                <CardDescription>
                  Receive manual payments directly to your personal, agent, or merchant wallet.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.manualBkash?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualBkash: {
                        ...config.payment.manualBkash,
                        enabled: e.target.value === 'true',
                      },
                    },
                    features: {
                      ...config.features,
                      manualBkashEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            {config.payment?.manualBkash?.enabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">bKash Wallet Number</label>
                  <Input
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
                    placeholder="01700000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Account Type</label>
                  <Select
                    value={config.payment?.manualBkash?.accountType || 'PERSONAL'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualBkash: {
                            ...config.payment.manualBkash,
                            accountType: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="AGENT">Agent</option>
                    <option value="MERCHANT">Merchant</option>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#060d11]">Instructions</label>
                  <Input
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
                    placeholder="Send Money to our bKash number and paste your TrxID below."
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Manual Nagad */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Manual Nagad Send Money</CardTitle>
                <CardDescription>
                  Receive manual payments directly to your Nagad wallet.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.manualNagad?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualNagad: {
                        ...config.payment.manualNagad,
                        enabled: e.target.value === 'true',
                      },
                    },
                    features: {
                      ...config.features,
                      manualNagadEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            {config.payment?.manualNagad?.enabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Nagad Wallet Number</label>
                  <Input
                    value={config.payment?.manualNagad?.number || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualNagad: {
                            ...config.payment.manualNagad,
                            number: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="01700000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Account Type</label>
                  <Select
                    value={config.payment?.manualNagad?.accountType || 'PERSONAL'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualNagad: {
                            ...config.payment.manualNagad,
                            accountType: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="AGENT">Agent</option>
                    <option value="MERCHANT">Merchant</option>
                  </Select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#060d11]">Instructions</label>
                  <Input
                    value={config.payment?.manualNagad?.instructions || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualNagad: {
                            ...config.payment.manualNagad,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Send Money to our Nagad number and paste your TrxID below."
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Manual Rocket */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Manual Rocket Send Money</CardTitle>
                <CardDescription>
                  Receive manual payments through Dutch-Bangla Rocket wallet.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.manualRocket?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualRocket: {
                        ...config.payment?.manualRocket,
                        enabled: e.target.value === 'true',
                      },
                    },
                    features: {
                      ...config.features,
                      manualRocketEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            {config.payment?.manualRocket?.enabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Rocket Number</label>
                  <Input
                    value={config.payment?.manualRocket?.number || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualRocket: {
                            ...config.payment.manualRocket,
                            number: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="01700000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Account Type</label>
                  <Select
                    value={config.payment?.manualRocket?.accountType || 'PERSONAL'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualRocket: {
                            ...config.payment.manualRocket,
                            accountType: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="AGENT">Agent</option>
                    <option value="MERCHANT">Merchant</option>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>

          {/* bKash Payment Gateway (PGW) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>bKash PGW (Direct API)</CardTitle>
                <CardDescription>
                  Automated seamless bKash checkout API integration.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.bkashPGW?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      bkashPGW: {
                        ...config.payment.bkashPGW,
                        enabled: e.target.value === 'true',
                      },
                    },
                    features: {
                      ...config.features,
                      bkashPgwEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            {config.payment?.bkashPGW?.enabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">App Key</label>
                  <Input
                    type="password"
                    value={config.payment?.bkashPGW?.appKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          bkashPGW: {
                            ...config.payment.bkashPGW,
                            appKey: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter bKash App Key"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">App Secret</label>
                  <Input
                    type="password"
                    value={config.payment?.bkashPGW?.appSecret || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          bkashPGW: {
                            ...config.payment.bkashPGW,
                            appSecret: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter bKash App Secret"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Username</label>
                  <Input
                    value={config.payment?.bkashPGW?.username || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          bkashPGW: {
                            ...config.payment.bkashPGW,
                            username: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="bKash Merchant Username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Environment</label>
                  <Select
                    value={config.payment?.bkashPGW?.isSandbox ? 'true' : 'false'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          bkashPGW: {
                            ...config.payment.bkashPGW,
                            isSandbox: e.target.value === 'true',
                          },
                        },
                      })
                    }
                  >
                    <option value="true">Sandbox (Testing)</option>
                    <option value="false">Live (Production)</option>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SSLCommerz Gateway */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>SSLCommerz Gateway</CardTitle>
                <CardDescription>
                  Supports Visa, Mastercard, AMEX, Cards, and Internet Banking.
                </CardDescription>
              </div>
              <Select
                value={config.payment?.sslCommerz?.enabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      sslCommerz: {
                        ...config.payment.sslCommerz,
                        enabled: e.target.value === 'true',
                      },
                    },
                    features: {
                      ...config.features,
                      sslCommerzEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            {config.payment?.sslCommerz?.enabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Store ID</label>
                  <Input
                    value={config.payment?.sslCommerz?.storeId || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          sslCommerz: {
                            ...config.payment.sslCommerz,
                            storeId: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter SSLCommerz Store ID"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Store Password</label>
                  <Input
                    type="password"
                    value={config.payment?.sslCommerz?.storePass || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          sslCommerz: {
                            ...config.payment.sslCommerz,
                            storePass: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter Store Password"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#060d11]">Environment</label>
                  <Select
                    value={config.payment?.sslCommerz?.isSandbox ? 'true' : 'false'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          sslCommerz: {
                            ...config.payment.sslCommerz,
                            isSandbox: e.target.value === 'true',
                          },
                        },
                      })
                    }
                  >
                    <option value="true">Sandbox (Testing)</option>
                    <option value="false">Live (Production)</option>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 4: COURIER & FRAUD SHIELD
      ====================================================================== */}
      {activeTab === 'courier' && (
        <div className="space-y-6">
          {/* Courier Gateway Provider */}
          <Card>
            <CardHeader>
              <CardTitle>Courier Gateway Integration</CardTitle>
              <CardDescription>
                Steadfast Courier / Pathao API automated parcel booking and consignment creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Active Courier Provider</label>
                <Select
                  value={config.courier?.provider || 'STEADFAST'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: { ...config.courier, provider: e.target.value },
                    })
                  }
                >
                  <option value="STEADFAST">Steadfast Courier (Recommended)</option>
                  <option value="PATHAO">Pathao Courier</option>
                  <option value="REDX">RedX Logistics</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Auto Courier Booking</label>
                <Select
                  value={config.features?.courierAutoBooking ? 'true' : 'false'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      features: {
                        ...config.features,
                        courierAutoBooking: e.target.value === 'true',
                      },
                    })
                  }
                >
                  <option value="false">Manual Approval (Staff clicks 'Book Courier')</option>
                  <option value="true">Auto-Booking on Order Confirmation</option>
                </Select>
              </div>

              {config.courier?.provider === 'STEADFAST' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Steadfast API Key</label>
                    <Input
                      type="password"
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
                      placeholder="Enter Steadfast API Key"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Steadfast Secret Key</label>
                    <Input
                      type="password"
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
                      placeholder="Enter Steadfast Secret Key"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-[#060d11]">Steadfast Base URL</label>
                    <Input
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
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              )}

              {config.courier?.provider === 'PATHAO' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Pathao Store ID</label>
                    <Input
                      value={config.courier?.pathao?.storeId || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier.pathao,
                              storeId: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Pathao Store ID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Pathao Client ID</label>
                    <Input
                      value={config.courier?.pathao?.clientId || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier.pathao,
                              clientId: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Client ID"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Pathao Client Secret</label>
                    <Input
                      type="password"
                      value={config.courier?.pathao?.clientSecret || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier.pathao,
                              clientSecret: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Client Secret"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#060d11]">Pathao Username</label>
                    <Input
                      value={config.courier?.pathao?.username || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier.pathao,
                              username: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Pathao Account Email/Username"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Fraud Risk Alert (< 60% Delivery Success) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Customer Return Fraud Shield</CardTitle>
                <CardDescription>
                  Checks customer phone number history against courier delivery success rates to stop fake orders.
                </CardDescription>
              </div>
              <Select
                value={config.features?.fraudCheckEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      fraudCheckEnabled: e.target.value === 'true',
                    },
                    courier: {
                      ...config.courier,
                      fraudCheck: {
                        ...config.courier?.fraudCheck,
                        enabled: e.target.value === 'true',
                      },
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">
                  Alert Threshold Rate (% Delivery Success)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={config.courier?.fraudCheck?.alertThresholdPercent ?? 60}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        fraudCheck: {
                          ...config.courier.fraudCheck,
                          alertThresholdPercent: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Default: <strong>60%</strong>. Orders with a customer delivery success rate below this threshold will display a <strong>High Risk</strong> badge in Admin Orders.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">
                  Auto-Hold High Risk Orders
                </label>
                <Select
                  value={config.courier?.fraudCheck?.autoHoldHighRisk ? 'true' : 'false'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        fraudCheck: {
                          ...config.courier.fraudCheck,
                          autoHoldHighRisk: e.target.value === 'true',
                        },
                      },
                    })
                  }
                >
                  <option value="false">Disabled (Show warning flag only)</option>
                  <option value="true">Active (Hold order for phone verification)</option>
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  When enabled, high risk orders are kept on hold so call-center staff can verify before shipping.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advance Delivery Fee Protection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Advance Delivery Fee Protection</CardTitle>
                <CardDescription>
                  Require customers to pay advance delivery charge via bKash/Nagad before booking delivery.
                </CardDescription>
              </div>
              <Select
                value={
                  config.courier?.advancePayment?.enabled ||
                  config.features?.advanceDeliveryFeeEnabled
                    ? 'true'
                    : 'false'
                }
                onChange={(e) => {
                  const isEnabled = e.target.value === 'true';
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      advanceDeliveryFeeEnabled: isEnabled,
                    },
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        enabled: isEnabled,
                      },
                    },
                  });
                }}
                className="w-32"
              >
                <option value="false">Disabled</option>
                <option value="true">Active</option>
              </Select>
            </CardHeader>
            {(config.courier?.advancePayment?.enabled ||
              config.features?.advanceDeliveryFeeEnabled) && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">
                    Advance Charge Amount (৳)
                  </label>
                  <Input
                    type="number"
                    value={config.courier?.advancePayment?.amount ?? 130}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier.advancePayment,
                            amount: Number(e.target.value),
                            advanceAmount: Number(e.target.value),
                          },
                        },
                      })
                    }
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Standard courier fee: <strong>৳130</strong> (can be configured to any amount e.g. ৳100, ৳150).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Charge Scope</label>
                  <Select
                    value={
                      config.courier?.advancePayment?.applyOnlyOutsideDhaka !== false
                        ? 'true'
                        : 'false'
                    }
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier.advancePayment,
                            applyOnlyOutsideDhaka: e.target.value === 'true',
                            requiredForOutsideDhaka: e.target.value === 'true',
                          },
                        },
                      })
                    }
                  >
                    <option value="true">Outside Dhaka Only (Recommended)</option>
                    <option value="false">All Orders Across Bangladesh</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Payment Wallet Type</label>
                  <Select
                    value={config.courier?.advancePayment?.walletType || 'BKASH'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier.advancePayment,
                            walletType: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="ROCKET">Rocket</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#060d11]">Advance Payment Wallet Number</label>
                  <Input
                    value={
                      config.courier?.advancePayment?.walletNumber ||
                      config.courier?.advancePayment?.bkashMerchantNumber ||
                      ''
                    }
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier.advancePayment,
                            walletNumber: e.target.value,
                            bkashMerchantNumber: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="01700000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#060d11]">
                    Instructions Note for Customer
                  </label>
                  <Input
                    value={
                      config.courier?.advancePayment?.instructions ||
                      'ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।'
                    }
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier.advancePayment,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 5: MARKETING & TRACKING PIXELS
      ====================================================================== */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta (Facebook) Pixel & CAPI</CardTitle>
              <CardDescription>
                Server-side Conversions API (CAPI) with automatic browser deduplication via event_id.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Meta Pixel ID</label>
                <Input
                  value={config.tracking?.metaPixelId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, metaPixelId: e.target.value },
                    })
                  }
                  placeholder="e.g. 123456789012345"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">Test Event Code</label>
                <Input
                  value={config.tracking?.metaTestEventCode || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, metaTestEventCode: e.target.value },
                    })
                  }
                  placeholder="e.g. TEST12345"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">
                  Meta Conversions API (CAPI) Server Token
                </label>
                <Input
                  type="password"
                  value={config.tracking?.metaCapiToken || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, metaCapiToken: e.target.value },
                    })
                  }
                  placeholder="EAABxxxxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google & User Analytics</CardTitle>
              <CardDescription>
                Google Analytics 4, Google Tag Manager container, and Microsoft Clarity heatmaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">GA4 Measurement ID</label>
                <Input
                  value={config.tracking?.ga4MeasurementId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, ga4MeasurementId: e.target.value },
                    })
                  }
                  placeholder="G-XXXXXXXXXX"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">GTM Container ID</label>
                <Input
                  value={config.tracking?.gtmId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, gtmId: e.target.value },
                    })
                  }
                  placeholder="GTM-XXXXXXX"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#060d11]">
                  Microsoft Clarity Project ID (Free Heatmaps)
                </label>
                <Input
                  value={config.tracking?.clarityProjectId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, clarityProjectId: e.target.value },
                    })
                  }
                  placeholder="e.g. kxxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TikTok Pixel</CardTitle>
              <CardDescription>TikTok ad campaign tracking and Events API token.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">TikTok Pixel ID</label>
                <Input
                  value={config.tracking?.tiktokPixelId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, tiktokPixelId: e.target.value },
                    })
                  }
                  placeholder="CXXXXXXXXXXXXX"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#060d11]">TikTok Events API Token</label>
                <Input
                  type="password"
                  value={config.tracking?.tiktokEventsApiToken || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tracking: { ...config.tracking, tiktokEventsApiToken: e.target.value },
                    })
                  }
                  placeholder="Enter TikTok Access Token"
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 6: HOMEPAGE LAYOUT SECTIONS
      ====================================================================== */}
      {activeTab === 'sections' && (
        <Card>
          <CardHeader>
            <CardTitle>Homepage Layout Blocks</CardTitle>
            <CardDescription>
              Reorder, show, or hide storefront components without modifying code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(config.homeSections || []).map((section: any, idx: number) => (
              <div
                key={section.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-[#060d11] text-xs font-bold flex items-center justify-center">
                    {section.order}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#060d11]">
                      {section.title || section.id}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Block Type: <span className="font-mono text-slate-700">{section.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded">
                    <button
                      type="button"
                      onClick={() => moveSectionOrder(section.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSectionOrder(section.id, 'down')}
                      disabled={idx === (config.homeSections?.length || 1) - 1}
                      className="p-1.5 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer border-l border-slate-200"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    {section.isActive ? (
                      <Eye className="w-3.5 h-3.5 text-[#076E46]" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{section.isActive ? 'Active' : 'Hidden'}</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          TAB 7: GLOBAL FEATURE TOGGLES
      ====================================================================== */}
      {activeTab === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle>Global Feature Switches</CardTitle>
            <CardDescription>
              1-Click master switches to activate or deactivate business features storewide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Smart Drawer Checkout */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Smart Drawer Checkout</h4>
                <p className="text-xs text-slate-500">
                  Completes orders directly within the slide-over sidebar drawer with zero page reload.
                </p>
              </div>
              <Select
                value={config.features?.smartCheckoutEnabled !== false ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      smartCheckoutEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Abandoned Cart Lead Capture */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Abandoned Cart Capture</h4>
                <p className="text-xs text-slate-500">
                  Saves checkout leads as INCOMPLETE orders as soon as the customer types their phone number.
                </p>
              </div>
              <Select
                value={config.features?.abandonedCartCapture !== false ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      abandonedCartCapture: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Fraud Check Shield */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Return Fraud Shield</h4>
                <p className="text-xs text-slate-500">
                  Flags orders where the customer&apos;s courier delivery rate is below 60%.
                </p>
              </div>
              <Select
                value={config.features?.fraudCheckEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      fraudCheckEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Advance Delivery Fee */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Advance Delivery Fee</h4>
                <p className="text-xs text-slate-500">
                  Requires outside-Dhaka customers to pay delivery charge in advance.
                </p>
              </div>
              <Select
                value={config.features?.advanceDeliveryFeeEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      advanceDeliveryFeeEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Promo Coupon Box */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Promo Coupon Input</h4>
                <p className="text-xs text-slate-500">
                  Displays the coupon discount redemption box in drawer and checkout.
                </p>
              </div>
              <Select
                value={config.features?.couponEnabled !== false ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      couponEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Server-Side CAPI */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Meta Conversions API (CAPI)</h4>
                <p className="text-xs text-slate-500">
                  Dispatches server-side purchase and checkout events directly to Facebook Graph API.
                </p>
              </div>
              <Select
                value={config.features?.capiEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      capiEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Google Tag Manager */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Google Tag Manager (GTM)</h4>
                <p className="text-xs text-slate-500">
                  Pushes canonical GA4 e-commerce events to window.dataLayer.
                </p>
              </div>
              <Select
                value={config.features?.gtmEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      gtmEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>

            {/* Microsoft Clarity */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Microsoft Clarity Heatmaps</h4>
                <p className="text-xs text-slate-500">
                  Loads session replay and click heatmaps for checkout friction diagnostics.
                </p>
              </div>
              <Select
                value={config.features?.clarityEnabled ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    features: {
                      ...config.features,
                      clarityEnabled: e.target.value === 'true',
                    },
                  })
                }
                className="w-32"
              >
                <option value="true">Active</option>
                <option value="false">Disabled</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
