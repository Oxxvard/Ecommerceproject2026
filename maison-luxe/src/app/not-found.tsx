import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-block"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
