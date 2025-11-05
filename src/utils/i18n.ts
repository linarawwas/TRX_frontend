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
  | 'dashboard.error'
  | 'products.title'
  | 'products.add.toggleShow'
  | 'products.add.toggleHide'
  | 'products.none'
  | 'products.fields.name'
  | 'products.fields.price'
  | 'products.fields.returnable'
  | 'products.returnable.yes'
  | 'products.returnable.no'
  | 'products.delete'
  | 'products.delete.success'
  | 'products.delete.error'
  | 'products.fetch.error'
  | 'emp.home.hello'
  | 'emp.snap.today.title'
  | 'emp.snap.round.title'
  | 'emp.snap.goal'
  | 'emp.snap.delivered'
  | 'emp.snap.returned'
  | 'emp.snap.percentOfGoal'
  | 'emp.kpi.cashToday'
  | 'emp.kpi.expenses'
  | 'emp.kpi.extraProfits'
  | 'emp.kpi.cashRound'
  | 'emp.kpi.expensesRound'
  | 'emp.kpi.extraProfitsRound'
  | 'emp.round.targetLock'
  | 'emp.actions.goToShipment'
  | 'emp.actions.addProfits'
  | 'emp.actions.addExpenses'
  | 'emp.actions.startShipment'
  | 'emp.actions.close'
  | 'emp.footer.copyright';

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
  'products.title': 'المنتجات',
  'products.add.toggleShow': 'هل تريد إضافة منتجات جديدة؟',
  'products.add.toggleHide': 'هل تريد إخفاء النموذج؟',
  'products.none': 'لا توجد منتجات لهذه الشركة',
  'products.fields.name': 'الاسم',
  'products.fields.price': 'القيمة',
  'products.fields.returnable': 'هل يمكن إرجاعه',
  'products.returnable.yes': 'نعم',
  'products.returnable.no': 'لا',
  'products.delete': 'حذف',
  'products.delete.success': 'تم حذف المنتج بنجاح',
  'products.delete.error': 'فشل حذف المنتج',
  'products.fetch.error': 'فشل تحميل المنتجات',
  'emp.home.hello': 'مرحبا',
  'emp.snap.today.title': 'إحصاءات اليوم',
  'emp.snap.round.title': 'إحصاءات الجولة #',
  'emp.snap.goal': 'الهدف',
  'emp.snap.delivered': 'تم التسليم',
  'emp.snap.returned': 'المُعاد',
  'emp.snap.percentOfGoal': '% من الهدف',
  'emp.kpi.cashToday': 'نقدية اليوم',
  'emp.kpi.expenses': 'المصاريف',
  'emp.kpi.extraProfits': 'الأرباح الإضافية',
  'emp.kpi.cashRound': 'نقدية الجولة',
  'emp.kpi.expensesRound': 'مصاريف الجولة',
  'emp.kpi.extraProfitsRound': 'الأرباح الإضافية (الجولة)',
  'emp.round.targetLock': 'اكتمل الهدف لهذه الجولة. لزيادة التسليم، ابدأ جولة جديدة.',
  'emp.actions.goToShipment': 'الذهاب إلى تفاصيل الشحنة',
  'emp.actions.addProfits': 'إضافة أرباح',
  'emp.actions.addExpenses': 'إضافة مصاريف',
  'emp.actions.startShipment': 'بدء شحنة جديدة',
  'emp.actions.close': 'إغلاق النموذج',
  'emp.footer.copyright': '© 2025 تيركس بواسطة لينة الرواّس. جميع الحقوق محفوظة.',
};

export function t(key: TranslationKey): string {
  return translations[key] || key;
}

