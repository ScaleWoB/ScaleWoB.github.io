import React from 'react';
import HeroSection from '../components/common/HeroSection';
import StatCard from '../components/common/StatCard';
import FeatureCard from '../components/common/FeatureCard';
import CTAButtons from '../components/common/CTAButtons';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: '🚀 Revolutionary GUI Agent Evaluation',
          variant: 'default',
        }}
        title={['ScaleCUA', 'Benchmark']}
        description="Experience the future of fair GUI agent testing with AI-generated environments that eliminate over-fitting and ensure authentic evaluation of agent capabilities."
        buttons={[
          {
            text: 'View Leaderboard',
            to: '/leaderboard',
            variant: 'primary-on-warm',
          },
          {
            text: 'Explore Environments',
            to: '/environment',
            variant: 'secondary-on-warm',
          },
        ]}
        backgroundVariant="warm-gradient"
        showPulseDots={true}
      />

      {/* Features Section - Enhanced with Varied Layouts */}
      <div className="py-20 bg-gradient-to-br from-warm-50 to-coral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-warm-100 text-warm-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Core Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why ScaleCUA?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our benchmark revolutionizes GUI agent evaluation with
              AI-generated environments that prevent over-fitting and ensure
              fair assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Featured Feature - Larger */}
            <div className="lg:col-span-2">
              <FeatureCard
                variant="featured"
                title="AI-Generated Environments"
                description="Dynamic testing environments created by AI ensure unique evaluation scenarios for every session, preventing memorization and guaranteeing fair assessment of agent capabilities."
                tags={[
                  'Unique Per Session',
                  'Infinite Variations',
                  'Zero Over-fitting',
                ]}
                colorTheme="warm"
                borderAccent={true}
                icon={
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Secondary Features */}
            <FeatureCard
              title="GUI Agent Evaluation"
              description="Specialized benchmark for evaluating graphical user interface agents across diverse interaction scenarios and real-world applications."
              colorTheme="coral"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Fair Evaluation"
              description="Eliminates over-fitting issues found in fixed environment benchmarks by generating unique testing scenarios for each evaluation."
              colorTheme="gold"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Flexible & Extensible"
              description="Adaptive framework that easily incorporates new agent types, environments, and evaluation metrics as the field evolves."
              colorTheme="warm"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              }
            />

            <FeatureCard
              title="Interactive Demos"
              description="Live interactive environments showcasing agent capabilities in real-time testing scenarios with diverse GUI challenges."
              colorTheme="coral"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Benchmark Scale Section - Enhanced Visual Design */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-coral-100 text-coral-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              Platform Scale
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Benchmark Scale & Coverage
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience unprecedented scale and flexibility in GUI agent
              evaluation with our comprehensive benchmark platform.
            </p>
          </div>

          {/* Primary Stats - Compact Single Row Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatCard
              variant="benchmark"
              value="Universal"
              description="Any GUI Agent • Minimum Cost"
              label="Universal Access"
              colorTheme="warm"
              features={['Zero infrastructure', 'Cloud-based evaluation']}
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              }
            />

            <StatCard
              variant="benchmark"
              value="∞"
              description="Generated Environments"
              label="Infinite Scale"
              colorTheme="coral"
              features={['AI-powered generation', 'Never repeated']}
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />

            <StatCard
              variant="benchmark"
              value="50K+"
              description="Test Scenarios"
              label="Comprehensive"
              colorTheme="gold"
              features={['Multi-platform', 'Real-world apps']}
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              }
            />

            <StatCard
              variant="benchmark"
              value="Zero"
              description="Over-fitting Risk"
              label="Secure"
              colorTheme="warm"
              features={['Dynamic generation', 'Fair evaluation']}
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
            />
          </div>

          {/* Summary Stats Bar */}
          <div className="bg-gradient-to-r from-warm-500 to-coral-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full"></div>
            </div>
            <div className="relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">3</div>
                  <div className="text-sm opacity-90">Platform Types</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">527</div>
                  <div className="text-sm opacity-90">Test Cases</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-sm opacity-90">AI Generated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">0</div>
                  <div className="text-sm opacity-90">Memorization</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section with Dynamic Background */}
      <div className="py-20 md:py-32 bg-gradient-to-br from-coral-400 via-coral-500 to-warm-600 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white shadow-lg border border-white/30">
              🚀 Join the Revolution
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Transform GUI Agent
            <br />
            Evaluation Today
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed opacity-95">
            Experience the future of fair GUI agent testing with our
            AI-generated environment benchmark that eliminates over-fitting and
            ensures authentic evaluation.
          </p>

          <CTAButtons
            buttons={[
              {
                text: 'View Leaderboard',
                to: '/leaderboard',
                variant: 'white',
              },
              {
                text: 'Explore Environments',
                to: '/environment',
                variant: 'outline',
              },
            ]}
            className="mb-12"
          />

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-90">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Zero Infrastructure</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Fair Evaluation</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">100% AI Generated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
