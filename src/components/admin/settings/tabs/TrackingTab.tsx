import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { BaseTabProps } from '../types';

interface TrackingTabProps extends BaseTabProps {
  showSecrets: Record<string, boolean>;
  toggleSecret: (field: string) => void;
}

export default function TrackingTab({ config, setConfig, showSecrets, toggleSecret }: TrackingTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Meta (Facebook) Pixel & CAPI */}
      <Card id="tracking-meta" className="scroll-mt-16">
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

      {/* 2. Google Analytics & GTM */}
      <Card id="tracking-gtm" className="scroll-mt-16">
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

      {/* 3. TikTok Pixel */}
      <Card id="tracking-tiktok" className="scroll-mt-16">
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
  );
}
