import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Leaderboards', path: '/leaderboard' },
    { name: 'Environments', path: '/environments' },
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
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map(item => (
              <NavLink
                key={item.name}
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
        </div>
      </div>
    </header>
  );
};

export default Navigation;
