'use client';

import React from 'react';
import SettingsShell from './settings/SettingsShell';
import type { CategoryOption, CollectionOption, BrandOption } from './settings/types';

export interface SettingsFormClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialConfig: any;
  categories?: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
}

export default function SettingsFormClient(props: SettingsFormClientProps) {
  return <SettingsShell {...props} />;
}
