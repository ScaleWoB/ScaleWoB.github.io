import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../components/common/NewsCard';
import type { TranslationKey } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';

type ShowcaseCard = {
  id: 'android' | 'mac';
  nameKey: TranslationKey;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  hintKey?: TranslationKey;
  href: string;
  image: string;
  frame: 'phone' | 'desktop';
};

type CarEnvironment = {
  id: string;
  brand: string;
  nameKey: TranslationKey;
  url: string;
  image: string;
};

const SYSTEM_PREVIEWS: ShowcaseCard[] = [
  {
    id: 'android',
    nameKey: 'home.androidEnv',
    labelKey: 'home.androidPreviewLabel',
    descriptionKey: 'home.androidPreviewText',
    hintKey: 'home.androidDeviceModeHint',
    href: 'https://niumascript.com/os/android/index.html',
    image: '/previews/android-os.png',
    frame: 'phone',
  },
  {
    id: 'mac',
    nameKey: 'home.macEnv',
    labelKey: 'home.macPreviewLabel',
    descriptionKey: 'home.macPreviewText',
    href: 'https://niumascript.com/os/mac/index.html',
    image: '/previews/mac-os.png',
    frame: 'desktop',
  },
];

const CAR_ENVIRONMENTS: CarEnvironment[] = [
  {
    id: 'car_xiaomi',
    brand: 'Xiaomi',
    nameKey: 'home.carXiaomi',
    url: 'https://niumascript.com/scalewob-env/car_xiaomi/index.html',
    image: '/previews/car-xiaomi.png',
  },
  {
    id: 'car_byd',
    brand: 'BYD',
    nameKey: 'home.carByd',
    url: 'https://niumascript.com/scalewob-env/car_byd/index.html',
    image: '/previews/car-byd.png',
  },
  {
    id: 'car_lixiang',
    brand: 'Li Auto',
    nameKey: 'home.carLixiang',
    url: 'https://niumascript.com/scalewob-env/car_lixiang/index.html',
    image: '/previews/car-lixiang.png',
  },
  {
    id: 'car_tesila',
    brand: 'Tesla',
    nameKey: 'home.carTesila',
    url: 'https://niumascript.com/scalewob-env/car_tesila/index.html',
    image: '/previews/car-tesila.png',
  },
  {
    id: 'car_wenjie',
    brand: 'AITO',
    nameKey: 'home.carWenjie',
    url: 'https://niumascript.com/scalewob-env/car_wenjie/index.html',
    image: '/previews/car-wenjie.png',
  },
];

const ExternalLinkIcon = ({
  className = 'w-4 h-4',
}: {
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const DevicePreview = ({
  card,
  title,
}: {
  card: ShowcaseCard;
  title: string;
}) => {
  if (card.frame === 'phone') {
    return (
      <div className="mx-auto w-32 shrink-0 sm:w-36 lg:w-32">
        <div className="aspect-[390/844] overflow-hidden rounded-[1.65rem] border-[7px] border-gray-950 bg-gray-950 shadow-2xl">
          <img
            src={card.image}
            alt={title}
            loading="lazy"
            className="h-full w-full rounded-[1.2rem] object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm shrink-0">
      <div className="overflow-hidden rounded-md border-[7px] border-gray-950 bg-gray-950 shadow-2xl">
        <img
          src={card.image}
          alt={title}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      <div className="mx-auto h-3 w-24 bg-gray-300" aria-hidden="true" />
      <div className="mx-auto h-1 w-36 bg-gray-400" aria-hidden="true" />
    </div>
  );
};

const Homepage: React.FC = () => {
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(CAR_ENVIRONMENTS[0].id);
  const { t } = useI18n();

  const selectedCar =
    CAR_ENVIRONMENTS.find(car => car.id === selectedCarId) ??
    CAR_ENVIRONMENTS[0];

  return (
    <div className="bg-white">
      {/* Header Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Newspaper Header */}
          <div className="py-8 border-b-2 border-gray-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-2 leading-none">
                  ScaleWoB
                </h1>
                <div className="text-lg font-medium text-gray-700">
                  {t('home.subtitle')}
                </div>
              </div>
              {/* GitHub-style Avatar */}
              <div className="ml-6 shrink-0">
                <div className="w-20 h-20 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-10 h-10 text-gray-600"
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
                </div>
              </div>
            </div>
          </div>

          {/* Demo Environments Section */}
          <div className="py-8 border-b-2 border-gray-300">
            <div className="mx-auto px-0">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-coral-600">
                    {t('home.demoEyebrow')}
                  </div>
                  <h2 className="mt-2 text-2xl font-black uppercase text-gray-900 md:text-3xl">
                    {t('home.demoTitle')}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
                  {t('home.demoDescription')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {SYSTEM_PREVIEWS.map(card => {
                    const title = t(card.nameKey);

                    return (
                      <a
                        key={card.id}
                        href={card.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block border-2 border-gray-900 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        <div className="grid h-full grid-cols-1 gap-5 md:grid-cols-[minmax(9rem,0.82fr)_1fr] md:items-center">
                          <DevicePreview card={card} title={title} />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="mb-2 text-xs font-bold uppercase text-gray-500">
                              {t(card.labelKey)}
                            </div>
                            <h3 className="text-xl font-black text-gray-900">
                              {title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                              {t(card.descriptionKey)}
                            </p>
                            {card.hintKey && (
                              <div className="mt-4 border-l-4 border-gold-400 bg-gold-50 px-3 py-2 text-xs font-bold leading-relaxed text-gray-800">
                                {t(card.hintKey)}
                              </div>
                            )}
                            <div className="mt-5 inline-flex items-center gap-2 self-start border-b-2 border-gray-900 pb-1 text-sm font-bold text-gray-900">
                              {t('home.openDemo')}
                              <ExternalLinkIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="border-2 border-gray-900 bg-gray-950 text-white shadow-sm">
                  <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-stretch">
                    <div className="flex flex-col justify-between gap-5">
                      <div>
                        <div className="text-xs font-bold uppercase text-gold-300">
                          {t('home.carPreviewLabel')}
                        </div>
                        <h3 className="mt-2 text-2xl font-black">
                          {t('home.carShowcaseTitle')}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-300">
                          {t('home.carShowcaseText', {
                            car: t(selectedCar.nameKey),
                          })}
                        </p>
                      </div>

                      <div
                        className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1"
                        role="group"
                        aria-label={t('home.carSelectorAria')}
                      >
                        {CAR_ENVIRONMENTS.map(car => {
                          const isSelected = car.id === selectedCar.id;

                          return (
                            <button
                              key={car.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => setSelectedCarId(car.id)}
                              className={`border px-3 py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                isSelected
                                  ? 'border-gold-300 bg-gold-300 text-gray-950'
                                  : 'border-white/20 bg-white/5 text-gray-100 hover:border-white/50 hover:bg-white/10'
                              }`}
                            >
                              {car.brand}
                            </button>
                          );
                        })}
                      </div>

                      <a
                        href={selectedCar.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 border-2 border-white bg-white px-4 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-gold-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-950"
                      >
                        {t('home.openSelectedCar')}
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="relative overflow-hidden rounded-md border-[10px] border-gray-800 bg-gray-900 shadow-2xl">
                      <img
                        key={selectedCar.id}
                        src={selectedCar.image}
                        alt={t(selectedCar.nameKey)}
                        loading="lazy"
                        className="aspect-[16/9] h-full w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 border border-white/20 bg-gray-950/80 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                        {t(selectedCar.nameKey)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Article Area */}
          <div className="py-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-lg font-semibold text-gray-800 mb-4 uppercase tracking-wide">
                {t('home.about')}
              </div>
              <p className="text-base text-gray-700 leading-relaxed mb-8 wrap-break-words">
                {t('home.aboutText')}
              </p>
            </div>

            {/* Divider */}
            <div className="border-b-2 border-gray-300 mb-8"></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/environments"
                className="px-8 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center group"
              >
                {t('home.viewEnvironments')}
                <svg
                  className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                  className={`w-full px-8 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center group ${showLanguageOptions ? 'bg-gray-100' : ''}`}
                >
                  {t('home.createEnvironment')}
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                {showLanguageOptions && (
                  <div className="absolute top-full mt-2 left-0 right-0 border-2 border-gray-800 bg-white shadow-lg z-10">
                    <a
                      href="https://lw572lx3ee.feishu.cn/share/base/form/shrcnjzeeqdcf4d6yDPKHw5xbOd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-300"
                    >
                      {t('home.formChinese')}
                    </a>
                    <a
                      href="https://lw572lx3ee.feishu.cn/share/base/form/shrcnoK335CJpC0tKwORe5Gfwme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      {t('home.formEnglish')}
                    </a>
                  </div>
                )}
              </div>
              <Link
                to="/leaderboard"
                className="px-8 py-3 border-2 border-gray-800 text-gray-800 text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center group"
              >
                {t('home.viewLeaderboard')}
                <svg
                  className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* News Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {t('home.latestNews')}
            </div>
          </div>

          {/* News Items */}
          <div className="py-8">
            <div className="space-y-3">
              {/* News Item 1 - SDK Release (Released) */}
              <NewsCard
                category={t('news.sdkCategory')}
                categoryColor="green"
                date="2025.11.26"
                title={t('news.sdkTitle')}
                description={t('news.sdkDescription')}
                actions={[
                  {
                    label: 'GitHub',
                    url: 'https://github.com/ScaleWoB/ScaleWoB',
                    variant: 'primary',
                    icon: 'github',
                  },
                  {
                    label: 'PyPI',
                    url: 'https://pypi.org/project/scalewob/',
                    variant: 'secondary',
                    icon: 'pypi',
                  },
                ]}
                icon="code"
              />

              {/* News Item 2 - Dataset Release (Coming Soon - Disabled) */}
              <NewsCard
                category={t('news.datasetCategory')}
                categoryColor="blue"
                status={t('news.datasetStatus')}
                title={t('news.datasetTitle')}
                description={t('news.datasetDescription')}
                isDisabled={true}
                icon="database"
              />

              {/* News Item 3 - Paper Release (Coming Soon - Disabled) */}
              <NewsCard
                category={t('news.paperCategory')}
                categoryColor="purple"
                status={t('news.paperStatus')}
                title={t('news.paperTitle')}
                description={t('news.paperDescription')}
                isDisabled={true}
                icon="document"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Newspaper Columns */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {t('home.keyFeatures')}
            </div>
          </div>

          {/* Three Column Newspaper Layout */}
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="md:border-r md:border-gray-200 md:pr-6 md:px-4 px-2">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      {t('home.featureAiTitle')}
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      {t('home.featureAiText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="md:border-r md:border-gray-200 md:px-6 px-2 md:py-0 py-4">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      {t('home.featureFastTitle')}
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      {t('home.featureFastText')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="md:pl-6 md:px-4 px-2">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                      {t('home.featureCrossTitle')}
                    </h4>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed wrap-break-words">
                      {t('home.featureCrossText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section - Newspaper Style */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-6 border-b-2 border-gray-300">
            <div className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
              {t('home.platformStats')}
            </div>
          </div>

          <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">3+</div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('home.statPlatforms')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  50K+
                </div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('home.statTasks')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">∞</div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('home.statEnvironments')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">
                  100%
                </div>
                <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {t('home.statAiGenerated')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
