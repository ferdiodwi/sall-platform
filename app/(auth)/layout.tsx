import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo SALL */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg mb-4">
          <span className="text-2xl">👗</span>
        </div>
        <h1 className="text-2xl font-bold text-rose-600" style={{ fontFamily: 'var(--font-playfair)' }}>
          SALL
        </h1>
        <p className="text-sm text-rose-400 mt-1">Self-Access Language Learning</p>
      </div>

      {/* Card konten */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-rose-300 text-center">
        SMKN 2 Bondowoso · Kelas XI Tata Busana
      </p>
    </div>
  )
}
