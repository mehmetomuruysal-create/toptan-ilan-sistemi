"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function MobileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden">
          <div className="flex justify-end p-4">
            <button onClick={() => setIsOpen(false)} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col items-center gap-4 p-8">
            {session ? (
              <>
                <span className="text-lg font-medium">Hoş geldin, {session.user?.name}</span>
               {/* MobileMenu.tsx içinde bu satırı bul ve büyük harfle SATICI yap: */}
{(session.user as any)?.rol === "SATICI" && (
  <Link href="/ilan-ekle" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl">
    + İlan Ekle
  </Link>
)}
                {(session.user as any)?.isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-purple-600 text-white rounded-xl">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full py-3 bg-red-500 text-white rounded-xl"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-gray-200 rounded-xl">
                  Giriş Yap
                </Link>
                <Link href="/kayit" onClick={() => setIsOpen(false)} className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl">
                  Kayıt Ol
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}