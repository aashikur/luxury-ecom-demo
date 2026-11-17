import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Select } from '@/components/ui';
import { BaseTabProps } from '../types';

export default function LogisticsTab({ config, setConfig }: BaseTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Regional Delivery Rates */}
      <Card id="logistics-tariffs" className="scroll-mt-16">
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

      {/* 2. Customer Contacts & Helpdesk */}
      <Card id="logistics-contacts" className="scroll-mt-16">
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
  );
}
