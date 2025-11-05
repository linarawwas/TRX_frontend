// src/utils/i18n.ts
// Simple translation utility - can be extended with proper i18n library later
type TranslationKey = 
  | 'dashboard.hello'
  | 'dashboard.today'
  | 'dashboard.quickActions.viewShipments'
  | 'dashboard.quickActions.printToday'
  | 'dashboard.netUSD'
  | 'dashboard.liraPayments'
  | 'dashboard.liraExpenses'
  | 'dashboard.todayShipmentDetails'
  | 'dashboard.deliveryRateToday'
  | 'dashboard.carrying'
  | 'dashboard.delivered'
  | 'dashboard.returned'
  | 'dashboard.netUSDSubtitle'
  | 'dashboard.liraPaymentsSubtitle'
  | 'dashboard.liraExpensesSubtitle'
  | 'dashboard.loading'
  | 'dashboard.error';

const translations: Record<TranslationKey, string> = {
  'dashboard.hello': 'مرحباً',
  'dashboard.today': '', // date string handled separately
  'dashboard.quickActions.viewShipments': 'عرض الشحنات',
  'dashboard.quickActions.printToday': 'تقرير اليوم',
  'dashboard.netUSD': 'صافي الدولار',
  'dashboard.liraPayments': 'مدفوعات الليرة',
  'dashboard.liraExpenses': 'نفقات الليرة',
  'dashboard.todayShipmentDetails': 'تفاصيل شحنة اليوم',
  'dashboard.deliveryRateToday': 'نسبة التسليم اليوم',
  'dashboard.carrying': 'المحمولة',
  'dashboard.delivered': 'المُسلّمة',
  'dashboard.returned': 'المُعادة',
  'dashboard.netUSDSubtitle': 'مدفوعات − نفقات + أرباح إضافية',
  'dashboard.liraPaymentsSubtitle': 'إجمالي المقبوض بالليرة',
  'dashboard.liraExpensesSubtitle': 'جميع المصاريف اليوم',
  'dashboard.loading': 'جارٍ التحميل…',
  'dashboard.error': 'حدث خطأ في تحميل البيانات',
};

export function t(key: TranslationKey): string {
  return translations[key] || key;
}

