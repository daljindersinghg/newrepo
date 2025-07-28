// src/components/landing/Footer.tsx
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-2xl font-bold">DentalBook</span>
            </div>
            <p className="text-gray-300 mb-4">
              Find and book dental appointments. Get $50 gift card for your first visit.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/search" className="text-gray-300 hover:text-white">Find Dentists</a></li>
              <li><a href="/how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
              <li><a href="/gift-cards" className="text-gray-300 hover:text-white">Gift Cards</a></li>
              <li><a href="/help" className="text-gray-300 hover:text-white">Help</a></li>
            </ul>
          </div>

          {/* For Dentists */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Dentists</h3>
            <ul className="space-y-2">
              <li><a href="/dentist-signup" className="text-gray-300 hover:text-white">Join Platform</a></li>
              <li><a href="/dentist-login" className="text-gray-300 hover:text-white">Dentist Login</a></li>
              <li><a href="/practice-tools" className="text-gray-300 hover:text-white">Practice Tools</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">
                © {currentYear} DentalBook. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</a>
              <a href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</a>
            </div>
          </div>
          
          {/* Simple Legal Text */}
          <div className="mt-4 text-xs text-gray-500">
            <p>
              *$50 gift card for new patients after first appointment. Terms apply.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}