import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Settings': 'Settings',
      'Theme': 'Theme',
      'Language': 'Language',
      'Haptics': 'Haptic Feedback',
      'Load Basic Lab': 'Load Basic Lab',
      'Random Scenario': 'Random Scenario',
      'Send Ping': 'Send Ping',
      'Tick': 'Tick',
      'Auto-Play': 'Auto-Play',
      'Stop': 'Stop',
      'Run Doctor': 'Run Doctor',
      'Share Lab': 'Share Lab',
      'Import Lab': 'Import Lab',
    }
  },
  bn: {
    translation: {
      'Settings': 'সেটিংস',
      'Theme': 'থিম',
      'Language': 'ভাষা',
      'Haptics': 'হ্যাপটিক ফিডব্যাক',
      'Load Basic Lab': 'বেসিক Lab লোড করুন',
      'Random Scenario': 'র‍্যান্ডম Scenario',
      'Send Ping': 'Ping পাঠান',
      'Tick': 'Tick',
      'Auto-Play': 'Auto-Play',
      'Stop': 'থামান',
      'Run Doctor': 'Doctor চালান',
      'Share Lab': 'Lab শেয়ার করুন',
      'Import Lab': 'Lab ইম্পোর্ট করুন',
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18next;
