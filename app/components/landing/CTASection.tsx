import { getGiftCardAmount, getGiftCardText } from '@/lib/config/app-config';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main CTA */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Ready to Find Your Perfect Dentist?
          </h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Join thousands of happy patients who've found quality dental care and earned rewards through our platform
          </p>
          
      
          
          <div className="flex items-center justify-center space-x-6 text-slate-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Instant booking</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>$50 reward guaranteed</span>
            </div>
          </div>
        </div>

        {/* Gift Card Highlight */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-full p-3 mr-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{getGiftCardAmount()} {getGiftCardText().charAt(0).toUpperCase() + getGiftCardText().slice(1)}</h3>
              <p className="text-slate-600">After your first appointment</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-800 mb-2">1</div>
              <div className="text-slate-700">Book appointment</div>
            </div>
            <div className="bg-white/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-800 mb-2">2</div>
              <div className="text-slate-700">Complete visit</div>
            </div>
            <div className="bg-white/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-slate-800 mb-2">3</div>
              <div className="text-slate-700">Get {getGiftCardAmount()} {getGiftCardText()}</div>
            </div>
          </div>
        </div>

        {/* Urgency Element */}
        <div className="mt-12 bg-orange-200/60 border border-orange-300/50 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center text-slate-800">
            <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Limited time: Double rewards this month!</span>
          </div>
        </div>
      </div>
    </section>
  );
}