import 'server-only';

type Dictionary = {
  nav: {
    appName: string;
    shortName: string;
    requests: string;
    findDonors: string;
    dashboard: string;
    profile: string;
    logout: string;
  };
  home: {
    title: string;
    subtitle: string;
    becomeDonor: string;
    viewRequests: string;
  };
};

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default as Dictionary),
  bn: () => import('../../dictionaries/bn.json').then((module) => module.default as Dictionary),
}

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const validLocale = locale === 'bn' ? 'bn' : 'en';
  return dictionaries[validLocale]();
}
