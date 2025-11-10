import React from 'react'

const Leaderboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-warm-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6 leading-normal" style={{ paddingBottom: '0.1em' }}>
            GUI Agent Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fair evaluation of GUI agents across AI-generated environments prevents over-fitting and ensures authentic performance assessment.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="card max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Fair Evaluation Coming Soon
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We&apos;re building a comprehensive leaderboard that evaluates GUI agents on AI-generated environments, ensuring no over-fitting and authentic performance measurement.
            </p>
            <div className="animate-pulse-warm">
              <p className="text-warm-600 font-medium">
                Eliminating over-fitting, one evaluation at a time!
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What Makes Our Leaderboard Different:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-warm-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-warm-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No Over-fitting</h4>
                <p className="text-sm text-gray-600">
                  AI-generated environments ensure each evaluation is unique and cannot be memorized
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-coral-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-coral-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Fair Competition</h4>
                <p className="text-sm text-gray-600">
                  All agents tested on dynamically generated scenarios for authentic assessment
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Real-world Relevance</h4>
                <p className="text-sm text-gray-600">
                  Evaluations reflect actual GUI interaction challenges faced in production
                </p>
              </div>
            </div>
          </div>

          {/* Evaluation Methodology */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Our Evaluation Philosophy:
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-warm-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-warm-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Dynamic Environment Generation</h4>
                  <p className="text-sm text-gray-600">
                    Each evaluation uses unique AI-generated GUI environments that cannot be anticipated or memorized
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-coral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Comprehensive GUI Tasks</h4>
                  <p className="text-sm text-gray-600">
                    Testing across diverse interaction patterns including clicking, typing, navigation, and complex multi-step operations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Extensible Framework</h4>
                  <p className="text-sm text-gray-600">
                    Continuously evolving with new agent types, environment complexities, and evaluation metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard