import React from 'react';
import Link from 'next/link';

interface FooterProps {
  storeName: string;
  tagline: string;
  showroomAddress: string;
  supportPhone: string;
  whatsappNumber: string;
  accentColor?: string;
}

export default function Footer({
  storeName,
  tagline,
  showroomAddress,
  supportPhone,
  whatsappNumber,
  accentColor = '#B8860B',
}: FooterProps) {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-12 text-xs border-t border-zinc-900 mt-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
        <div className="space-y-3">
          <span
            style={{ color: accentColor }}
            className="text-xl font-serif font-bold tracking-[0.2em] uppercase block"
          >
            {storeName}
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {tagline}. Crafted with architectural precision for everyday confidence and timeless comfort.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-widest mb-3">SHOWROOM & DISPATCH</h4>
          <p>
            <strong className="text-zinc-200">Address:</strong> {showroomAddress}
          </p>
          <p>
            <strong className="text-zinc-200">Phone:</strong> {supportPhone}
          </p>
          <p>
            <strong className="text-zinc-200">WhatsApp:</strong> +{whatsappNumber}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-widest mb-3">POLICIES</h4>
          <ul className="space-y-2">
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Terms & Conditions
              </span>
            </li>
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Return & Exchange Policy (3 Days)
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-widest mb-3">QUICK NAVIGATION</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop?collection=hoodies" className="hover:text-white transition">
                Heavyweight Hoodies
              </Link>
            </li>
            <li>
              <Link href="/shop?collection=t-shirts" className="hover:text-white transition">
                Oversized Tees
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-white transition">
                Full Collection
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-zinc-600 text-[11px] gap-4">
        <p>© 2026 {storeName}. All rights reserved.</p>
        <p className="tracking-widest uppercase">
          POWERED BY{' '}
          <a
            href="https://wa.me/8801580563883"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition font-semibold underline underline-offset-4 decoration-zinc-700 cursor-pointer"
          >
            Ashikur Rahaman
          </a>
        </p>
      </div>
    </footer>
  );
}
