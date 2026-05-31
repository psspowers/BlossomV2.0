import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        title: 'Blossom',
        subtitle: 'Your Journey, Seen & Supported',
        private: 'Private'
      },
      dashboard: {
        greeting: 'Hello',
        cycle_context: 'Cycle Context',
        todays_balance: "Today's Balance",
        whispers: 'Whispers from your Body',
        log_day: 'Log Day',
        loading: 'Loading...'
      },
      settings: {
        title: 'Settings & Privacy',
        language: 'Language / ภาษา',
        export_pdf: 'Generate Clinical Summary',
        delete_data: 'Delete All Data'
      },
      auth: {
        secure_space: 'Secure Space',
        email: 'Email Address',
        password: 'Password (min 6 chars)',
        create_account: 'Create Private Account',
        sign_in: 'Access Vault'
      }
    }
  },
  th: {
    translation: {
      nav: {
        title: 'Blossom',
        subtitle: 'เส้นทางของคุณ ที่เราเข้าใจและพร้อมดูแล',
        private: 'ส่วนตัว 100%'
      },
      dashboard: {
        greeting: 'สวัสดี',
        cycle_context: 'ข้อมูลรอบเดือน',
        todays_balance: 'สมดุลวันนี้',
        whispers: 'เสียงกระซิบจากร่างกาย',
        log_day: 'บันทึกประจำวัน',
        loading: 'กำลังโหลด...'
      },
      settings: {
        title: 'การตั้งค่าและความเป็นส่วนตัว',
        language: 'Language / ภาษา',
        export_pdf: 'สร้างสรุปข้อมูลทางการแพทย์',
        delete_data: 'ลบข้อมูลทั้งหมด'
      },
      auth: {
        secure_space: 'พื้นที่ปลอดภัยของคุณ',
        email: 'อีเมล',
        password: 'รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)',
        create_account: 'สร้างบัญชีส่วนตัว',
        sign_in: 'เข้าสู่ระบบ'
      }
    }
  }
};

const getStoredLanguage = (): string => {
  try {
    return localStorage.getItem('blossom_language') || 'en';
  } catch {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
