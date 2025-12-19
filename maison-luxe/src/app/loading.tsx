export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Chargement...</p>
      </div>
    </div>
  )
}
