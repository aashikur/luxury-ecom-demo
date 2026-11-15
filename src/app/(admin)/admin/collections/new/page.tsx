import React from 'react';
import CollectionFormClient from '@/components/admin/CollectionFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Add Collection | Aurem Admin',
  description: 'Create a new marketing collection or seasonal drop',
};

export default function NewCollectionPage() {
  return <CollectionFormClient mode="create" />;
}
