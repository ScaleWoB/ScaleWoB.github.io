import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/useI18n';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
              ScaleWoB
            </h3>
            <p className="text-xs leading-relaxed text-gray-600">
              {t('footer.about')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
              {t('footer.navigation')}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {t('footer.leaderboard')}
                </Link>
              </li>
              <li>
                <Link
                  to="/environments"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {t('nav.environments')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
              {t('footer.resources')}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/ScaleWoB/ScaleWoB.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {t('footer.github')}
                </a>
              </li>
              <li>
                <span className="text-gray-500">{t('footer.docsSoon')}</span>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/2605.25160"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {t('footer.papersSoon')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>
              © {currentYear} ScaleWoB. {t('footer.rights')}
            </p>
            <div className="mt-2 md:mt-0">
              <span className="tracking-tight">{t('footer.tagline')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
