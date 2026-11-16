'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus, X, Trash2, Layers } from 'lucide-react';
import MediaUploader, { MediaItem } from '@/components/admin/MediaUploader';
import { ProductType, ProductStatus, StockStatus } from '@/models/Product';
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

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  ancestors: string[];
  level: number;
  children: CategoryNode[];
}

interface CollectionItem {
  _id: string;
  title: string;
  slug: string;
  badgeText?: string;
}

interface OptionItem {
  label: string;
  meta?: string;
}

interface OptionAxis {
  id: string;
  name: string;
  values: OptionItem[];
}

interface FormVariantRow {
  _id?: string;
  sku: string;
  title: string;
  label: string;
  selectedOptions: { name: string; value: string }[];
  price: number;
  discountPrice?: number;
  stock: number;
  stockStatus: StockStatus;
  isActive: boolean;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any;
}

function generateCartesianCombinations(axes: OptionAxis[]): { name: string; value: string; meta?: string }[][] {
  const activeAxes = axes.filter((a) => a.values.length > 0);
  if (activeAxes.length === 0) return [];

  return activeAxes.reduce<{ name: string; value: string; meta?: string }[][]>(
    (acc, axis) => {
      const res: { name: string; value: string; meta?: string }[][] = [];
      acc.forEach((existingCombo) => {
        axis.values.forEach((val) => {
          res.push([...existingCombo, { name: axis.name, value: val.label, meta: val.meta }]);
        });
      });
      return res;
    },
    [[]]
  );
}

export default function ProductFormClient({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Categories & Collections state from DB
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [availableCollections, setAvailableCollections] = useState<CollectionItem[]>([]);
  const [isLoadingTaxonomies, setIsLoadingTaxonomies] = useState(true);

  // Cascading Category selection states
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>(product?.categoryId || '');

  // Quick Add Category Modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Custom collection tag input
  const [customTagInput, setCustomTagInput] = useState('');

  // Media
  const productMediaList = (product?.media?.length > 0 ? product.media : product?.images) || [];
  const [images, setImages] = useState<MediaItem[]>(productMediaList);
  const initialKeys = useRef<Set<string>>(
    new Set(productMediaList.map((img: MediaItem) => img.key).filter((k: string | undefined): k is string => Boolean(k)))
  );
  const sessionUploadedKeys = useRef<string[]>([]);

  // Existing variants fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingVariants = product?.variants || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantsSumStock = existingVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

  // Main Form State
  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    productType: (product?.productType as ProductType) || 'CLOTHING',
    hasVariants: product?.hasVariants !== undefined ? Boolean(product.hasVariants) : existingVariants.length > 0,
    price: product?.basePrice ?? (isEdit ? 0 : ''),
    discountPrice: product?.discountPrice ?? '',
    sku: product?.sku || '',
    stock: isEdit ? (product?.totalStock ?? (existingVariants.length > 0 ? variantsSumStock : 0)) : 0,
    stockStatus: (product?.stockStatus as StockStatus) || 'AUTO',
    brandName: product?.brandName || '',
    categoryId: product?.categoryId || '',
    categorySlug: product?.categorySlug || '',
    categoryPath: (product?.categoryPath as string[]) || [],
    categoryName: product?.categoryName || (isEdit ? 'Garments' : ''),
    collections: (product?.collections as string[]) || ['winter-drop-2026'],
    status: (product?.status as ProductStatus) || (product?.isActive ? 'PUBLISHED' : 'DRAFT'),
  });

  // -------------------------------------------------------------
  // Option Axes & Variant Matrix State
  // -------------------------------------------------------------
  const initialAxes: OptionAxis[] = useMemo(() => {
    if (product?.variantOptions && Array.isArray(product.variantOptions) && product.variantOptions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return product.variantOptions.map((vo: any, idx: number) => ({
        id: `axis-${idx}`,
        name: vo.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        values: (vo.values || []).map((v: any) => ({ label: v.label, meta: v.meta || '' })),
      }));
    }
    if (existingVariants.length > 0) {
      const groupMap = new Map<string, Map<string, string | undefined>>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existingVariants.forEach((v: any) => {
        if (v.selectedOptions && Array.isArray(v.selectedOptions) && v.selectedOptions.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          v.selectedOptions.forEach((so: any) => {
            if (!groupMap.has(so.name)) groupMap.set(so.name, new Map());
            groupMap.get(so.name)!.set(so.value, v.colorHex);
          });
        } else if (v.label && v.label.includes(' / ')) {
          const parts = v.label.split(' / ');
          if (!groupMap.has('Size')) groupMap.set('Size', new Map());
          if (!groupMap.has('Color')) groupMap.set('Color', new Map());
          groupMap.get('Size')!.set(parts[0], undefined);
          groupMap.get('Color')!.set(parts[1], v.colorHex);
        }
      });
      if (groupMap.size > 0) {
        return Array.from(groupMap.entries()).map(([name, valMap], idx) => ({
          id: `axis-${idx}`,
          name,
          values: Array.from(valMap.entries()).map(([label, meta]) => ({ label, meta })),
        }));
      }
    }
    return [
      {
        id: 'axis-size',
        name: 'Size',
        values: [{ label: '52' }, { label: '54' }, { label: '56' }, { label: '58' }],
      },
      {
        id: 'axis-color',
        name: 'Color',
        values: [
          { label: 'Midnight Black', meta: '#111111' },
          { label: 'Sand Dune', meta: '#C2A68D' },
        ],
      },
    ];
  }, [product, existingVariants]);

  const [optionAxes, setOptionAxes] = useState<OptionAxis[]>(initialAxes);

  const initialVariantRows: FormVariantRow[] = useMemo(() => {
    if (existingVariants.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return existingVariants.map((v: any) => ({
        _id: v._id?.toString(),
        sku: v.sku || '',
        title: v.title || v.label || '',
        label: v.label || v.title || '',
        selectedOptions: v.selectedOptions || [],
        price: v.price ?? (product?.basePrice || 0),
        discountPrice: v.discountPrice,
        stock: v.stock ?? 0,
        stockStatus: (v.stockStatus as StockStatus) || 'AUTO',
        isActive: v.isActive !== false,
      }));
    }
    return [];
  }, [existingVariants, product]);

  const [variantRows, setVariantRows] = useState<FormVariantRow[]>(initialVariantRows);

  // Synchronize variant combinations when axes change
  const syncVariantRowsWithAxes = (axes: OptionAxis[]) => {
    const combos = generateCartesianCombinations(axes);
    if (combos.length === 0) {
      setVariantRows([]);
      return;
    }

    setVariantRows((prevRows) => {
      return combos.map((combo) => {
        const title = combo.map((c) => c.value).join(' / ');
        const matched = prevRows.find((r) => {
          if (r.selectedOptions && r.selectedOptions.length === combo.length) {
            return combo.every((c) =>
              r.selectedOptions.some(
                (so) => so.name.toLowerCase() === c.name.toLowerCase() && so.value.toLowerCase() === c.value.toLowerCase()
              )
            );
          }
          return r.title === title || r.label === title;
        });

        if (matched) {
          return {
            ...matched,
            title,
            label: title,
            selectedOptions: combo.map((c) => ({ name: c.name, value: c.value })),
          };
        }

        const optCodes = combo.map((c) => c.value.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')).join('-');
        const baseSku = form.sku || form.title.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PROD';
        const autoSku = `${baseSku}-${optCodes}`;

        return {
          sku: autoSku,
          title,
          label: title,
          selectedOptions: combo.map((c) => ({ name: c.name, value: c.value })),
          price: Number(form.price) || 0,
          discountPrice: form.discountPrice !== '' ? Number(form.discountPrice) : undefined,
          stock: 10,
          stockStatus: 'AUTO' as StockStatus,
          isActive: true,
        };
      });
    });
  };

  // Auto-generate initial rows if empty on mount and variants enabled
  useEffect(() => {
    if (form.hasVariants && variantRows.length === 0 && optionAxes.length > 0) {
      syncVariantRowsWithAxes(optionAxes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.hasVariants]);

  // Bulk actions state
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');

  const handleApplyBulkPrice = () => {
    const p = Number(bulkPrice);
    if (isNaN(p) || p < 0) return;
    setVariantRows((prev) => prev.map((r) => ({ ...r, price: p })));
  };

  const handleApplyBulkStock = () => {
    const s = Number(bulkStock);
    if (isNaN(s) || s < 0) return;
    setVariantRows((prev) => prev.map((r) => ({ ...r, stock: s })));
  };

  // Option axis inputs
  const [axisInputValues, setAxisInputValues] = useState<Record<string, string>>({});
  const [axisInputColors, setAxisInputColors] = useState<Record<string, string>>({});

  const handleAddAxisValue = (axisId: string) => {
    const val = (axisInputValues[axisId] || '').trim();
    if (!val) return;
    const color = axisInputColors[axisId] || '#111111';

    const updated = optionAxes.map((a) => {
      if (a.id === axisId) {
        if (a.values.some((v) => v.label.toLowerCase() === val.toLowerCase())) return a;
        const isColor = a.name.toLowerCase() === 'color';
        return {
          ...a,
          values: [...a.values, { label: val, meta: isColor ? color : undefined }],
        };
      }
      return a;
    });

    setOptionAxes(updated);
    syncVariantRowsWithAxes(updated);
    setAxisInputValues((prev) => ({ ...prev, [axisId]: '' }));
  };

  const handleRemoveAxisValue = (axisId: string, valLabel: string) => {
    const updated = optionAxes.map((a) => {
      if (a.id === axisId) {
        return {
          ...a,
          values: a.values.filter((v) => v.label !== valLabel),
        };
      }
      return a;
    });

    setOptionAxes(updated);
    syncVariantRowsWithAxes(updated);
  };

  const handleAddOptionAxis = (presetName: string) => {
    const id = `axis-${Date.now()}`;
    const newAxis: OptionAxis = {
      id,
      name: presetName,
      values: [],
    };
    const updated = [...optionAxes, newAxis];
    setOptionAxes(updated);
  };

  const handleRemoveOptionAxis = (axisId: string) => {
    const updated = optionAxes.filter((a) => a.id !== axisId);
    setOptionAxes(updated);
    syncVariantRowsWithAxes(updated);
  };

  // Edit matrix table row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateVariantRow = (index: number, field: keyof FormVariantRow, value: any) => {
    setVariantRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteVariantRow = (index: number) => {
    setVariantRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute total stock from active variants
  const computedTotalStock = useMemo(() => {
    if (!form.hasVariants) return Number(form.stock) || 0;
    return variantRows.filter((r) => r.isActive).reduce((sum, r) => sum + (Number(r.stock) || 0), 0);
  }, [form.hasVariants, form.stock, variantRows]);

  // Fetch Category Tree and Collections from Database
  const fetchTaxonomies = async () => {
    try {
      setIsLoadingTaxonomies(true);
      const [catRes, colRes] = await Promise.all([
        fetch('/api/categories?tree=true'),
        fetch('/api/collections'),
      ]);
      const catData = await catRes.json();
      const colData = await colRes.json();

      if (catData.success && Array.isArray(catData.data)) {
        setCategoryTree(catData.data);
      }
      if (colData.success && Array.isArray(colData.data)) {
        setAvailableCollections(colData.data);
      }
    } catch (err) {
      console.error('Failed to load taxonomies:', err);
    } finally {
      setIsLoadingTaxonomies(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  // Sync Category Hierarchy if Editing an existing product
  useEffect(() => {
    if (categoryTree.length > 0 && product?.categoryId) {
      for (const root of categoryTree) {
        if (root._id === product.categoryId) {
          setSelectedRootId(root._id);
          return;
        }
        for (const parent of root.children || []) {
          if (parent._id === product.categoryId) {
            setSelectedRootId(root._id);
            setSelectedParentId(parent._id);
            return;
          }
          for (const sub of parent.children || []) {
            if (sub._id === product.categoryId) {
              setSelectedRootId(root._id);
              setSelectedParentId(parent._id);
              setSelectedSubId(sub._id);
              return;
            }
          }
        }
      }
    }
  }, [categoryTree, product?.categoryId]);

  const handleImagesChange = (newImages: MediaItem[]) => {
    newImages.forEach((img) => {
      if (img.key && !initialKeys.current.has(img.key) && !sessionUploadedKeys.current.includes(img.key)) {
        sessionUploadedKeys.current.push(img.key);
      }
    });
    setImages(newImages);
  };

  const handleCancel = async () => {
    if (sessionUploadedKeys.current.length > 0) {
      const keysToClean = [...sessionUploadedKeys.current];
      sessionUploadedKeys.current = [];
      try {
        await Promise.all(
          keysToClean.map((key) =>
            fetch(`/api/upload?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
          )
        );
      } catch (e) {
        console.error('Failed to cleanup uncommitted uploaded keys:', e);
      }
    }
    router.push('/admin/products');
  };

  const findCategoryInTree = (nodes: CategoryNode[], id: string): CategoryNode | null => {
    for (const node of nodes) {
      if (node._id === id) return node;
      if (node.children?.length > 0) {
        const found = findCategoryInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeRoot = selectedRootId ? findCategoryInTree(categoryTree, selectedRootId) : null;
  const activeParentList = activeRoot?.children || [];
  const activeParent = selectedParentId ? findCategoryInTree(activeParentList, selectedParentId) : null;
  const activeSubList = activeParent?.children || [];

  const applyCategorySelection = (rootId: string, parentId: string, subId: string) => {
    const root = rootId ? findCategoryInTree(categoryTree, rootId) : null;
    const parent = parentId && root ? findCategoryInTree(root.children || [], parentId) : null;
    const sub = subId && parent ? findCategoryInTree(parent.children || [], subId) : null;
    const active = sub || parent || root;

    if (active) {
      const pathSlugs = [...(active.ancestors || []), active.slug];
      setForm((prev) => ({
        ...prev,
        categoryId: active._id,
        categorySlug: active.slug,
        categoryPath: pathSlugs,
        categoryName: active.name,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        categoryId: '',
        categorySlug: '',
        categoryPath: [],
      }));
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          parentId: newCatParentId || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        await fetchTaxonomies();
        setShowAddCategoryModal(false);
        setNewCatName('');
        setNewCatParentId('');
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Error creating category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleToggleCollection = (colSlug: string) => {
    setForm((prev) => {
      const exists = prev.collections.includes(colSlug);
      return {
        ...prev,
        collections: exists
          ? prev.collections.filter((c) => c !== colSlug)
          : [...prev.collections, colSlug],
      };
    });
  };

  const handleAddCustomTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!val) return;

      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (!form.collections.includes(slug)) {
        setForm((prev) => ({ ...prev, collections: [...prev.collections, slug] }));
      }
      setCustomTagInput('');

      const existsInDb = availableCollections.some((c) => c.slug === slug);
      if (!existsInDb) {
        try {
          const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: val,
              slug,
              description: `Curated collection for ${val}`,
              badgeText: 'Curated',
            }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            setAvailableCollections((prev) => [...prev, data.data]);
          }
        } catch (err) {
          console.error('Failed to create collection behind custom tag:', err);
        }
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      collections: prev.collections.filter((t) => t !== tagToRemove),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Product title is required.');
      return;
    }

    setIsSaving(true);
    try {
      const fallbackSlug =
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') ||
        'new-product';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        title: form.title,
        description: form.description,
        productType: form.productType,
        sku: form.sku.trim(),
        brandName: form.brandName.trim(),
        stockStatus: form.stockStatus,
        categoryId: form.categoryId || undefined,
        categorySlug: form.categorySlug || undefined,
        categoryPath: form.categoryPath.length > 0 ? form.categoryPath : undefined,
        categoryName: form.categoryName || 'Garments',
        collections: form.collections,
        status: form.status,
        isActive: form.status === 'PUBLISHED',
        media: images,
      };

      if (form.hasVariants && variantRows.length > 0) {
        const activeRows = variantRows.filter((r) => r.isActive !== false);
        const totalStockCalc = activeRows.reduce((sum, r) => sum + (Number(r.stock) || 0), 0);

        const formattedVariantOptions = optionAxes
          .filter((axis) => axis.values.length > 0)
          .map((axis) => ({
            name: axis.name,
            values: axis.values.map((v) => ({ label: v.label, meta: v.meta || '' })),
          }));

        const formattedVariants = variantRows.map((r, idx) => ({
          _id: r._id,
          sku: r.sku.trim() || `${fallbackSlug.toUpperCase()}-${idx + 1}`,
          title: r.title,
          label: r.label || r.title,
          selectedOptions: r.selectedOptions,
          price: Number(r.price) || Number(form.price) || 0,
          discountPrice: r.discountPrice !== undefined && r.discountPrice !== null ? Number(r.discountPrice) : undefined,
          stock: Number(r.stock) || 0,
          stockStatus: r.stockStatus || 'AUTO',
          isActive: r.isActive !== false,
          isDefault: idx === 0,
        }));

        payload.hasVariants = true;
        payload.variantOptions = formattedVariantOptions;
        payload.variants = formattedVariants;
        payload.totalStock = totalStockCalc;
        payload.basePrice = Number(formattedVariants[0]?.price || form.price || 0);
        if (formattedVariants[0]?.discountPrice) {
          payload.discountPrice = Number(formattedVariants[0].discountPrice);
        } else if (form.discountPrice !== '') {
          payload.discountPrice = Number(form.discountPrice);
        }
      } else {
        payload.hasVariants = false;
        payload.variantOptions = [];
        payload.variants = [];
        payload.totalStock = Number(form.stock) || 0;
        payload.basePrice = Number(form.price) || 0;
        payload.discountPrice = form.discountPrice !== '' ? Number(form.discountPrice) : undefined;
      }

      const url = isEdit ? `/api/products/${product._id || product.slug}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        sessionUploadedKeys.current = [];
        setToast(isEdit ? 'Product updated successfully' : 'Product created successfully');
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 800);
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Failed to submit product:', err);
      alert('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: isEdit ? 'Edit Product' : 'Add Product' },
        ]}
      />

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#060d11]">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Update inventory, pricing, and variants.' : 'Create a new catalog product with variants and media.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            isLoading={isSaving}
            onClick={handleSubmit}
            className="bg-[#076E46] text-white hover:bg-[#055C3A]"
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Primary Content & Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: General Details */}
          <Card>
            <CardHeader bordered={false} className="pb-2">
              <CardTitle>General Information</CardTitle>
              <CardDescription>Product title, editorial details, and catalog type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name"
                required
                placeholder="e.g. Zulaikha Intricate Gold Zari Embroidered Abaya"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <Textarea
                label="Description"
                rows={4}
                placeholder="Product description and craftsmanship details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              {/* Price & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price (৳)"
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <Input
                  label={`Stock ${form.hasVariants ? '(Auto-summed from Matrix)' : ''}`}
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={form.hasVariants}
                  value={form.hasVariants ? computedTotalStock : form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>

              {/* Secondary Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <Input
                  label="Discount Price (৳)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Optional"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                />

                <Input
                  label="Base SKU"
                  placeholder="e.g. AUR-ZUL"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />

                <Input
                  label="Brand"
                  placeholder="e.g. Aurem Modest Couture"
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                />
              </div>

              {/* Product Type & Variant Mode Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <Select
                  label="Product Type"
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value as ProductType })}
                >
                  <option value="CLOTHING">Clothing & Apparel</option>
                  <option value="GADGET">Gadgets & Tech</option>
                  <option value="REGULAR">Regular Product</option>
                  <option value="FOOD">Food & Beverage</option>
                  <option value="SERVICE">Service</option>
                </Select>

                <div className="space-y-1.5 text-xs">
                  <label className="block font-semibold text-slate-700">Variants</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextHas = !form.hasVariants;
                      setForm({ ...form, hasVariants: nextHas });
                      if (nextHas && variantRows.length === 0) {
                        syncVariantRowsWithAxes(optionAxes);
                      }
                    }}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>{form.hasVariants ? 'Multi-Variant Matrix' : 'Single SKU'}</span>
                    <Badge variant={form.hasVariants ? 'success' : 'secondary'}>
                      {form.hasVariants ? 'Variants On' : 'Regular'}
                    </Badge>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Admin Variant Matrix Generator (Shown when hasVariants === true) */}
          {form.hasVariants && (
            <Card className="border-slate-200">
              <CardHeader bordered={false} className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <CardTitle>Variant Matrix & Options</CardTitle>
                    </div>
                    <CardDescription>
                      Configure sizes, colors, and generate inventory combinations with custom SKUs and pricing.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {!optionAxes.some((a) => a.name.toLowerCase() === 'size') && (
                      <button
                        type="button"
                        onClick={() => handleAddOptionAxis('Size')}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition cursor-pointer"
                      >
                        + Size
                      </button>
                    )}
                    {!optionAxes.some((a) => a.name.toLowerCase() === 'color') && (
                      <button
                        type="button"
                        onClick={() => handleAddOptionAxis('Color')}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition cursor-pointer"
                      >
                        + Color
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const customName = prompt('Enter custom option name (e.g. Material, Edition):');
                        if (customName && customName.trim()) {
                          handleAddOptionAxis(customName.trim());
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition cursor-pointer"
                    >
                      + Custom Option
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 1. Option Axes Chips Builder */}
                <div className="space-y-4">
                  {optionAxes.map((axis) => {
                    const isColor = axis.name.toLowerCase() === 'color';
                    const currentInput = axisInputValues[axis.id] || '';
                    const currentColor = axisInputColors[axis.id] || '#111111';

                    return (
                      <div key={axis.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Option: <strong className="text-[#060d11] font-semibold">{axis.name}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionAxis(axis.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition cursor-pointer"
                          >
                            Remove Axis
                          </button>
                        </div>

                        {/* Chips list */}
                        <div className="flex flex-wrap gap-2">
                          {axis.values.map((val) => (
                            <span
                              key={val.label}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 shadow-2xs text-slate-800"
                            >
                              {val.meta && (
                                <span
                                  className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: val.meta }}
                                />
                              )}
                              <span>{val.label}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAxisValue(axis.id, val.label)}
                                className="text-slate-400 hover:text-red-600 transition cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {axis.values.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No values added yet.</span>
                          )}
                        </div>

                        {/* Add Chip Input */}
                        <div className="flex items-center gap-2 pt-1">
                          {isColor && (
                            <input
                              type="color"
                              value={currentColor}
                              onChange={(e) =>
                                setAxisInputColors((prev) => ({ ...prev, [axis.id]: e.target.value }))
                              }
                              title="Pick Color Swatch"
                              className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                            />
                          )}
                          <input
                            type="text"
                            placeholder={isColor ? 'Color name (e.g. Midnight Black)' : `Add ${axis.name} (e.g. 54) and press Enter`}
                            value={currentInput}
                            onChange={(e) =>
                              setAxisInputValues((prev) => ({ ...prev, [axis.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddAxisValue(axis.id);
                              }
                            }}
                            className="flex-1 h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddAxisValue(axis.id)}
                            className="h-8 px-3 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Bulk Action Toolbar */}
                {variantRows.length > 0 && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700">Bulk Apply:</span>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Price (৳):</span>
                        <input
                          type="number"
                          placeholder="e.g. 4450"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          className="w-24 h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkPrice}
                          className="h-7 px-2.5 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Stock:</span>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                          className="w-20 h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkStock}
                          className="h-7 px-2.5 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Generated Matrix Table */}
                {variantRows.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3">Variant</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Price (৳)</th>
                          <th className="py-2.5 px-3">Discount (৳)</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3 text-center">Active</th>
                          <th className="py-2.5 px-3 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variantRows.map((row, idx) => (
                          <tr key={idx} className={`hover:bg-slate-50/70 ${!row.isActive ? 'opacity-50' : ''}`}>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                              {row.title}
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={row.sku}
                                onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                                className="w-36 h-7 rounded border border-slate-200 bg-white px-2 font-mono text-xs text-slate-800 focus:outline-emerald-600"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                value={row.price}
                                onChange={(e) => handleUpdateVariantRow(idx, 'price', Number(e.target.value))}
                                className="w-24 h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-emerald-600"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                placeholder="—"
                                value={row.discountPrice ?? ''}
                                onChange={(e) =>
                                  handleUpdateVariantRow(
                                    idx,
                                    'discountPrice',
                                    e.target.value !== '' ? Number(e.target.value) : undefined
                                  )
                                }
                                className="w-24 h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-emerald-600"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                value={row.stock}
                                onChange={(e) => handleUpdateVariantRow(idx, 'stock', Number(e.target.value))}
                                className="w-20 h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800 focus:outline-emerald-600"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.isActive}
                                onChange={(e) => handleUpdateVariantRow(idx, 'isActive', e.target.checked)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteVariantRow(idx)}
                                className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                                title="Delete variant row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                    Add option values above to generate the variant matrix.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card 3: Media Uploader */}
          <MediaUploader
            value={images}
            onChange={handleImagesChange}
            multiple={true}
            maxFiles={8}
            aspectRatio="3:4"
          />
        </div>

        {/* Right Column: Organization */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader bordered={false} className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Organization</CardTitle>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                >
                  + New
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <Select
                label="Category"
                value={selectedRootId}
                disabled={isLoadingTaxonomies}
                onChange={(e) => {
                  const newRootId = e.target.value;
                  setSelectedRootId(newRootId);
                  setSelectedParentId('');
                  setSelectedSubId('');
                  applyCategorySelection(newRootId, '', '');
                }}
              >
                <option value="">Select Category...</option>
                {categoryTree.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              {/* Sub-Category */}
              {activeParentList.length > 0 && (
                <Select
                  label="Subcategory"
                  value={selectedParentId}
                  onChange={(e) => {
                    const newParentId = e.target.value;
                    setSelectedParentId(newParentId);
                    setSelectedSubId('');
                    applyCategorySelection(selectedRootId, newParentId, '');
                  }}
                >
                  <option value="">Select Subcategory...</option>
                  {activeParentList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}

              {/* Item Type */}
              {activeSubList.length > 0 && (
                <Select
                  label="Item Type"
                  value={selectedSubId}
                  onChange={(e) => {
                    const newSubId = e.target.value;
                    setSelectedSubId(newSubId);
                    applyCategorySelection(selectedRootId, selectedParentId, newSubId);
                  }}
                >
                  <option value="">Select Item Type...</option>
                  {activeSubList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              )}

              {/* Status Dropdown */}
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
              >
                <option value="PUBLISHED">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </Select>

              {/* Stock Status Override */}
              <Select
                label="Stock Status"
                value={form.stockStatus}
                onChange={(e) => setForm({ ...form, stockStatus: e.target.value as StockStatus })}
              >
                <option value="AUTO">Auto</option>
                <option value="FORCE_OUT_OF_STOCK">Force Out of Stock</option>
                <option value="PRE_ORDER">Pre-Order</option>
              </Select>

              {/* Marketing Collections Tags */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 text-xs">
                  Collections
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {availableCollections.map((col) => {
                    const isSelected = form.collections.includes(col.slug);
                    return (
                      <button
                        key={col._id}
                        type="button"
                        onClick={() => handleToggleCollection(col.slug)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {col.title}
                      </button>
                    );
                  })}
                </div>

                <Input
                  placeholder="+ Add new collection to database (press Enter)"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                />

                {form.collections.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {form.collections.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Button
              type="submit"
              variant="default"
              isLoading={isSaving}
              className="w-full h-10 text-xs bg-[#076E46] text-white hover:bg-[#055C3A]"
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full h-10 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Category</CardTitle>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  label="Category Name"
                  required
                  placeholder="e.g. Smart Watches"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />

                <Select
                  label="Parent Category"
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                >
                  <option value="">None (Root Category)</option>
                  {categoryTree.map((root) => (
                    <React.Fragment key={root._id}>
                      <option value={root._id}>{root.name}</option>
                      {root.children?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          &nbsp;&nbsp;↳ {sub.name}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </Select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCategoryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" isLoading={isCreatingCategory}>
                    Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
