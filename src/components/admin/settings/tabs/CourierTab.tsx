'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
} from '@/components/ui';
import type { SecretsTabProps } from '../types';

export default function CourierTab({
  config,
  setConfig,
  showSecrets,
  toggleSecret,
}: SecretsTabProps) {
  return (
    <div className="space-y-6">
      {/* Courier Gateway */}
      <Card id="courier-gateway">
        <CardHeader>
          <CardTitle>Courier Gateway Integration</CardTitle>
          <CardDescription>
            Steadfast Courier / Pathao API automated parcel booking and consignment creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Active Courier Provider</label>
            <Select
              value={config.courier?.provider || 'STEADFAST'}
              onChange={(e) =>
                setConfig({
                  ...config,
                  courier: { ...config.courier, provider: e.target.value },
                })
              }
            >
              <option value="STEADFAST">Steadfast Courier</option>
              <option value="PATHAO">Pathao Courier</option>
              <option value="REDX">RedX Logistics</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Auto Courier Booking</label>
            <Select
              value={config.features?.courierAutoBooking ? 'true' : 'false'}
              onChange={(e) =>
                setConfig({
                  ...config,
                  features: {
                    ...config.features,
                    courierAutoBooking: e.target.value === 'true',
                  },
                })
              }
            >
              <option value="false">Disabled</option>
              <option value="true">Active</option>
            </Select>
          </div>

          {config.courier?.provider === 'STEADFAST' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast API Key</label>
                <div className="relative">
                  <Input
                    type={showSecrets['steadfast_key'] ? 'text' : 'password'}
                    value={config.courier?.steadfast?.apiKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          steadfast: {
                            ...config.courier?.steadfast,
                            apiKey: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter Steadfast API Key"
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('steadfast_key')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['steadfast_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast Secret Key</label>
                <div className="relative">
                  <Input
                    type={showSecrets['steadfast_secret'] ? 'text' : 'password'}
                    value={config.courier?.steadfast?.secretKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          steadfast: {
                            ...config.courier?.steadfast,
                            secretKey: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter Steadfast Secret Key"
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('steadfast_secret')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['steadfast_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Steadfast Base URL</label>
                <Input
                  value={config.courier?.steadfast?.baseUrl || 'https://portal.steadfast.com.bd/api/v1'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        steadfast: {
                          ...config.courier?.steadfast,
                          baseUrl: e.target.value,
                        },
                      },
                    })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </>
          )}

          {config.courier?.provider === 'PATHAO' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Store ID</label>
                <Input
                  value={config.courier?.pathao?.storeId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        pathao: {
                          ...config.courier?.pathao,
                          storeId: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Enter Pathao Store ID"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Client ID</label>
                <Input
                  value={config.courier?.pathao?.clientId || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        pathao: {
                          ...config.courier?.pathao,
                          clientId: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Enter Client ID"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Client Secret</label>
                <div className="relative">
                  <Input
                    type={showSecrets['pathao_secret'] ? 'text' : 'password'}
                    value={config.courier?.pathao?.clientSecret || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        courier: {
                          ...config.courier,
                          pathao: {
                            ...config.courier?.pathao,
                            clientSecret: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Enter Client Secret"
                    className="font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('pathao_secret')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets['pathao_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pathao Username</label>
                <Input
                  value={config.courier?.pathao?.username || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      courier: {
                        ...config.courier,
                        pathao: {
                          ...config.courier?.pathao,
                          username: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Pathao Account Email/Username"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Return Fraud Shield */}
      <Card id="courier-fraud">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Customer Return Fraud Shield</CardTitle>
            <CardDescription>
              Checks customer phone number history against courier delivery success rates.
            </CardDescription>
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
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Alert Threshold Rate (% Delivery Success)
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={config.courier?.fraudCheck?.alertThresholdPercent ?? 60}
              onChange={(e) =>
                setConfig({
                  ...config,
                  courier: {
                    ...config.courier,
                    fraudCheck: {
                      ...config.courier?.fraudCheck,
                      alertThresholdPercent: Number(e.target.value),
                    },
                  },
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Auto-Hold High Risk Orders
            </label>
            <Select
              value={config.courier?.fraudCheck?.autoHoldHighRisk ? 'true' : 'false'}
              onChange={(e) =>
                setConfig({
                  ...config,
                  courier: {
                    ...config.courier,
                    fraudCheck: {
                      ...config.courier?.fraudCheck,
                      autoHoldHighRisk: e.target.value === 'true',
                    },
                  },
                })
              }
            >
              <option value="false">Disabled</option>
              <option value="true">Active</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advance Delivery Fee Protection */}
      <Card id="courier-advance">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Advance Delivery Fee Protection</CardTitle>
            <CardDescription>
              Require customers to pay advance delivery charge via bKash/Nagad before booking.
            </CardDescription>
          </div>
          <Select
            value={config.features?.advanceDeliveryFeeEnabled ? 'true' : 'false'}
            onChange={(e) => {
              const isEnabled = e.target.value === 'true';
              setConfig({
                ...config,
                features: {
                  ...config.features,
                  advanceDeliveryFeeEnabled: isEnabled,
                },
                courier: {
                  ...config.courier,
                  advancePayment: {
                    ...config.courier?.advancePayment,
                    enabled: isEnabled,
                  },
                },
              });
            }}
            className="w-32"
          >
            <option value="false">Disabled</option>
            <option value="true">Active</option>
          </Select>
        </CardHeader>
        {config.features?.advanceDeliveryFeeEnabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Advance Amount (৳)
              </label>
              <Input
                type="number"
                value={config.courier?.advancePayment?.amount ?? 130}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        amount: Number(e.target.value),
                      },
                    },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Scope</label>
              <Select
                value={
                  config.courier?.advancePayment?.applyOnlyOutsideDhaka !== false
                    ? 'true'
                    : 'false'
                }
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        applyOnlyOutsideDhaka: e.target.value === 'true',
                      },
                    },
                  })
                }
              >
                <option value="true">Outside Dhaka Only</option>
                <option value="false">All Orders</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Provider</label>
              <Select
                value={config.courier?.advancePayment?.walletType || 'BKASH'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        walletType: e.target.value,
                      },
                    },
                  })
                }
              >
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="ROCKET">Rocket</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Wallet Number</label>
              <Input
                value={config.courier?.advancePayment?.walletNumber || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        walletNumber: e.target.value,
                      },
                    },
                  })
                }
                placeholder="01700000000"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
              <Input
                value={config.courier?.advancePayment?.instructions || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    courier: {
                      ...config.courier,
                      advancePayment: {
                        ...config.courier?.advancePayment,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                placeholder="ঢাকার বাইরের অর্ডারের জন্য অগ্রিম ১৩০ টাকা ডেলিভারি চার্জ বিকাশ করে ট্রানজেকশন আইডি দিন।"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
