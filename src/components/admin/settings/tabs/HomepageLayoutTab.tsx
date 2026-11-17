'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  Image as ImageIcon,
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
} from '@/components/ui';
import type { IHomeSection } from '@/models/StoreConfig';
import type { HomepageLayoutTabProps } from '../types';

export default function HomepageLayoutTab({
  config,
  setConfig,
  categories = [],
  collections = [],
  brands = [],
  showToast,
}: HomepageLayoutTabProps) {
  // Modal / inline edit state
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
    cardShape: 'PORTRAIT_3_4',
    showTitle: true,
    layoutWidth: 'WIDE_FULL',
    bgMode: 'PHOTO_BG',
    slides: [],
    themeStyle: 'LIGHT',
    isActive: true,
  });

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
    showToast?.('Section removed', 'success');
  };

  const saveEditedSection = () => {
    if (!editingSection) return;
    const updated = (config.homeSections || []).map((s: IHomeSection) =>
      s.id === editingSection.id ? editingSection : s
    );
    setConfig({ ...config, homeSections: updated });
    setEditingSection(null);
    showToast?.('Section updated', 'success');
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
      cardShape: newSection.cardShape || 'PORTRAIT_3_4',
      showTitle: newSection.showTitle !== false,
      layoutWidth: newSection.layoutWidth || 'WIDE_FULL',
      bgMode: newSection.bgMode || 'PHOTO_BG',
      slides: newSection.slides || [],
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
      cardShape: 'PORTRAIT_3_4',
      showTitle: true,
      layoutWidth: 'WIDE_FULL',
      bgMode: 'PHOTO_BG',
      slides: [],
      themeStyle: 'LIGHT',
      isActive: true,
    });
    showToast?.('Section added to homepage', 'success');
  };

  // Slide helper functions for editingSection
  const addSlideToEditing = () => {
    if (!editingSection) return;
    const existing = editingSection.slides || [];
    const newSlide: {
      url: string;
      title: string;
      subtitle: string;
      buttonText: string;
      buttonLink: string;
    } = {
      url: '',
      title: '',
      subtitle: '',
      buttonText: 'DISCOVER',
      buttonLink: '/shop',
    };
    setEditingSection({
      ...editingSection,
      slides: [...existing, newSlide],
    });
  };

  const updateSlideInEditing = (slideIdx: number, patch: Partial<{
    url: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  }>) => {
    if (!editingSection) return;
    const existing = editingSection.slides || [];
    const updated = existing.map((s, idx) => (idx === slideIdx ? { ...s, ...patch } : s));
    setEditingSection({ ...editingSection, slides: updated });
  };

  const removeSlideFromEditing = (slideIdx: number) => {
    if (!editingSection) return;
    const existing = editingSection.slides || [];
    setEditingSection({
      ...editingSection,
      slides: existing.filter((_, idx) => idx !== slideIdx),
    });
  };

  return (
    <div className="space-y-6">
      <Card id="homepage-blocks">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Homepage Layout Blocks</CardTitle>
            <CardDescription>
              Arrange, customize, and feature dynamic banners, circular story discovery, and product collections.
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
            <span>Add Block</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Section Form */}
          {isAddingSection && (
            <div className="p-4 border border-slate-300 rounded-md bg-white space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#060d11] uppercase tracking-wider">
                  Add New Homepage Block
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
                    <option value="COLLECTION_SECTION">Collection Product Grid</option>
                    <option value="HERO_BANNER">Hero Banner / Multi-Slide Carousel</option>
                    <option value="CATEGORY_PILLS">Circular Category Story Bubbles</option>
                    <option value="PROMO_CTA_CARD">Promo CTA Banner (Wide / Boxed)</option>
                    <option value="SPLIT_SHOWCASE">Editorial Split Showcase</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Section Title</label>
                  <Input
                    value={newSection.title || ''}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="e.g. Aurem Collections or Heavyweight Hoodies"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 block">Subtitle / Description</label>
                  <Input
                    value={newSection.subtitle || ''}
                    onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                    placeholder="e.g. Pure Egyptian combed cotton"
                  />
                </div>

                {newSection.type === 'CATEGORY_PILLS' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 block">Card Shape</label>
                    <Select
                      value={newSection.cardShape || 'CIRCLE'}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          cardShape: e.target.value as 'CIRCLE' | 'SQUARE' | 'PORTRAIT_3_4',
                        })
                      }
                    >
                      <option value="CIRCLE">Circular Story Bubbles (rounded-full)</option>
                      <option value="SQUARE">Square Pill Cards (aspect-square)</option>
                      <option value="PORTRAIT_3_4">Portrait Editorial (3:4)</option>
                    </Select>
                  </div>
                )}

                {newSection.type === 'PROMO_CTA_CARD' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Layout Width</label>
                      <Select
                        value={newSection.layoutWidth || 'WIDE_FULL'}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            layoutWidth: e.target.value as 'WIDE_FULL' | 'WIDE_BOX',
                          })
                        }
                      >
                        <option value="WIDE_FULL">Edge-to-Edge Full Width (w-full)</option>
                        <option value="WIDE_BOX">Boxed Container (max-w-7xl mx-auto)</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Background Surface</label>
                      <Select
                        value={newSection.bgMode || 'PHOTO_BG'}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            bgMode: e.target.value as 'PHOTO_BG' | 'SOLID_SURFACE',
                          })
                        }
                      >
                        <option value="PHOTO_BG">Photo Background with Dark Contrast Overlay</option>
                        <option value="SOLID_SURFACE">Solid Editorial Surface Color</option>
                      </Select>
                    </div>
                  </>
                )}

                {(newSection.type === 'COLLECTION_SECTION' || newSection.type === 'SPLIT_SHOWCASE') ? (
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
                  Edit Block: {editingSection.title || editingSection.id}
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
                    <option value="COLLECTION_SECTION">Collection Product Grid</option>
                    <option value="HERO_BANNER">Hero Banner / Multi-Slide Carousel</option>
                    <option value="CATEGORY_PILLS">Circular Category Story Bubbles</option>
                    <option value="PROMO_CTA_CARD">Promo CTA Banner (Wide / Boxed)</option>
                    <option value="SPLIT_SHOWCASE">Editorial Split Showcase</option>
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
                  <label className="text-[11px] font-semibold text-slate-600 block">Show Title Heading</label>
                  <Select
                    value={editingSection.showTitle !== false ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        showTitle: e.target.value === 'true',
                      })
                    }
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden (Clean Minimal)</option>
                  </Select>
                </div>

                {editingSection.type === 'CATEGORY_PILLS' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 block">Card Shape</label>
                    <Select
                      value={editingSection.cardShape || 'CIRCLE'}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          cardShape: e.target.value as 'CIRCLE' | 'SQUARE' | 'PORTRAIT_3_4',
                        })
                      }
                    >
                      <option value="CIRCLE">Circular Story Bubbles (rounded-full)</option>
                      <option value="SQUARE">Square Pill Cards (aspect-square)</option>
                      <option value="PORTRAIT_3_4">Portrait Editorial (3:4)</option>
                    </Select>
                  </div>
                )}

                {editingSection.type === 'PROMO_CTA_CARD' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Layout Width</label>
                      <Select
                        value={editingSection.layoutWidth || 'WIDE_FULL'}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            layoutWidth: e.target.value as 'WIDE_FULL' | 'WIDE_BOX',
                          })
                        }
                      >
                        <option value="WIDE_FULL">Edge-to-Edge Full Width (w-full)</option>
                        <option value="WIDE_BOX">Boxed Container (max-w-7xl mx-auto)</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Background Surface</label>
                      <Select
                        value={editingSection.bgMode || 'PHOTO_BG'}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            bgMode: e.target.value as 'PHOTO_BG' | 'SOLID_SURFACE',
                          })
                        }
                      >
                        <option value="PHOTO_BG">Photo Background with Dark Contrast Overlay</option>
                        <option value="SOLID_SURFACE">Solid Editorial Surface Color</option>
                      </Select>
                    </div>
                  </>
                )}

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

              {/* Multi-Slide Carousel Editor for HERO_BANNER */}
              {editingSection.type === 'HERO_BANNER' && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#060d11] uppercase tracking-wider">
                        Hero Carousel Slides ({editingSection.slides?.length || 0})
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Add up to 5 slides for auto-rotating carousel. If empty, uses single Banner Image URL above.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSlideToEditing}
                      className="text-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#076E46]" />
                      <span>Add Slide</span>
                    </Button>
                  </div>

                  {editingSection.slides && editingSection.slides.length > 0 && (
                    <div className="space-y-2">
                      {editingSection.slides.map((slide, sIdx) => (
                        <div
                          key={`slide-${sIdx}`}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Slide {sIdx + 1} Image URL
                            </label>
                            <Input
                              value={slide.url || ''}
                              onChange={(e) =>
                                updateSlideInEditing(sIdx, { url: e.target.value })
                              }
                              placeholder="https://cdn.example.com/slide.webp"
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Title & Subtitle
                            </label>
                            <Input
                              value={slide.title || ''}
                              onChange={(e) =>
                                updateSlideInEditing(sIdx, { title: e.target.value })
                              }
                              placeholder="Slide Headline"
                              className="text-xs"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="space-y-1 flex-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">
                                CTA Link Target
                              </label>
                              <Input
                                value={slide.buttonLink || ''}
                                onChange={(e) =>
                                  updateSlideInEditing(sIdx, { buttonLink: e.target.value })
                                }
                                placeholder="/shop"
                                className="text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSlideFromEditing(sIdx)}
                              className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
              No layout blocks found. Click &quot;Add Block&quot; to build your homepage layout.
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
                        {section.cardShape && (
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            [{section.cardShape}]
                          </span>
                        )}
                        {section.layoutWidth && (
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            [{section.layoutWidth}]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {section.collectionSlug && (
                          <span className="font-mono text-slate-700 mr-2">
                            Slug: {section.collectionSlug}
                          </span>
                        )}
                        {section.subtitle && <span>{section.subtitle}</span>}
                        {section.slides && section.slides.length > 0 && (
                          <span className="text-emerald-700 font-semibold ml-2">
                            ({section.slides.length} slides)
                          </span>
                        )}
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
                      title="Edit Block"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSection(section.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Block"
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
  );
}
