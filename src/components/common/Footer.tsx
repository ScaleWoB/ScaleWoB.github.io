import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-warm-400">
              ScaleCUA
            </h3>
            <p className="text-gray-300 text-sm">
              A revolutionary GUI agent benchmark featuring AI-generated testing
              environments for fair evaluation of graphical interface agents.
              Unlike LLM benchmarks, ScaleCUA evaluates agents that interact
              with user interfaces through clicking, typing, and navigation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-warm-400">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-warm-400 transition-colors duration-200"
                >
                  Homepage
                </a>
              </li>
              <li>
                <a
                  href="/leaderboard"
                  className="text-gray-300 hover:text-warm-400 transition-colors duration-200"
                >
                  Leaderboard
                </a>
              </li>
              <li>
                <a
                  href="/environment"
                  className="text-gray-300 hover:text-warm-400 transition-colors duration-200"
                >
                  Environment
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-warm-400">
              Resources
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              Documentation and research papers coming soon.
            </p>
            <p className="text-gray-300 text-sm">
              For inquiries, please refer to our GitHub repository.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} ScaleCUA. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <a
                href="https://github.com/ScaleCUA/ScaleCUA.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-warm-400 transition-colors duration-200 text-sm"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
