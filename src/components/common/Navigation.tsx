import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../i18n/useI18n';
import { languageLabels, Language } from '../../i18n/translations';

const Navigation: React.FC = () => {
  const { language, setLanguage, t } = useI18n();

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.leaderboards'), path: '/leaderboard' },
    { name: t('nav.environments'), path: '/environments' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-full gap-4">
          <NavLink
            to="/"
            end
            className="text-base font-black text-gray-900 whitespace-nowrap"
          >
            ScaleWoB
          </NavLink>
          <div className="flex items-center gap-3 min-w-0">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div
              className="flex shrink-0 border border-gray-300 bg-white"
              aria-label={t('nav.language')}
            >
              {(['zh', 'en'] as Language[]).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                    language === option
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-pressed={language === option}
                >
                  {languageLabels[option]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
