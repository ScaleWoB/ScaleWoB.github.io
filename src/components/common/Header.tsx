import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="gradient-warm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {title && (
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xl md:text-2xl text-warm-100 animate-slide-up">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
