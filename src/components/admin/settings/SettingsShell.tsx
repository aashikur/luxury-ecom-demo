'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  Activity,
  ToggleLeft,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, Breadcrumb } from '@/components/ui';
import type {
  CategoryOption,
  CollectionOption,
  BrandOption,
  TabDefinition,
} from './types';

// Tab Components
import BrandingTab from './tabs/BrandingTab';
import LogisticsTab from './tabs/LogisticsTab';
import PaymentTab from './tabs/PaymentTab';
import CourierTab from './tabs/CourierTab';
import TrackingTab from './tabs/TrackingTab';
import HomepageLayoutTab from './tabs/HomepageLayoutTab';
import FeaturesTab from './tabs/FeaturesTab';

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: 'branding',
    label: 'Branding & Identity',
    icon: Sparkles,
    description: 'Store title, logo, theme colors, and header navigation quick links.',
    subSections: [
      { id: 'brand-identity', label: 'Brand Identity' },
      { id: 'theme-announcement', label: 'Theme & Announcement' },
      { id: 'header-quick-links', label: 'Header Quick Links' },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics & Contacts',
    icon: Truck,
    description: '3-zone delivery charges, free shipping threshold, and support contacts.',
    subSections: [
      { id: 'logistics-tariffs', label: 'Delivery Tariffs' },
      { id: 'logistics-contacts', label: 'Business Contacts' },
    ],
  },
  {
    id: 'payment',
    label: 'Payment Gateways',
    icon: CreditCard,
    description: 'Cash on delivery, manual bKash/Nagad/Rocket, and automated PGW.',
    subSections: [
      { id: 'payment-cod', label: 'Cash on Delivery' },
      { id: 'payment-bkash-manual', label: 'Manual bKash' },
      { id: 'payment-nagad-manual', label: 'Manual Nagad' },
      { id: 'payment-rocket-manual', label: 'Manual Rocket' },
      { id: 'payment-bkash-pgw', label: 'bKash PGW (Direct)' },
      { id: 'payment-sslcommerz', label: 'SSLCommerz' },
    ],
  },
  {
    id: 'courier',
    label: 'Courier & Fraud Shield',
    icon: ShieldAlert,
    description: 'Steadfast/Pathao API, return fraud shield, and advance delivery fee.',
    subSections: [
      { id: 'courier-gateway', label: 'Courier Gateway' },
      { id: 'courier-fraud', label: 'Fraud Shield' },
      { id: 'courier-advance', label: 'Advance Delivery Fee' },
    ],
  },
  {
    id: 'tracking',
    label: 'Marketing & Pixels',
    icon: Activity,
    description: 'Meta Pixel & CAPI deduplication, Google Tag Manager, and TikTok Pixel.',
    subSections: [
      { id: 'tracking-meta', label: 'Meta Pixel & CAPI' },
      { id: 'tracking-gtm', label: 'Google Tag Manager' },
      { id: 'tracking-tiktok', label: 'TikTok Pixel' },
    ],
  },
  {
    id: 'sections',
    label: 'Homepage Layout',
    icon: Layers,
    description: 'Arrange banners, circular story discovery pills, and collection grids.',
    subSections: [
      { id: 'homepage-blocks', label: 'Layout Blocks' },
    ],
  },
  {
    id: 'features',
    label: 'Feature Switches',
    icon: ToggleLeft,
    description: 'Global commerce switches for reviews, search, and stock visibility.',
    subSections: [
      { id: 'features-switches', label: 'Global Switches' },
    ],
  },
];

interface SettingsShellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialConfig: any;
  categories?: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
}

export default function SettingsShell({
  initialConfig,
  categories = [],
  collections = [],
  brands = [],
}: SettingsShellProps) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<TabDefinition['id']>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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
        router.refresh();
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

  const scrollToSubSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[SettingsShell] Element with id "${id}" not found.`);
      return;
    }

    // Find the true scrolling container (in AdminShellClient, <main className="flex-1 overflow-y-auto...">)
    let scrollParent: HTMLElement | null = el.parentElement;
    let foundScrollContainer: HTMLElement | null = null;

    while (scrollParent) {
      const style = window.getComputedStyle(scrollParent);
      const isScrollable =
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        scrollParent.scrollHeight > scrollParent.clientHeight;

      if (isScrollable) {
        foundScrollContainer = scrollParent;
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    if (foundScrollContainer) {
      const containerRect = foundScrollContainer.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const relativeTop = elRect.top - containerRect.top + foundScrollContainer.scrollTop;
      // 24px breathing room above the card
      const targetScroll = Math.max(0, relativeTop - 24);

      foundScrollContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    } else {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Tactile glow highlight on target card
    el.classList.add('ring-2', 'ring-[#076E46]', 'transition-all', 'duration-300');
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-[#076E46]');
    }, 1200);
  };

  const currentTabDef = TAB_DEFINITIONS.find((t) => t.id === activeTab) || TAB_DEFINITIONS[0];

  return (
    <div className="w-full max-w-7xl pb-24 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-[#060d11] border border-slate-700 text-white text-xs uppercase tracking-wider shadow-2xl rounded-md animate-in slide-in-from-bottom-2 duration-200">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Persistent Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin' },
              { label: 'Settings', href: '/admin/settings' },
              { label: currentTabDef.label },
            ]}
          />
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11] mt-1.5">
            Store Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentTabDef.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#076E46] text-white hover:bg-[#055C3A] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Carousel (shown only on small screens) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
        {TAB_DEFINITIONS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-[#076E46] border-emerald-300 font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#076E46]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dual-Nav Grid: Sticky Left Sidebar + Content Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Left Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-6 space-y-1 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Settings Modules
          </div>
          {TAB_DEFINITIONS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#076E46] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#060d11]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-3 border-t border-slate-100 px-3">
            <div className="text-[11px] text-slate-400">
              Dual-Nav Architecture v2.0
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Zero-Waterfall &bull; Split Bundle
            </div>
          </div>
        </aside>

        {/* Content Workspace */}
        <div className="lg:col-span-9 space-y-6">
          {/* Sticky Top Sub-Section Anchor Jump Pills */}
          {currentTabDef.subSections && currentTabDef.subSections.length > 1 && (
            <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-2.5 px-3 rounded-lg border border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Jump to:
              </span>
              {currentTabDef.subSections.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => scrollToSubSection(sub.id)}
                  className="shrink-0 px-3 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:border-[#076E46] hover:text-[#076E46] hover:bg-emerald-50/30 transition cursor-pointer shadow-2xs active:scale-[0.98] duration-75"
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* Active Tab Component */}
          {activeTab === 'branding' && (
            <BrandingTab
              config={config}
              setConfig={setConfig}
              categories={categories}
              collections={collections}
              brands={brands}
              showToast={showToast}
            />
          )}

          {activeTab === 'logistics' && (
            <LogisticsTab
              config={config}
              setConfig={setConfig}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentTab
              config={config}
              setConfig={setConfig}
              showSecrets={showSecrets}
              toggleSecret={toggleSecret}
            />
          )}

          {activeTab === 'courier' && (
            <CourierTab
              config={config}
              setConfig={setConfig}
              showSecrets={showSecrets}
              toggleSecret={toggleSecret}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingTab
              config={config}
              setConfig={setConfig}
              showSecrets={showSecrets}
              toggleSecret={toggleSecret}
            />
          )}

          {activeTab === 'sections' && (
            <HomepageLayoutTab
              config={config}
              setConfig={setConfig}
              categories={categories}
              collections={collections}
              brands={brands}
              showToast={showToast}
            />
          )}

          {activeTab === 'features' && (
            <FeaturesTab
              config={config}
              setConfig={setConfig}
            />
          )}

          {/* Bottom Save Action Bar */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              All settings are saved directly to StoreConfig.
            </span>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs font-semibold px-6 py-2.5 h-10 tracking-wider uppercase inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
