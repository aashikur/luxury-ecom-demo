import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Select } from '@/components/ui';
import { BaseTabProps } from '../types';

export default function FeaturesTab({ config, setConfig }: BaseTabProps) {
  return (
    <div className="space-y-6">
      <Card id="features-switches" className="scroll-mt-16">
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
    </div>
  );
}
