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

export default function PaymentTab({
  config,
  setConfig,
  showSecrets,
  toggleSecret,
}: SecretsTabProps) {
  return (
    <div className="space-y-6">
      {/* Cash on Delivery */}
      <Card id="payment-cod" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Cash on Delivery (COD)</CardTitle>
            <CardDescription>
              Allow customers across Bangladesh to pay upon parcel delivery.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.cod?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  cod: { ...config.payment?.cod, enabled: e.target.value === 'true' },
                },
                features: {
                  ...config.features,
                  codEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        <CardContent>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Checkout Note</label>
          <Input
            value={config.payment?.cod?.note || ''}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  cod: { ...config.payment?.cod, note: e.target.value },
                },
              })
            }
            placeholder="Cash on delivery across 64 districts in Bangladesh"
          />
        </CardContent>
      </Card>

      {/* Manual bKash */}
      <Card id="payment-bkash-manual" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Manual bKash Send Money</CardTitle>
            <CardDescription>
              Receive manual payments directly to your personal, agent, or merchant wallet.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.manualBkash?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  manualBkash: {
                    ...config.payment?.manualBkash,
                    enabled: e.target.value === 'true',
                  },
                },
                features: {
                  ...config.features,
                  manualBkashEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        {config.payment?.manualBkash?.enabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">bKash Wallet Number</label>
              <Input
                value={config.payment?.manualBkash?.number || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualBkash: {
                        ...config.payment?.manualBkash,
                        number: e.target.value,
                      },
                    },
                  })
                }
                placeholder="01700000000"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
              <Select
                value={config.payment?.manualBkash?.accountType || 'PERSONAL'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualBkash: {
                        ...config.payment?.manualBkash,
                        accountType: e.target.value,
                      },
                    },
                  })
                }
              >
                <option value="PERSONAL">Personal</option>
                <option value="AGENT">Agent</option>
                <option value="MERCHANT">Merchant</option>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
              <Input
                value={config.payment?.manualBkash?.instructions || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualBkash: {
                        ...config.payment?.manualBkash,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Send Money to our personal bKash number and provide your TrxID below."
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Manual Nagad */}
      <Card id="payment-nagad-manual" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Manual Nagad Send Money</CardTitle>
            <CardDescription>
              Receive manual payments to your personal or merchant Nagad account.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.manualNagad?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  manualNagad: {
                    ...config.payment?.manualNagad,
                    enabled: e.target.value === 'true',
                  },
                },
                features: {
                  ...config.features,
                  manualNagadEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        {config.payment?.manualNagad?.enabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Nagad Wallet Number</label>
              <Input
                value={config.payment?.manualNagad?.number || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualNagad: {
                        ...config.payment?.manualNagad,
                        number: e.target.value,
                      },
                    },
                  })
                }
                placeholder="01700000000"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
              <Select
                value={config.payment?.manualNagad?.accountType || 'PERSONAL'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualNagad: {
                        ...config.payment?.manualNagad,
                        accountType: e.target.value,
                      },
                    },
                  })
                }
              >
                <option value="PERSONAL">Personal</option>
                <option value="AGENT">Agent</option>
                <option value="MERCHANT">Merchant</option>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
              <Input
                value={config.payment?.manualNagad?.instructions || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualNagad: {
                        ...config.payment?.manualNagad,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Send Money to our personal Nagad number and provide your TrxID below."
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Manual Rocket */}
      <Card id="payment-rocket-manual" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Manual Rocket Send Money</CardTitle>
            <CardDescription>
              Receive manual payments to your personal or merchant Rocket account.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.manualRocket?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  manualRocket: {
                    ...config.payment?.manualRocket,
                    enabled: e.target.value === 'true',
                  },
                },
                features: {
                  ...config.features,
                  manualRocketEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        {config.payment?.manualRocket?.enabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rocket Wallet Number</label>
              <Input
                value={config.payment?.manualRocket?.number || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualRocket: {
                        ...config.payment?.manualRocket,
                        number: e.target.value,
                      },
                    },
                  })
                }
                placeholder="01700000000"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Account Type</label>
              <Select
                value={config.payment?.manualRocket?.accountType || 'PERSONAL'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualRocket: {
                        ...config.payment?.manualRocket,
                        accountType: e.target.value,
                      },
                    },
                  })
                }
              >
                <option value="PERSONAL">Personal</option>
                <option value="AGENT">Agent</option>
                <option value="MERCHANT">Merchant</option>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Instructions</label>
              <Input
                value={config.payment?.manualRocket?.instructions || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      manualRocket: {
                        ...config.payment?.manualRocket,
                        instructions: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Send Money to our Rocket number and provide your TrxID below."
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* bKash PGW (Direct API) */}
      <Card id="payment-bkash-pgw" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>bKash PGW (Direct API)</CardTitle>
            <CardDescription>
              Automated tokenized checkout gateway via bKash Merchant API.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.bkashPGW?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  bkashPGW: {
                    ...config.payment?.bkashPGW,
                    enabled: e.target.value === 'true',
                  },
                },
                features: {
                  ...config.features,
                  bkashPgwEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        {config.payment?.bkashPGW?.enabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">App Key</label>
              <Input
                value={config.payment?.bkashPGW?.appKey || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      bkashPGW: {
                        ...config.payment?.bkashPGW,
                        appKey: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter App Key"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">App Secret</label>
              <div className="relative">
                <Input
                  type={showSecrets['bkash_secret'] ? 'text' : 'password'}
                  value={config.payment?.bkashPGW?.appSecret || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment: {
                        ...config.payment,
                        bkashPGW: {
                          ...config.payment?.bkashPGW,
                          appSecret: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Enter App Secret"
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('bkash_secret')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSecrets['bkash_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Username</label>
              <Input
                value={config.payment?.bkashPGW?.username || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      bkashPGW: {
                        ...config.payment?.bkashPGW,
                        username: e.target.value,
                      },
                    },
                  })
                }
                placeholder="bKash API Username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showSecrets['bkash_pass'] ? 'text' : 'password'}
                  value={config.payment?.bkashPGW?.password || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment: {
                        ...config.payment,
                        bkashPGW: {
                          ...config.payment?.bkashPGW,
                          password: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="bKash API Password"
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('bkash_pass')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSecrets['bkash_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Environment</label>
              <Select
                value={config.payment?.bkashPGW?.isSandbox ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      bkashPGW: {
                        ...config.payment?.bkashPGW,
                        isSandbox: e.target.value === 'true',
                      },
                    },
                  })
                }
              >
                <option value="true">Sandbox (Testing)</option>
                <option value="false">Live Production</option>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* SSLCommerz Gateway */}
      <Card id="payment-sslcommerz" className="scroll-mt-16">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>SSLCommerz Gateway</CardTitle>
            <CardDescription>
              Aggregator gateway supporting Visa, MasterCard, bKash, Nagad, and Internet Banking.
            </CardDescription>
          </div>
          <Select
            value={config.payment?.sslCommerz?.enabled ? 'true' : 'false'}
            onChange={(e) =>
              setConfig({
                ...config,
                payment: {
                  ...config.payment,
                  sslCommerz: {
                    ...config.payment?.sslCommerz,
                    enabled: e.target.value === 'true',
                  },
                },
                features: {
                  ...config.features,
                  sslCommerzEnabled: e.target.value === 'true',
                },
              })
            }
            className="w-32"
          >
            <option value="true">Active</option>
            <option value="false">Disabled</option>
          </Select>
        </CardHeader>
        {config.payment?.sslCommerz?.enabled && (
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store ID</label>
              <Input
                value={config.payment?.sslCommerz?.storeId || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      sslCommerz: {
                        ...config.payment?.sslCommerz,
                        storeId: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter SSLCommerz Store ID"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Store Password</label>
              <div className="relative">
                <Input
                  type={showSecrets['ssl_pass'] ? 'text' : 'password'}
                  value={config.payment?.sslCommerz?.storePass || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      payment: {
                        ...config.payment,
                        sslCommerz: {
                          ...config.payment?.sslCommerz,
                          storePass: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Enter Store Password"
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('ssl_pass')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSecrets['ssl_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Environment</label>
              <Select
                value={config.payment?.sslCommerz?.isSandbox ? 'true' : 'false'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    payment: {
                      ...config.payment,
                      sslCommerz: {
                        ...config.payment?.sslCommerz,
                        isSandbox: e.target.value === 'true',
                      },
                    },
                  })
                }
              >
                <option value="true">Sandbox (Testing)</option>
                <option value="false">Live Production</option>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
