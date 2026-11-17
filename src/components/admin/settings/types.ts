import React from 'react';
import type { IHomeSection } from '@/models/StoreConfig';

export interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface CollectionOption {
  _id: string;
  title: string;
  slug: string;
  badgeText?: string;
}

export interface BrandOption {
  _id: string;
  name: string;
  slug: string;
}

export interface BaseTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setConfig: React.Dispatch<React.SetStateAction<any>>;
}

export interface SecretsTabProps extends BaseTabProps {
  showSecrets: Record<string, boolean>;
  toggleSecret: (field: string) => void;
}

export interface BrandingTabProps extends BaseTabProps {
  categories?: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export interface HomepageLayoutTabProps extends BaseTabProps {
  categories?: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export interface TabDefinition {
  id: 'branding' | 'logistics' | 'payment' | 'courier' | 'tracking' | 'sections' | 'features';
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  description: string;
  subSections: { id: string; label: string }[];
}
