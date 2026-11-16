import { redirect } from 'next/navigation';

export default async function CollectionsAllPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) query.set(key, val);
  });
  const queryString = query.toString();
  redirect(queryString ? `/shop?${queryString}` : '/shop');
}
