'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Oups !</h2>
        <p className="text-gray-600 mb-8">
          Une erreur s'est produite. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
