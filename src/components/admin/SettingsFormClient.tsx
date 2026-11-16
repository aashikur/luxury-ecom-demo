'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Activity,
  ToggleLeft,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
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
  Badge,
  Breadcrumb,
} from '@/components/ui';
import type { IHeaderNavLink, IHomeSection } from '@/models/StoreConfig';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

interface CollectionOption {
  _id: string;
  title: string;
  slug: string;
  badgeText?: string;
}

interface BrandOption {
  _id: string;
  name: string;
  slug: string;
}

interface SettingsFormClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialConfig: any;
  categories?: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
}

export default function SettingsFormClient({
  initialConfig,
  categories = [],
  collections = [],
  brands = [],
}: SettingsFormClientProps) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<
    'branding' | 'logistics' | 'payment' | 'courier' | 'tracking' | 'sections' | 'features'
  >('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Tab horizontal scroll handling
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Section Modal state
  const [editingSection, setEditingSection] = useState<IHomeSection | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSection, setNewSection] = useState<Partial<IHomeSection>>({
    type: 'COLLECTION_SECTION',
    title: '',
    subtitle: '',
    collectionSlug: '',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    bannerImage: { url: '', key: '' },
    themeStyle: 'LIGHT',
    isActive: true,
  });

  // Header Nav Link Modal / Drawer state
  const [isAddingNavLink, setIsAddingNavLink] = useState(false);
  const [newNavLink, setNewNavLink] = useState<{
    label: string;
    href: string;
    badgeText: string;
  }>({
    label: '',
    href: '',
    badgeText: '',
  });

  // Sub-Link Modal state
  const [subLinkParentId, setSubLinkParentId] = useState<string | null>(null);
  const [newSubLink, setNewSubLink] = useState<{
    label: string;
    href: string;
    badgeText: string;
  }>({
    label: '',
    href: '',
    badgeText: '',
  });

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 250);
    }
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && tabsRef.current) {
      tabsRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

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

  // ---------------------------------------------------------------------------
  // Header Quick Links Handlers
  // ---------------------------------------------------------------------------
  const moveNavLinkOrder = (id: string, direction: 'up' | 'down') => {
    const list: IHeaderNavLink[] = [...(config.headerNavLinks || [])].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    const tempOrder = list[idx].order;
    list[idx].order = list[swapIdx].order;
    list[swapIdx].order = tempOrder;

    setConfig({ ...config, headerNavLinks: list });
  };

  const toggleNavLink = (id: string) => {
    const updated = (config.headerNavLinks || []).map((l: IHeaderNavLink) =>
      l.id === id ? { ...l, isActive: !l.isActive } : l
    );
    setConfig({ ...config, headerNavLinks: updated });
  };

  const deleteNavLink = (id: string) => {
    const updated = (config.headerNavLinks || []).filter((l: IHeaderNavLink) => l.id !== id);
    setConfig({ ...config, headerNavLinks: updated });
  };

  const openSubLinkModal = (parentId: string) => {
    setSubLinkParentId(parentId);
    setNewSubLink({ label: '', href: '', badgeText: '' });
  };

  const handleCreateSubLink = () => {
    if (!subLinkParentId) return;
    if (!newSubLink.label.trim() || !newSubLink.href.trim()) {
      showToast('Display Label and URL are required', 'error');
      return;
    }

    const updated = (config.headerNavLinks || []).map((l: IHeaderNavLink) => {
      if (l.id !== subLinkParentId) return l;
      const existingChildren = l.children || [];
      const newChild: IHeaderNavLink = {
        id: `sub_${Date.now()}`,
        label: newSubLink.label.trim(),
        href: newSubLink.href.trim(),
        badgeText: newSubLink.badgeText.trim() || undefined,
        isActive: true,
        order: existingChildren.length + 1,
      };
      return {
        ...l,
        children: [...existingChildren, newChild],
      };
    });

    setConfig({ ...config, headerNavLinks: updated });
    setSubLinkParentId(null);
    setNewSubLink({ label: '', href: '', badgeText: '' });
    showToast('Sub-link added successfully', 'success');
  };

  const deleteSubLink = (parentId: string, subId: string) => {
    const updated = (config.headerNavLinks || []).map((l: IHeaderNavLink) => {
      if (l.id !== parentId) return l;
      return {
        ...l,
        children: (l.children || []).filter((sub: IHeaderNavLink) => sub.id !== subId),
      };
    });
    setConfig({ ...config, headerNavLinks: updated });
    showToast('Sub-link removed', 'success');
  };

  const moveSubLinkOrder = (parentId: string, subId: string, direction: 'up' | 'down') => {
    const updated = (config.headerNavLinks || []).map((l: IHeaderNavLink) => {
      if (l.id !== parentId || !l.children || l.children.length === 0) return l;
      const children = [...l.children].sort((a, b) => a.order - b.order);
      const index = children.findIndex((c) => c.id === subId);
      if (index === -1) return l;

      if (direction === 'up' && index > 0) {
        const temp = children[index];
        children[index] = children[index - 1];
        children[index - 1] = temp;
      } else if (direction === 'down' && index < children.length - 1) {
        const temp = children[index];
        children[index] = children[index + 1];
        children[index + 1] = temp;
      }

      const reordered = children.map((c, i) => ({ ...c, order: i + 1 }));
      return { ...l, children: reordered };
    });

    setConfig({ ...config, headerNavLinks: updated });
  };

  const addNavLink = () => {
    if (!newNavLink.label.trim() || !newNavLink.href.trim()) {
      showToast('Please provide both label and URL for the link', 'error');
      return;
    }
    const currentList: IHeaderNavLink[] = config.headerNavLinks || [];
    const maxOrder = currentList.reduce((acc, curr) => Math.max(acc, curr.order || 0), 0);
    const created: IHeaderNavLink = {
      id: `nav_${Date.now()}`,
      label: newNavLink.label.trim(),
      href: newNavLink.href.trim(),
      badgeText: newNavLink.badgeText.trim() || undefined,
      isActive: true,
      order: maxOrder + 1,
    };
    setConfig({ ...config, headerNavLinks: [...currentList, created] });
    setNewNavLink({ label: '', href: '', badgeText: '' });
    setIsAddingNavLink(false);
    showToast('Quick link added', 'success');
  };

  // ---------------------------------------------------------------------------
  // Homepage Sections Handlers
  // ---------------------------------------------------------------------------
  const moveSectionOrder = (id: string, direction: 'up' | 'down') => {
    const sorted: IHomeSection[] = [...(config.homeSections || [])].sort((a, b) => a.order - b.order);
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
    const updated = (config.homeSections || []).map((s: IHomeSection) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    setConfig({ ...config, homeSections: updated });
  };

  const deleteSection = (id: string) => {
    const updated = (config.homeSections || []).filter((s: IHomeSection) => s.id !== id);
    setConfig({ ...config, homeSections: updated });
    showToast('Section removed', 'success');
  };

  const saveEditedSection = () => {
    if (!editingSection) return;
    const updated = (config.homeSections || []).map((s: IHomeSection) =>
      s.id === editingSection.id ? editingSection : s
    );
    setConfig({ ...config, homeSections: updated });
    setEditingSection(null);
    showToast('Section updated', 'success');
  };

  const addHomeSection = () => {
    const currentList: IHomeSection[] = config.homeSections || [];
    const maxOrder = currentList.reduce((acc, curr) => Math.max(acc, curr.order || 0), 0);
    const sectionToInsert: IHomeSection = {
      id: `sec_${Date.now()}`,
      type: newSection.type || 'COLLECTION_SECTION',
      title: newSection.title?.trim() || '',
      subtitle: newSection.subtitle?.trim() || '',
      collectionSlug: newSection.collectionSlug?.trim() || '',
      buttonText: newSection.buttonText?.trim() || 'SHOP NOW',
      buttonLink: newSection.buttonLink?.trim() || '/shop',
      bannerImage: {
        url: newSection.bannerImage?.url?.trim() || '',
        key: '',
      },
      themeStyle: newSection.themeStyle || 'LIGHT',
      isActive: true,
      order: maxOrder + 1,
    };
    setConfig({ ...config, homeSections: [...currentList, sectionToInsert] });
    setIsAddingSection(false);
    setNewSection({
      type: 'COLLECTION_SECTION',
      title: '',
      subtitle: '',
      collectionSlug: '',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop',
      bannerImage: { url: '', key: '' },
      themeStyle: 'LIGHT',
      isActive: true,
    });
    showToast('Section added to homepage', 'success');
  };

  const tabs = [
    { id: 'branding', label: 'Branding & Identity', icon: Sparkles },
    { id: 'logistics', label: 'Logistics & Contacts', icon: Truck },
    { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
    { id: 'courier', label: 'Courier & Fraud Shield', icon: ShieldAlert },
    { id: 'tracking', label: 'Marketing & Pixels', icon: Activity },
    { id: 'sections', label: 'Homepage Layout', icon: Layers },
    { id: 'features', label: 'Feature Switches', icon: ToggleLeft },
  ];

  return (
    <div className="w-full space-y-6 max-w-6xl pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-[#060d11] border border-slate-700 text-white text-xs uppercase tracking-wider shadow-2xl rounded-md">
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
            { label: 'Dashboard', href: '/admin' },
            { label: 'Settings', href: '/admin/settings' },
            {
              label: tabs.find((t) => t.id === activeTab)?.label || 'General',
            },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#060d11]">Store Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage store branding, Bangladesh delivery tariffs, payment gateways, and homepage blocks.
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

      {/* Tab Navigation with Left/Right Scroll Controls & MouseWheel Support */}
      <div className="relative border-b border-slate-200">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-[#060d11] transition cursor-pointer"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={tabsRef}
          onScroll={checkScroll}
          onWheel={handleTabsWheel}
          className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-100 text-[#060d11] font-semibold border border-slate-300 shadow-xs'
                    : 'text-slate-600 hover:text-[#060d11] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#076E46]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-700 hover:text-[#060d11] transition cursor-pointer"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store Name</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tagline</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store Niche</label>
                <Select
                  value={config.branding?.storeNiche || 'CLOTHING'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, storeNiche: e.target.value },
                    })
                  }
                >
                  <option value="CLOTHING">Clothing</option>
                  <option value="GADGETS">Gadgets</option>
                  <option value="FOOD">Food</option>
                  <option value="GENERAL">General</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store Architecture Mode</label>
                <Select
                  value={config.branding?.storeMode || 'MULTI_PRODUCT'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, storeMode: e.target.value },
                    })
                  }
                >
                  <option value="MULTI_PRODUCT">Multi-Product</option>
                  <option value="SINGLE_PRODUCT_FUNNEL">Single-Product Funnel</option>
                </Select>
              </div>

              {config.branding?.storeMode === 'SINGLE_PRODUCT_FUNNEL' && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Featured Product Slug
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Logo URL</label>
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
                  placeholder="https://cdn.example.com/logo.png"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Favicon URL</label>
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
                  placeholder="https://cdn.example.com/favicon.ico"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Currency Symbol</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Currency Code</label>
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
              <CardTitle>Theme & Announcement</CardTitle>
              <CardDescription>
                Primary accent color, surface mode, and top marquee banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.branding?.colors?.primary || '#060d11'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: {
                          ...config.branding,
                          colors: { ...config.branding.colors, primary: e.target.value },
                        },
                      })
                    }
                    className="w-10 h-10 rounded border border-slate-300 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={config.branding?.colors?.primary || '#060d11'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: {
                          ...config.branding,
                          colors: { ...config.branding.colors, primary: e.target.value },
                        },
                      })
                    }
                    className="font-mono text-xs w-36"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Accent Color</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Theme Mode</label>
                <Select
                  value={config.branding?.themeMode || 'LIGHT'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, themeMode: e.target.value },
                    })
                  }
                >
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Hero Variant</label>
                <Select
                  value={config.branding?.heroVariant || 'CENTER'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      branding: { ...config.branding, heroVariant: e.target.value },
                    })
                  }
                >
                  <option value="CENTER">Center</option>
                  <option value="SPLIT">Split</option>
                  <option value="FULL_SLIDER">Full Slider</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Announcement Bar</label>
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
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Announcement Text</label>
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

          {/* Header Quick Links (Rule 1.1) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Header Quick Links</CardTitle>
                <CardDescription>
                  Pinned categories, collections, or brands displayed in the storefront navigation bar next to Menu.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNavLink(true)}
                className="inline-flex items-center gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5 text-[#076E46]" />
                <span>Add Quick Link</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Quick Link Form */}
              {isAddingNavLink && (
                <div className="p-4 border border-slate-300 rounded-md bg-white space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#060d11] uppercase tracking-wider">
                      New Navigation Quick Link
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingNavLink(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Quick-Select Item
                      </label>
                      <Select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const [type, slug] = val.split(':');
                          if (type === 'category') {
                            const found = categories.find((c) => c.slug === slug);
                            setNewNavLink({
                              ...newNavLink,
                              label: found?.name || newNavLink.label,
                              href: `/shop?category=${slug}`,
                            });
                          } else if (type === 'collection') {
                            const found = collections.find((c) => c.slug === slug);
                            setNewNavLink({
                              ...newNavLink,
                              label: found?.title || newNavLink.label,
                              href: `/shop?collection=${slug}`,
                            });
                          } else if (type === 'brand') {
                            const found = brands.find((b) => b.slug === slug);
                            setNewNavLink({
                              ...newNavLink,
                              label: found?.name || newNavLink.label,
                              href: `/shop?brand=${slug}`,
                            });
                          }
                        }}
                      >
                        <option value="">-- Choose Category, Collection, or Brand --</option>
                        {categories.length > 0 && (
                          <optgroup label="Categories">
                            {categories.map((cat) => (
                              <option key={`cat-${cat._id}`} value={`category:${cat.slug}`}>
                                {cat.parentId ? `  ↳ ${cat.name}` : cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {collections.length > 0 && (
                          <optgroup label="Collections">
                            {collections.map((col) => (
                              <option key={`col-${col._id}`} value={`collection:${col.slug}`}>
                                {col.title}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {brands.length > 0 && (
                          <optgroup label="Brands">
                            {brands.map((b) => (
                              <option key={`brand-${b._id}`} value={`brand:${b.slug}`}>
                                {b.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Display Label</label>
                      <Input
                        value={newNavLink.label}
                        onChange={(e) => setNewNavLink({ ...newNavLink, label: e.target.value })}
                        placeholder="e.g. Heavyweight Hoodies"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Target URL</label>
                      <Input
                        value={newNavLink.href}
                        onChange={(e) => setNewNavLink({ ...newNavLink, href: e.target.value })}
                        placeholder="/shop?category=hoodies or /shop"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Promotional Badge (Optional)
                      </label>
                      <Input
                        value={newNavLink.badgeText}
                        onChange={(e) => setNewNavLink({ ...newNavLink, badgeText: e.target.value })}
                        placeholder="e.g. HOT, NEW, SALE"
                      />
                    </div>

                    <div className="flex items-end gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={addNavLink}
                        className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9"
                      >
                        Save Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingNavLink(false)}
                        className="text-xs h-9"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Links List */}
              {(!config.headerNavLinks || config.headerNavLinks.length === 0) ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  No quick links added yet. Click &quot;Add Quick Link&quot; to feature top categories, collections, or brands.
                </div>
              ) : (
                config.headerNavLinks
                  .sort((a: IHeaderNavLink, b: IHeaderNavLink) => a.order - b.order)
                  .map((link: IHeaderNavLink, idx: number) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-md border border-slate-200 bg-white space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-[#060d11] text-xs font-bold flex items-center justify-center shrink-0">
                            {link.order || idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#060d11]">{link.label}</span>
                              {link.badgeText && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase">
                                  {link.badgeText}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs font-mono text-slate-500">{link.href}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openSubLinkModal(link.id)}
                            className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition cursor-pointer"
                          >
                            + Sub-Link
                          </button>

                          <div className="flex items-center border border-slate-200 rounded">
                            <button
                              type="button"
                              onClick={() => moveNavLinkOrder(link.id, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveNavLinkOrder(link.id, 'down')}
                              disabled={idx === config.headerNavLinks.length - 1}
                              className="p-1.5 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer border-l border-slate-200"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleNavLink(link.id)}
                            className="text-xs h-8 px-2"
                          >
                            {link.isActive ? (
                              <Eye className="w-3.5 h-3.5 text-[#076E46]" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </Button>

                          <button
                            type="button"
                            onClick={() => deleteNavLink(link.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Nested Sub-Links */}
                      {link.children && link.children.length > 0 && (
                        <div className="pl-9 pt-2 space-y-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Nested Sub-Links ({link.children.length})
                          </span>
                          {link.children.map((sub: IHeaderNavLink, subIdx: number) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between py-1.5 px-3 rounded bg-slate-50 border border-slate-200 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">↳ {sub.label}</span>
                                {sub.badgeText && (
                                  <Badge variant="secondary" className="text-[9px] py-0 px-1 uppercase">
                                    {sub.badgeText}
                                  </Badge>
                                )}
                                <span className="text-slate-400 font-mono text-[11px]">{sub.href}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveSubLinkOrder(link.id, sub.id, 'up')}
                                  disabled={subIdx === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSubLinkOrder(link.id, sub.id, 'down')}
                                  disabled={subIdx === (link.children?.length || 1) - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSubLink(link.id, sub.id)}
                                  className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                                  title="Delete sub-link"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
              )}

              {/* Sub-Link Creation Modal Dialog */}
              {subLinkParentId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#060d11]">Add Sub-Menu Link</h3>
                        <p className="text-xs text-slate-500">
                          Parent item:{' '}
                          <strong className="text-emerald-700">
                            {(config.headerNavLinks || []).find((l: IHeaderNavLink) => l.id === subLinkParentId)?.label}
                          </strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubLinkParentId(null)}
                        className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Preset Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Quick Preset (Choose from Collections or Categories)
                      </label>
                      <Select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const [type, slug] = val.split(':');
                          if (type === 'collection') {
                            const col = collections.find((c) => c.slug === slug);
                            setNewSubLink({
                              ...newSubLink,
                              label: col?.title || '',
                              href: `/collections/${slug}`,
                              badgeText: col?.badgeText || '',
                            });
                          } else if (type === 'category') {
                            const cat = categories.find((c) => c.slug === slug);
                            setNewSubLink({
                              ...newSubLink,
                              label: cat?.name || '',
                              href: `/shop?category=${slug}`,
                              badgeText: '',
                            });
                          }
                        }}
                      >
                        <option value="">-- Choose Collection or Category --</option>
                        {collections.length > 0 && (
                          <optgroup label="Collections">
                            {collections.map((col) => (
                              <option key={`sub-col-${col._id}`} value={`collection:${col.slug}`}>
                                {col.title} ({col.slug})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {categories.length > 0 && (
                          <optgroup label="Categories">
                            {categories.map((cat) => (
                              <option key={`sub-cat-${cat._id}`} value={`category:${cat.slug}`}>
                                {cat.parentId ? `  ↳ ${cat.name}` : cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Display Label *</label>
                      <Input
                        value={newSubLink.label}
                        onChange={(e) => setNewSubLink({ ...newSubLink, label: e.target.value })}
                        placeholder="e.g. Ramadan Edit"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Destination URL *</label>
                      <Input
                        value={newSubLink.href}
                        onChange={(e) => setNewSubLink({ ...newSubLink, href: e.target.value })}
                        placeholder="e.g. /collections/ramadan"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Badge Text (Optional)</label>
                      <Input
                        value={newSubLink.badgeText}
                        onChange={(e) => setNewSubLink({ ...newSubLink, badgeText: e.target.value })}
                        placeholder="e.g. HOLY MONTH, NEW, HOT"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSubLinkParentId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateSubLink}
                        className="bg-[#076E46] text-white hover:bg-[#055C3A]"
                      >
                        Add Sub-Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Inside Dhaka (৳)</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dhaka Suburbs (৳)
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Outside Dhaka (৳)</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Free Shipping Campaign</label>
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
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Free Shipping Threshold (৳)</label>
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Inside Dhaka Delivery Time</label>
                <Input
                  value={config.logistics?.estimatedDeliveryDays?.insideDhaka || '24-48 Hours'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        estimatedDeliveryDays: {
                          ...config.logistics?.estimatedDeliveryDays,
                          insideDhaka: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="24-48 Hours"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Outside Dhaka Delivery Time</label>
                <Input
                  value={config.logistics?.estimatedDeliveryDays?.outsideDhaka || '3-5 Days'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        estimatedDeliveryDays: {
                          ...config.logistics?.estimatedDeliveryDays,
                          outsideDhaka: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="3-5 Days"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Contacts & Helpdesk</CardTitle>
              <CardDescription>
                Hotline numbers, WhatsApp chat link, email, showroom address, and social links.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Support Phone</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">WhatsApp Hotline</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Support Email</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Helpline Hours</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Showroom / Outlet Address</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Delivery Policy Note</label>
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

              {/* Social Channels */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Facebook Page URL</label>
                <Input
                  value={config.logistics?.socialLinks?.facebook || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        socialLinks: {
                          ...config.logistics?.socialLinks,
                          facebook: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="https://facebook.com/aurem"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instagram Profile URL</label>
                <Input
                  value={config.logistics?.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        socialLinks: {
                          ...config.logistics?.socialLinks,
                          instagram: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="https://instagram.com/aurem"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">YouTube Channel URL</label>
                <Input
                  value={config.logistics?.socialLinks?.youtube || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        socialLinks: {
                          ...config.logistics?.socialLinks,
                          youtube: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="https://youtube.com/@aurem"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">TikTok Profile URL</label>
                <Input
                  value={config.logistics?.socialLinks?.tiktok || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      logistics: {
                        ...config.logistics,
                        socialLinks: {
                          ...config.logistics?.socialLinks,
                          tiktok: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="https://tiktok.com/@aurem"
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
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Checkout Note</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">bKash Wallet Number</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
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
                    placeholder="Send Money to our personal bKash number and provide your TrxID below."
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
                  Receive manual payments to your personal or merchant Nagad account.
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Nagad Wallet Number</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
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
                    placeholder="Send Money to our personal Nagad number and provide your TrxID below."
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
                  Receive manual payments to your personal or merchant Rocket account.
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
                        ...config.payment.manualRocket,
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rocket Wallet Number</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
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

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
                  <Input
                    value={config.payment?.manualRocket?.instructions || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        payment: {
                          ...config.payment,
                          manualRocket: {
                            ...config.payment.manualRocket,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Send Money to our Rocket number and provide your TrxID below."
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* bKash PGW (Direct API) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>bKash PGW (Direct API)</CardTitle>
                <CardDescription>
                  Automated tokenized checkout gateway via bKash Merchant API.
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">App Key</label>
                  <Input
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
                    placeholder="Enter App Key"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">App Secret</label>
                  <div className="relative">
                    <Input
                      type={showSecrets['bkash_secret'] ? 'text' : 'password'}
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
                      placeholder="Enter App Secret"
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('bkash_secret')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['bkash_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Username</label>
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
                    placeholder="bKash API Username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showSecrets['bkash_pass'] ? 'text' : 'password'}
                      value={config.payment?.bkashPGW?.password || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          payment: {
                            ...config.payment,
                            bkashPGW: {
                              ...config.payment.bkashPGW,
                              password: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="bKash API Password"
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('bkash_pass')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['bkash_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Environment</label>
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
                    <option value="false">Live Production</option>
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
                  Aggregator gateway supporting Visa, MasterCard, bKash, Nagad, and Internet Banking.
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store ID</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store Password</label>
                  <div className="relative">
                    <Input
                      type={showSecrets['ssl_pass'] ? 'text' : 'password'}
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
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('ssl_pass')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSecrets['ssl_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Environment</label>
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
                    <option value="false">Live Production</option>
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
          <Card>
            <CardHeader>
              <CardTitle>Courier Gateway Integration</CardTitle>
              <CardDescription>
                Steadfast Courier / Pathao API automated parcel booking and consignment creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Active Courier Provider</label>
                <Select
                  value={config.courier?.provider || 'STEADFAST'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: { ...config.courier, provider: e.target.value },
                    })
                  }
                >
                  <option value="STEADFAST">Steadfast Courier</option>
                  <option value="PATHAO">Pathao Courier</option>
                  <option value="REDX">RedX Logistics</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Auto Courier Booking</label>
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
                  <option value="false">Disabled</option>
                  <option value="true">Active</option>
                </Select>
              </div>

              {config.courier?.provider === 'STEADFAST' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast API Key</label>
                    <div className="relative">
                      <Input
                        type={showSecrets['steadfast_key'] ? 'text' : 'password'}
                        value={config.courier?.steadfast?.apiKey || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            courier: {
                              ...config.courier,
                              steadfast: {
                                ...config.courier?.steadfast,
                                apiKey: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Enter Steadfast API Key"
                        className="font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('steadfast_key')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['steadfast_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast Secret Key</label>
                    <div className="relative">
                      <Input
                        type={showSecrets['steadfast_secret'] ? 'text' : 'password'}
                        value={config.courier?.steadfast?.secretKey || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            courier: {
                              ...config.courier,
                              steadfast: {
                                ...config.courier?.steadfast,
                                secretKey: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Enter Steadfast Secret Key"
                        className="font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('steadfast_secret')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['steadfast_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast Base URL</label>
                    <Input
                      value={config.courier?.steadfast?.baseUrl || 'https://portal.steadfast.com.bd/api/v1'}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            steadfast: {
                              ...config.courier?.steadfast,
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
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Store ID</label>
                    <Input
                      value={config.courier?.pathao?.storeId || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier?.pathao,
                              storeId: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Pathao Store ID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Client ID</label>
                    <Input
                      value={config.courier?.pathao?.clientId || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          courier: {
                            ...config.courier,
                            pathao: {
                              ...config.courier?.pathao,
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
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Client Secret</label>
                    <div className="relative">
                      <Input
                        type={showSecrets['pathao_secret'] ? 'text' : 'password'}
                        value={config.courier?.pathao?.clientSecret || ''}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            courier: {
                              ...config.courier,
                              pathao: {
                                ...config.courier?.pathao,
                                clientSecret: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Enter Client Secret"
                        className="font-mono text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('pathao_secret')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets['pathao_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Username</label>
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

          {/* Customer Fraud Risk Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Customer Return Fraud Shield</CardTitle>
                <CardDescription>
                  Checks customer phone number history against courier delivery success rates.
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
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
                          ...config.courier?.fraudCheck,
                          alertThresholdPercent: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
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
                          ...config.courier?.fraudCheck,
                          autoHoldHighRisk: e.target.value === 'true',
                        },
                      },
                    })
                  }
                >
                  <option value="false">Disabled</option>
                  <option value="true">Active</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Advance Delivery Fee Protection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Advance Delivery Fee Protection</CardTitle>
                <CardDescription>
                  Require customers to pay advance delivery charge via bKash/Nagad before booking.
                </CardDescription>
              </div>
              <Select
                value={config.features?.advanceDeliveryFeeEnabled ? 'true' : 'false'}
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
            {config.features?.advanceDeliveryFeeEnabled && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Advance Amount (৳)
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
                            ...config.courier?.advancePayment,
                            amount: Number(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Scope</label>
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
                            ...config.courier?.advancePayment,
                            applyOnlyOutsideDhaka: e.target.value === 'true',
                          },
                        },
                      })
                    }
                  >
                    <option value="true">Outside Dhaka Only</option>
                    <option value="false">All Orders</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Provider</label>
                  <Select
                    value={config.courier?.advancePayment?.walletType || 'BKASH'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier?.advancePayment,
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Number</label>
                  <Input
                    value={config.courier?.advancePayment?.walletNumber || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier?.advancePayment,
                            walletNumber: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="01700000000"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
                  <Input
                    value={config.courier?.advancePayment?.instructions || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          advancePayment: {
                            ...config.courier?.advancePayment,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।"
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
                Server-side Conversions API (CAPI) with automatic browser deduplication.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Meta Pixel ID</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Test Event Code</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Meta Conversions API (CAPI) Token
                </label>
                <div className="relative">
                  <Input
                    type={showSecrets['meta_capi'] ? 'text' : 'password'}
                    value={config.tracking?.metaCapiToken || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tracking: { ...config.tracking, metaCapiToken: e.target.value },
                      })
                    }
                    placeholder="EAAB..."
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('meta_capi')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['meta_capi'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Analytics & Tag Manager</CardTitle>
              <CardDescription>
                Google Analytics 4, Tag Manager container, and Microsoft Clarity heatmaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">GA4 Measurement ID</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">GTM Container ID</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Microsoft Clarity Project ID
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">TikTok Pixel ID</label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">TikTok Events API Token</label>
                <div className="relative">
                  <Input
                    type={showSecrets['tiktok_token'] ? 'text' : 'password'}
                    value={config.tracking?.tiktokEventsApiToken || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tracking: { ...config.tracking, tiktokEventsApiToken: e.target.value },
                      })
                    }
                    placeholder="Enter TikTok Token"
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('tiktok_token')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['tiktok_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 6: HOMEPAGE LAYOUT SECTIONS
      ====================================================================== */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Homepage Layout Blocks</CardTitle>
                <CardDescription>
                  Arrange, edit, and feature dynamic banners and product collections on the storefront.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingSection(true)}
                className="inline-flex items-center gap-1.5 text-xs border-slate-300 hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5 text-[#076E46]" />
                <span>Add Section</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Section Form */}
              {isAddingSection && (
                <div className="p-4 border border-slate-300 rounded-md bg-white space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#060d11] uppercase tracking-wider">
                      Add New Homepage Section
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Block Type</label>
                      <Select
                        value={newSection.type}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            type: e.target.value as IHomeSection['type'],
                          })
                        }
                      >
                        <option value="COLLECTION_SECTION">Collection Product Section</option>
                        <option value="HERO_BANNER">Hero Banner</option>
                        <option value="PROMO_CTA_CARD">Promo CTA Card</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Section Title</label>
                      <Input
                        value={newSection.title || ''}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        placeholder="e.g. Heavyweight Hoodies"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Subtitle / Description</label>
                      <Input
                        value={newSection.subtitle || ''}
                        onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                        placeholder="e.g. 450 GSM French Terry Fleece"
                      />
                    </div>

                    {newSection.type === 'COLLECTION_SECTION' ? (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          Target Collection / Category
                        </label>
                        <Select
                          value={newSection.collectionSlug || ''}
                          onChange={(e) =>
                            setNewSection({ ...newSection, collectionSlug: e.target.value })
                          }
                        >
                          <option value="">-- All Products / Custom --</option>
                          <optgroup label="Collections">
                            {collections.map((col) => (
                              <option key={col._id} value={col.slug}>
                                {col.title}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Categories">
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat.slug}>
                                {cat.name}
                              </option>
                            ))}
                          </optgroup>
                          {brands.length > 0 && (
                            <optgroup label="Brands">
                              {brands.map((b) => (
                                <option key={b._id} value={b.slug}>
                                  {b.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">Banner Image URL</label>
                        <Input
                          value={newSection.bannerImage?.url || ''}
                          onChange={(e) =>
                            setNewSection({
                              ...newSection,
                              bannerImage: { url: e.target.value, key: '' },
                            })
                          }
                          placeholder="https://cdn.example.com/banner.webp"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Button CTA Text</label>
                      <Input
                        value={newSection.buttonText || ''}
                        onChange={(e) => setNewSection({ ...newSection, buttonText: e.target.value })}
                        placeholder="e.g. SHOP NOW"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Button Link Target</label>
                      <Input
                        value={newSection.buttonLink || ''}
                        onChange={(e) => setNewSection({ ...newSection, buttonLink: e.target.value })}
                        placeholder="/shop or /category/hoodies"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={addHomeSection}
                      className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9"
                    >
                      Save Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingSection(false)}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Edit Section Form Modal / Panel */}
              {editingSection && (
                <div className="p-4 border border-[#076E46] rounded-md bg-white space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#060d11] uppercase tracking-wider">
                      Edit Section: {editingSection.title || editingSection.id}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Block Type</label>
                      <Select
                        value={editingSection.type}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            type: e.target.value as IHomeSection['type'],
                          })
                        }
                      >
                        <option value="COLLECTION_SECTION">Collection Product Section</option>
                        <option value="HERO_BANNER">Hero Banner</option>
                        <option value="PROMO_CTA_CARD">Promo CTA Card</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Section Title</label>
                      <Input
                        value={editingSection.title || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Subtitle</label>
                      <Input
                        value={editingSection.subtitle || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, subtitle: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">
                        Target Collection / Category Slug
                      </label>
                      <Input
                        value={editingSection.collectionSlug || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, collectionSlug: e.target.value })
                        }
                        placeholder="hoodies or t-shirts"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Button CTA Text</label>
                      <Input
                        value={editingSection.buttonText || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, buttonText: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Button Link Target</label>
                      <Input
                        value={editingSection.buttonLink || ''}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, buttonLink: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600 block">Banner Image URL</label>
                      <Input
                        value={editingSection.bannerImage?.url || ''}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            bannerImage: { url: e.target.value, key: '' },
                          })
                        }
                        placeholder="https://cdn.example.com/banner.webp"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveEditedSection}
                      className="bg-[#076E46] text-white hover:bg-[#055C3A] text-xs h-9"
                    >
                      Update Section
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(null)}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Sections List */}
              {(!config.homeSections || config.homeSections.length === 0) ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  No layout blocks found. Click &quot;Add Section&quot; to build your homepage layout.
                </div>
              ) : (
                config.homeSections
                  .sort((a: IHomeSection, b: IHomeSection) => a.order - b.order)
                  .map((section: IHomeSection, idx: number) => (
                    <div
                      key={section.id}
                      className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-[#060d11] text-xs font-bold flex items-center justify-center shrink-0">
                          {section.order || idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#060d11]">
                              {section.title || section.id}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                              {section.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {section.collectionSlug && (
                              <span className="font-mono text-slate-700 mr-2">
                                Slug: {section.collectionSlug}
                              </span>
                            )}
                            {section.subtitle && <span>{section.subtitle}</span>}
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
                            disabled={idx === config.homeSections.length - 1}
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
                          className="text-xs h-8 px-2"
                        >
                          {section.isActive ? (
                            <Eye className="w-3.5 h-3.5 text-[#076E46]" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </Button>

                        <button
                          type="button"
                          onClick={() => setEditingSection(section)}
                          className="p-1.5 text-slate-400 hover:text-[#060d11] transition cursor-pointer"
                          title="Edit Section"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSection(section.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 7: GLOBAL FEATURE SWITCHES
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#060d11]">Smart Drawer Checkout</h4>
                <p className="text-xs text-slate-500">
                  Completes orders directly within the slide-over sidebar drawer with zero page redirect.
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
            <div className="p-3.5 rounded-md border border-slate-200 bg-white flex items-center justify-between">
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
