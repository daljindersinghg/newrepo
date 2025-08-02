// components/landing/StaticSearchHero.tsx
export function StaticSearchHero() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8 md:p-12"
      aria-label="Search Hero"
    >
      {/* Hero Text */}
      <div className="max-w-xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
        <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          Find Dentists Near You
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Your Perfect Dentist<br />
          Is Just a Search Away
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-sm mx-auto">
          Enter your address to discover verified dentists with instant booking and same-day availability.
        </p>
      </div>

      {/* Disabled search interface for SEO */}
      <div className="max-w-lg mx-auto w-full bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <input
          type="text"
          aria-label="Enter address to search dentists"
          placeholder="Type address, city, or ZIP"
          className="w-full h-12 px-4 border border-gray-200 rounded-lg"
          disabled
        />
        <button
          className="mt-4 w-full py-3 font-semibold rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed"
          disabled
        >
          Search Dentists
        </button>
      </div>
    </section>
  );
}

