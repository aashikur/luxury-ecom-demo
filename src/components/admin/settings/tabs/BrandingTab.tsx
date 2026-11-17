'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
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
} from '@/components/ui';
import type { IHeaderNavLink } from '@/models/StoreConfig';
import type { BrandingTabProps } from '../types';

export default function BrandingTab({
  config,
  setConfig,
  categories = [],
  collections = [],
  brands = [],
  showToast,
}: BrandingTabProps) {
  // Header Nav Link Modal / Form state
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

  // Inline Badge Editor state
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [tempBadgeText, setTempBadgeText] = useState<string>('');

  // Mobile collapsed sub-links state
  const [collapsedLinks, setCollapsedLinks] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedLinks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const startEditingBadge = (id: string, currentBadge: string = '') => {
    setEditingBadgeId(id);
    setTempBadgeText(currentBadge || '');
  };

  const saveBadge = (id: string, parentId?: string) => {
    const text = tempBadgeText.trim();
    const updated = (config.headerNavLinks || []).map((link: IHeaderNavLink) => {
      if (parentId && link.id === parentId) {
        const updatedChildren = (link.children || []).map((sub: IHeaderNavLink) => {
          if (sub.id === id) {
            return { ...sub, badgeText: text || undefined };
          }
          return sub;
        });
        return { ...link, children: updatedChildren };
      }

      if (link.id === id) {
        return { ...link, badgeText: text || undefined };
      }
      return link;
    });

    setConfig({ ...config, headerNavLinks: updated });
    setEditingBadgeId(null);
    setTempBadgeText('');
  };

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
      showToast?.('Display Label and URL are required', 'error');
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
    showToast?.('Sub-link added successfully', 'success');
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
    showToast?.('Sub-link removed', 'success');
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
      showToast?.('Please provide both label and URL for the link', 'error');
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
    showToast?.('Quick link added', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Brand Identity */}
      <Card id="brand-identity" className="scroll-mt-16">
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
                    logo: { ...config.branding?.logo, url: e.target.value },
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
                    favicon: { ...config.branding?.favicon, url: e.target.value },
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

      {/* Theme & Announcement */}
      <Card id="theme-announcement" className="scroll-mt-16">
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
                      colors: { ...config.branding?.colors, primary: e.target.value },
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
                      colors: { ...config.branding?.colors, primary: e.target.value },
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
                      colors: { ...config.branding?.colors, accent: e.target.value },
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
                      colors: { ...config.branding?.colors, accent: e.target.value },
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

      {/* Header Quick Links */}
      <Card id="header-quick-links" className="scroll-mt-16">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3">
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
                  className="group p-3 rounded-lg border border-slate-200 bg-white space-y-2.5 hover:border-slate-300 transition shadow-2xs"
                >
                  {/* Top Bar: Order + Title + Badge + URL (desktop) + Top-Right Mobile Actions */}
                  <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-[#060d11] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {link.order || idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#060d11] truncate">{link.label}</span>

                          {/* Primary Link Inline Badge Editor */}
                          {editingBadgeId === link.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in duration-100">
                              <input
                                type="text"
                                autoFocus
                                value={tempBadgeText}
                                onChange={(e) => setTempBadgeText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveBadge(link.id);
                                  if (e.key === 'Escape') setEditingBadgeId(null);
                                }}
                                placeholder="Badge text..."
                                className="w-24 px-1.5 py-0.5 text-[10px] font-bold uppercase border border-[#076E46] rounded focus:outline-none bg-white text-[#060d11]"
                              />
                              <button
                                type="button"
                                onClick={() => saveBadge(link.id)}
                                className="p-0.5 text-[#076E46] hover:text-[#055C3A] cursor-pointer"
                                title="Save badge"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBadgeId(null)}
                                className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : link.badgeText ? (
                            <button
                              type="button"
                              onClick={() => startEditingBadge(link.id, link.badgeText)}
                              className="group/badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                              title="Click to edit badge"
                            >
                              <span>{link.badgeText}</span>
                              <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover/badge:opacity-100 text-emerald-700" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditingBadge(link.id, '')}
                              className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider text-slate-400 hover:text-[#076E46] hover:bg-slate-100 border border-dashed border-slate-200 hover:border-[#076E46] transition cursor-pointer"
                              title="Add badge"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Badge</span>
                            </button>
                          )}
                        </div>

                        <span className="hidden sm:inline-block text-xs font-mono text-slate-500 truncate max-w-[280px]">
                          {link.href}
                        </span>
                      </div>
                    </div>

                    {/* Desktop All-in-One Actions Bar */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
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

                    {/* Mobile Top-Right Quick Status Actions */}
                    <div className="flex sm:hidden items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleNavLink(link.id)}
                        className={`p-1.5 rounded border transition cursor-pointer ${
                          link.isActive
                            ? 'bg-emerald-50 text-[#076E46] border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                        title={link.isActive ? 'Active on Storefront' : 'Hidden'}
                      >
                        {link.isActive ? (
                          <Eye className="w-3.5 h-3.5 text-[#076E46]" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNavLink(link.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Bottom Actions Toolbar */}
                  <div className="flex sm:hidden items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                    {link.children && link.children.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleCollapse(link.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer"
                      >
                        <span>{link.children.length} sub-links</span>
                        {collapsedLinks[link.id] ? (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No sub-links</span>
                    )}

                    <div className="flex items-center gap-1.5">
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
                          className="p-1 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveNavLinkOrder(link.id, 'down')}
                          disabled={idx === config.headerNavLinks.length - 1}
                          className="p-1 text-slate-500 hover:text-[#060d11] disabled:opacity-30 cursor-pointer border-l border-slate-200"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Sub-Links */}
                  {link.children && link.children.length > 0 && !collapsedLinks[link.id] && (
                    <div className="pl-3 sm:pl-9 pt-1.5 sm:pt-1 space-y-1 sm:space-y-0.5 border-l-2 sm:border-l-0 sm:border-t border-emerald-500/30 sm:border-slate-100/70 ml-1.5 sm:ml-0">
                      {link.children.map((sub: IHeaderNavLink, subIdx: number) => (
                        <div
                          key={sub.id}
                          className="group/sub flex items-center justify-between py-1.5 sm:py-1 px-2 rounded-md hover:bg-slate-50 transition text-xs opacity-90 sm:opacity-70 hover:opacity-100 gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-medium text-slate-800 truncate">↳ {sub.label}</span>

                            {editingBadgeId === sub.id ? (
                              <div className="flex items-center gap-1 animate-in fade-in duration-100 shrink-0">
                                <input
                                  type="text"
                                  autoFocus
                                  value={tempBadgeText}
                                  onChange={(e) => setTempBadgeText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveBadge(sub.id, link.id);
                                    if (e.key === 'Escape') setEditingBadgeId(null);
                                  }}
                                  placeholder="Badge..."
                                  className="w-20 px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#076E46] rounded focus:outline-none bg-white text-[#060d11]"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveBadge(sub.id, link.id)}
                                  className="p-0.5 text-[#076E46] hover:text-[#055C3A] cursor-pointer"
                                  title="Save badge"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingBadgeId(null)}
                                  className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : sub.badgeText ? (
                              <button
                                type="button"
                                onClick={() => startEditingBadge(sub.id, sub.badgeText)}
                                className="group/subbadge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 transition cursor-pointer shrink-0"
                                title="Click to edit badge"
                              >
                                <span>{sub.badgeText}</span>
                                <Edit2 className="w-2 h-2 opacity-40 group-hover/subbadge:opacity-100 text-slate-600" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingBadge(sub.id, '')}
                                className="opacity-0 group-hover/sub:opacity-100 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-wider text-slate-400 hover:text-[#076E46] hover:bg-slate-100 border border-dashed border-slate-200 hover:border-[#076E46] transition cursor-pointer shrink-0"
                                title="Add badge"
                              >
                                <Plus className="w-2 h-2" />
                                <span>Badge</span>
                              </button>
                            )}

                            <span className="hidden sm:inline-block text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                              {sub.href}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 opacity-100 sm:opacity-40 sm:group-hover/sub:opacity-100 transition">
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
  );
}
