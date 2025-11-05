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
  | 'products.fields.type'
  | 'products.fields.priceInDollars'
  | 'products.fields.returnable'
  | 'products.add.title'
  | 'products.add.buttonLabel'
  | 'expenses.add.title'
  | 'expenses.add.buttonLabel'
  | 'profits.add.title'
  | 'profits.add.buttonLabel'
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
  | 'emp.footer.copyright'
  | 'addresses.title'
  | 'addresses.search.placeholder'
  | 'addresses.reorder.toggle'
  | 'addresses.reorder.end'
  | 'addresses.reorder.apply'
  | 'addresses.reorder.cancel'
  | 'addresses.reorder.hint'
  | 'addresses.reorder.saveSuccess'
  | 'addresses.reorder.saveError'
  | 'addresses.reorder.connectionError'
  | 'addresses.reorder.incompleteData'
  | 'addresses.loading'
  | 'addresses.empty'
  | 'addresses.customer.name'
  | 'addresses.customer.phone'
  | 'addresses.customer.address'
  | 'addresses.customer.status'
  | 'addresses.customer.status.active'
  | 'addresses.customer.status.inactive'
  | 'addresses.customer.sequence'
  | 'addresses.customer.moveUp'
  | 'addresses.customer.moveDown'
  | 'addresses.areas.title'
  | 'addresses.areas.addToggle'
  | 'addresses.areas.showAreas'
  | 'addresses.areas.addNew'
  | 'addresses.areasForDay.title'
  | 'addresses.areasForDay.loading'
  | 'addresses.areasForDay.empty'
  | 'addresses.areasForDay.unknownDay'
  | 'addresses.areasForDay.loadError'
  | 'addresses.areasForDay.otherAreas'
  | 'customers.title'
  | 'customers.search.placeholder'
  | 'customers.addToggle'
  | 'customers.showCustomers'
  | 'customers.addNew'
  | 'customers.active.title'
  | 'customers.inactive.title'
  | 'customers.active.empty'
  | 'customers.inactive.empty'
  | 'customers.noResults'
  | 'customersForArea.title'
  | 'customersForArea.search.placeholder'
  | 'customersForArea.loading'
  | 'customersForArea.pending.title'
  | 'customersForArea.pending.empty'
  | 'customersForArea.completed.title'
  | 'customersForArea.completed.filled'
  | 'customersForArea.completed.empty'
  | 'customersForArea.completed.emptyText'
  | 'customersForArea.active.title'
  | 'customersForArea.active.empty'
  | 'customersForArea.pending.banner.online'
  | 'customersForArea.pending.banner.offline'
  | 'customersForArea.customer.address'
  | 'customersForArea.customer.phone'
  | 'orders.title'
  | 'orders.table.customer'
  | 'orders.table.delivered'
  | 'orders.table.returned'
  | 'orders.table.seeMore'
  | 'shipments.title'
  | 'shipments.filter.from'
  | 'shipments.filter.to'
  | 'shipments.filter.show'
  | 'shipments.filter.quick.today'
  | 'shipments.filter.quick.last7Days'
  | 'shipments.filter.quick.last30Days'
  | 'shipments.filter.dateRequired'
  | 'shipments.filter.fetchError'
  | 'shipments.kpi.count'
  | 'shipments.kpi.delivered'
  | 'shipments.kpi.returned'
  | 'shipments.kpi.totalUSD'
  | 'shipments.kpi.totalLBP'
  | 'shipments.kpi.paymentsLBP'
  | 'shipments.kpi.paymentsUSD'
  | 'shipments.kpi.expensesUSD'
  | 'shipments.kpi.expensesLBP'
  | 'shipments.kpi.profitsUSD'
  | 'shipments.kpi.profitsLBP'
  | 'shipments.empty'
  | 'shipments.card.date'
  | 'shipments.card.forDelivery'
  | 'shipments.card.delivered'
  | 'shipments.card.returned'
  | 'shipments.card.paymentsLBP'
  | 'shipments.card.paymentsUSD'
  | 'shipments.card.expensesLBP'
  | 'shipments.card.expensesUSD'
  | 'shipments.card.profitsLBP'
  | 'shipments.card.profitsUSD'
  | 'expenses.title'
  | 'expenses.addToggle'
  | 'expenses.hideForm'
  | 'expenses.addNew'
  | 'expenses.empty'
  | 'expenses.delete'
  | 'expenses.delete.success'
  | 'expenses.delete.error'
  | 'expenses.fields.name'
  | 'expenses.fields.value'
  | 'expenses.fields.currency'
  | 'expenses.fields.paymentCurrency'
  | 'expenses.fields.valueUSD'
  | 'expenses.fields.date'
  | 'expenses.currency.usd'
  | 'expenses.currency.lbp'
  | 'profits.title'
  | 'profits.addToggle'
  | 'profits.hideForm'
  | 'profits.addNew'
  | 'profits.empty'
  | 'profits.delete'
  | 'profits.delete.success'
  | 'profits.delete.error'
  | 'profits.fields.name'
  | 'profits.fields.value'
  | 'profits.fields.currency'
  | 'profits.fields.paymentCurrency'
  | 'profits.fields.valueUSD'
  | 'profits.fields.date'
  | 'profits.currency.usd'
  | 'profits.currency.lbp'
  | 'common.loading'
  | 'common.error'
  | 'common.back'
  | 'common.delete'
  | 'common.cancel'
  | 'common.save'
  | 'common.apply'
  | 'common.edit';

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
  'products.fields.type': 'نوع المنتج',
  'products.fields.priceInDollars': 'السعر بالدولار',
  'products.fields.returnable': 'هل يمكن إرجاعه',
  'products.add.title': 'إضافة إلى المنتجات',
  'products.add.buttonLabel': 'إضافة منتج',
  'expenses.add.title': 'إضافة مصاريف',
  'expenses.add.buttonLabel': 'إضافة مصاريف',
  'profits.add.title': 'إضافة إلى الأرباح',
  'profits.add.buttonLabel': 'إضافة ربح',
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
  'addresses.title': 'عناوين الزبائن',
  'addresses.search.placeholder': 'بحث بالاسم',
  'addresses.reorder.toggle': 'إعادة الترتيب',
  'addresses.reorder.end': 'إنهاء إعادة الترتيب',
  'addresses.reorder.apply': 'حفظ الترتيب',
  'addresses.reorder.cancel': 'إلغاء',
  'addresses.reorder.hint': 'رتّب البطاقات ثم اضغط حفظ',
  'addresses.reorder.saveSuccess': 'تم حفظ الترتيب الجديد',
  'addresses.reorder.saveError': 'فشل حفظ الترتيب',
  'addresses.reorder.connectionError': 'تعذر الاتصال',
  'addresses.reorder.incompleteData': 'بيانات غير مكتملة (areaId/companyId)',
  'addresses.loading': 'جارٍ التحميل...',
  'addresses.empty': 'لا يوجد زبائن بهذه المواصفات',
  'addresses.customer.name': 'الاسم',
  'addresses.customer.phone': 'الهاتف',
  'addresses.customer.address': 'العنوان',
  'addresses.customer.status': 'الحالة',
  'addresses.customer.status.active': 'نشط',
  'addresses.customer.status.inactive': 'غير نشط',
  'addresses.customer.sequence': 'الترتيب',
  'addresses.customer.moveUp': 'تحريك لأعلى',
  'addresses.customer.moveDown': 'تحريك لأسفل',
  'addresses.areas.title': 'مناطق التوزيع',
  'addresses.areas.addToggle': '➕ إضافة منطقة جديدة؟',
  'addresses.areas.showAreas': 'عرض المناطق',
  'addresses.areas.addNew': 'إضافة منطقة جديدة؟',
  'addresses.areasForDay.title': '🚚 اختر المنطقة ليوم {{dayName}}',
  'addresses.areasForDay.loading': '⏳ جارٍ التحميل...',
  'addresses.areasForDay.empty': '😕 لا توجد مناطق محفوظة لهذا اليوم',
  'addresses.areasForDay.unknownDay': 'يوم غير معروف',
  'addresses.areasForDay.loadError': 'خطأ في التحميل',
  'addresses.areasForDay.otherAreas': 'مناطق أخرى: طلبات خارجية (تتطلب انترنت)',
  'customers.title': 'الزبائن',
  'customers.search.placeholder': 'ابحث عن الزبائن (نشط وغير نشط)',
  'customers.addToggle': 'إضافة زبون؟',
  'customers.showCustomers': 'عرض الزبائن',
  'customers.addNew': 'إضافة زبون؟',
  'customers.active.title': 'الزبائن الناشطون',
  'customers.inactive.title': 'الزبائن غير الناشطين',
  'customers.active.empty': 'لا نتائج ضمن الناشطين',
  'customers.inactive.empty': 'لا نتائج ضمن غير الناشطين',
  'customers.noResults': 'لا توجد نتائج للبحث الحالي',
  'customersForArea.title': 'الزبائن في هذه المنطقة',
  'customersForArea.search.placeholder': '🔍 ابحث عن اسم الزبون...',
  'customersForArea.loading': '⏳ جارٍ تحميل الزبائن...',
  'customersForArea.pending.title': 'بانتظار الإرسال ({{count}})',
  'customersForArea.pending.empty': 'لا يوجد طلبات بانتظار الإرسال',
  'customersForArea.completed.title': 'المُنجَز ({{total}}) — معبّأ: {{filled}} | فارغ: {{empty}}',
  'customersForArea.completed.filled': 'معبّأ',
  'customersForArea.completed.empty': 'لا يوجد زبائن مُنجَزون بعد',
  'customersForArea.completed.emptyText': 'لا يوجد زبائن مُنجَزون بعد',
  'customersForArea.active.title': 'المتبقّي ({{count}})',
  'customersForArea.active.empty': '😕 لا يوجد نتائج مطابقة',
  'customersForArea.pending.banner.online': 'يوجد {{count}} طلب بانتظار الإرسال — سيتم مزامنتهم تلقائياً.',
  'customersForArea.pending.banner.offline': 'وضع عدم الاتصال: يوجد {{count}} طلب بانتظار الإرسال.',
  'customersForArea.customer.address': '📍العنوان',
  'customersForArea.customer.phone': '📞',
  'orders.title': 'Orders',
  'orders.table.customer': 'Customer',
  'orders.table.delivered': 'Delivered',
  'orders.table.returned': 'Returned',
  'orders.table.seeMore': 'See More...',
  'shipments.title': 'قائمة الشحنات',
  'shipments.filter.from': 'من',
  'shipments.filter.to': 'إلى',
  'shipments.filter.show': 'عرض',
  'shipments.filter.quick.today': 'اليوم',
  'shipments.filter.quick.last7Days': 'آخر 7 أيام',
  'shipments.filter.quick.last30Days': 'آخر 30 يوماً',
  'shipments.filter.dateRequired': 'اختر تاريخي البداية والنهاية.',
  'shipments.filter.fetchError': 'تعذّر جلب الشحنات. يرجى المحاولة لاحقاً.',
  'shipments.kpi.count': 'عدد الشحنات',
  'shipments.kpi.delivered': 'المُسلّمة',
  'shipments.kpi.returned': 'المُعادة',
  'shipments.kpi.totalUSD': 'إجمالي بالدولار',
  'shipments.kpi.totalLBP': 'إجمالي بالليرة',
  'shipments.kpi.paymentsLBP': 'ليرة (مدفوعات)',
  'shipments.kpi.paymentsUSD': 'دولار (مدفوعات)',
  'shipments.kpi.expensesUSD': 'نفقات $',
  'shipments.kpi.expensesLBP': 'نفقات بالليرة',
  'shipments.kpi.profitsUSD': 'أرباح إضافية $',
  'shipments.kpi.profitsLBP': 'أرباح إضافية ل.ل',
  'shipments.empty': 'لا توجد شحنات ضمن المدى الزمني المحدد.',
  'shipments.card.date': 'التاريخ',
  'shipments.card.forDelivery': 'للتوصيل',
  'shipments.card.delivered': 'مُسلّمة',
  'shipments.card.returned': 'مُعادة',
  'shipments.card.paymentsLBP': 'مدفوعات ل.ل',
  'shipments.card.paymentsUSD': 'مدفوعات $',
  'shipments.card.expensesLBP': 'نفقات ل.ل',
  'shipments.card.expensesUSD': 'نفقات $',
  'shipments.card.profitsLBP': 'أرباح إضافية ل.ل',
  'shipments.card.profitsUSD': 'أرباح إضافية $',
  'expenses.title': 'نفقات إضافية',
  'expenses.addToggle': 'إضافة نفقة جديدة؟',
  'expenses.hideForm': 'إخفاء النموذج؟',
  'expenses.addNew': 'إضافة نفقة جديدة؟',
  'expenses.empty': 'لا توجد نفقات إضافية لهذه الشركة',
  'expenses.delete': 'حذف',
  'expenses.delete.success': 'expense deleted successfully',
  'expenses.delete.error': 'Error deleting expense',
  'expenses.fields.name': 'الاسم',
  'expenses.fields.value': 'القيمة',
  'expenses.fields.currency': 'العملة',
  'expenses.fields.paymentCurrency': 'عملة الدفع',
  'expenses.fields.valueUSD': 'القيمة بالدولار',
  'expenses.fields.date': 'التاريخ',
  'expenses.currency.usd': 'دولار أمريكي',
  'expenses.currency.lbp': 'ليرة لبنانية',
  'profits.title': 'الأرباح الإضافية',
  'profits.addToggle': 'إضافة أرباح جديدة؟',
  'profits.hideForm': 'إخفاء النموذج؟',
  'profits.addNew': 'إضافة أرباح جديدة؟',
  'profits.empty': 'لا توجد أرباح إضافية لهذه الشركة',
  'profits.delete': 'حذف',
  'profits.delete.success': 'profit deleted successfully',
  'profits.delete.error': 'Error deleting profit',
  'profits.fields.name': 'الاسم',
  'profits.fields.value': 'القيمة',
  'profits.fields.currency': 'العملة',
  'profits.fields.paymentCurrency': 'عملة الدفع',
  'profits.fields.valueUSD': 'القيمة بالدولار',
  'profits.fields.date': 'التاريخ',
  'profits.currency.usd': 'دولار أمريكي',
  'profits.currency.lbp': 'ليرة لبنانية',
  'common.loading': 'جارٍ التحميل...',
  'common.error': 'حدث خطأ',
  'common.back': 'الرجوع',
  'common.delete': 'حذف',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.apply': 'تطبيق',
  'common.edit': 'تعديل',
};

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
  }
  return text;
}

