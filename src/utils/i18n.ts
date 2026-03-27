// src/utils/i18n.ts
// Simple translation utility - can be extended with proper i18n library later
export type TranslationKey = 
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
  | 'products.confirmDelete'
  | 'products.confirmUpdate'
  | 'products.update.success'
  | 'products.update.error'
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
  | 'emp.snap.roundsHistoryTitle'
  | 'emp.snap.roundsHistory.defaultTitle'
  | 'emp.snap.roundsHistory.loading'
  | 'emp.snap.roundsHistory.empty'
  | 'emp.snap.roundsHistory.bottle'
  | 'emp.snap.roundsHistory.atTime'
  | 'emp.snap.roundsHistory.totalLabel'
  | 'emp.snap.roundsHistory.totalUnit'
  | 'emp.snap.roundsHistory.error'
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
  | 'emp.status.online'
  | 'emp.status.offline'
  | 'emp.status.pendingSync'
  | 'emp.home.loading'
  | 'emp.home.empty.title'
  | 'emp.home.empty.body'
  | 'emp.home.syncError'
  | 'emp.round.empty'
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
  | 'addresses.areas.offlineHint'
  | 'addresses.areas.retry'
  | 'addresses.areasForDay.title'
  | 'addresses.areasForDay.loading'
  | 'addresses.areasForDay.empty'
  | 'addresses.areasForDay.unknownDay'
  | 'addresses.areasForDay.loadError'
  | 'addresses.areasForDay.otherAreas'
  | 'addresses.areasForDay.offlineHint'
  | 'addresses.areasForDay.retry'
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
  | 'customersForArea.offlineHint'
  | 'customersForArea.retry'
  | 'customersForArea.scrollTop'
  | 'customersForArea.pending.cardAriaLabel'
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
  | 'expenses.confirmDelete'
  | 'expenses.confirmUpdate'
  | 'expenses.update.success'
  | 'expenses.update.error'
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
  | 'profits.confirmDelete'
  | 'profits.confirmUpdate'
  | 'profits.update.success'
  | 'profits.update.error'
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
  | 'common.moreOptions'
  | 'common.noChanges'
  | 'common.edit'
  | 'updateCustomer.tab.info'
  | 'updateCustomer.tab.invoices'
  | 'updateCustomer.tab.area'
  | 'updateCustomer.card.infoTitle'
  | 'updateCustomer.card.areaTitle'
  | 'updateCustomer.areaPicker.title'
  | 'updateCustomer.invoiceSavedToast'
  | 'updateCustomer.loadError'
  | 'updateCustomer.retry'
  | 'updateCustomer.errorBoundary.title'
  | 'updateCustomer.errorBoundary.body'
  | 'updateCustomer.errorBoundary.reload'
  | 'updateCustomer.toast.placementLoadFailed'
  | 'updateCustomer.toast.phoneDigitsOnly'
  | 'updateCustomer.toast.setPlacementBeforeSave'
  | 'updateCustomer.toast.noChanges'
  | 'updateCustomer.toast.missingToken'
  | 'updateCustomer.toast.updateFailed'
  | 'updateCustomer.toast.updateSuccess'
  | 'updateCustomer.toast.customerMissing'
  | 'updateCustomer.toast.startShipmentFirst'
  | 'updateCustomer.toast.operationFailed'
  | 'updateCustomer.toast.deactivateSuccess'
  | 'updateCustomer.confirm.deactivate'
  | 'updateCustomer.toast.restoreSuccess'
  | 'updateCustomer.toast.invalidSequence'
  | 'updateCustomer.toast.restoreWithSequenceSuccess'
  | 'updateCustomer.toast.adminOnly'
  | 'updateCustomer.toast.deleteSuccess'
  | 'updateCustomer.placement.listStart'
  | 'updateCustomer.placement.listEnd'
  | 'updateCustomer.form.title'
  | 'updateCustomer.form.name'
  | 'updateCustomer.form.phone'
  | 'updateCustomer.form.address'
  | 'updateCustomer.form.area'
  | 'updateCustomer.form.placement'
  | 'updateCustomer.form.selectArea'
  | 'updateCustomer.form.keepPlacement'
  | 'updateCustomer.form.chooseAreaFirst'
  | 'updateCustomer.form.placementLoading'
  | 'updateCustomer.form.placementHint'
  | 'updateCustomer.form.currentSequence'
  | 'updateCustomer.form.submit'
  | 'updateCustomer.form.placeholderNewName'
  | 'updateCustomer.form.placeholderNewPhone'
  | 'updateCustomer.form.placeholderNewAddress'
  | 'updateCustomer.header.customerFallback'
  | 'updateCustomer.header.emDash'
  | 'updateCustomer.status.active'
  | 'updateCustomer.status.inactive'
  | 'updateCustomer.header.deactivate'
  | 'updateCustomer.header.restore'
  | 'updateCustomer.header.sequenceLabel'
  | 'updateCustomer.header.restorePlaceholder'
  | 'updateCustomer.header.restoreSave'
  | 'updateCustomer.header.hardDelete'
  | 'updateCustomer.header.hardDeleteTitleEnabled'
  | 'updateCustomer.header.hardDeleteTitleDisabled'
  | 'updateCustomer.header.recordOrderExternal'
  | 'updateCustomer.header.statement'
  | 'updateCustomer.header.toggleEditHide'
  | 'updateCustomer.header.toggleEditShow'
  | 'updateCustomer.modal.confirmUpdateTitle'
  | 'updateCustomer.modal.close'
  | 'updateCustomer.modal.reviewHint'
  | 'updateCustomer.modal.fieldName'
  | 'updateCustomer.modal.fieldPhone'
  | 'updateCustomer.modal.fieldAddress'
  | 'updateCustomer.modal.fieldNewArea'
  | 'updateCustomer.modal.fieldPlacement'
  | 'updateCustomer.modal.backEdit'
  | 'updateCustomer.modal.saving'
  | 'updateCustomer.modal.confirmSave'
  | 'updateCustomer.modal.deleteTitle'
  | 'updateCustomer.modal.deleteStep1'
  | 'updateCustomer.modal.cancel'
  | 'updateCustomer.modal.continue'
  | 'updateCustomer.modal.deleteStep2'
  | 'updateCustomer.modal.deleting'
  | 'updateCustomer.modal.deleteConfirm'
  | 'updateCustomer.invoices.title'
  | 'updateCustomer.invoices.adminEdit'
  | 'updateCustomer.invoices.adminEditTitle'
  | 'updateCustomer.invoices.loading'
  | 'updateCustomer.opening.note'
  | 'updateCustomer.opening.labelBottles'
  | 'updateCustomer.opening.labelBalance'
  | 'updateCustomer.opening.phBottles'
  | 'updateCustomer.opening.phBalance'
  | 'updateCustomer.opening.busy'
  | 'updateCustomer.opening.save'
  | 'updateCustomer.opening.toastNeedValue'
  | 'updateCustomer.opening.confirm1'
  | 'updateCustomer.opening.confirm2'
  | 'updateCustomer.opening.success'
  | 'updateCustomer.opening.failed'
  | 'recordOrderForCustomer.cache.noDiscountOffline'
  | 'recordOrderForCustomer.cache.loadError'
  | 'recordOrderForCustomer.discount.title'
  | 'recordOrderForCustomer.discount.perBottle'
  | 'recordOrderForCustomer.discount.lbpLine'
  | 'recordOrderForCustomer.discount.referenceRate'
  | 'recordOrderForCustomer.discount.paymentNoteLabel'
  | 'recordOrderForCustomer.discount.footer'
  | 'recordOrderForCustomer.discount.loadingHint'
  | 'recordOrderForCustomer.pageEyebrow';

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
  'products.confirmDelete': 'هل تريد بالتأكيد حذف {{name}}؟ سيتم حذف البيانات نهائياً.',
  'products.confirmUpdate': 'تأكيد حفظ التعديلات على {{name}}؟',
  'products.update.success': 'تم تحديث المنتج بنجاح',
  'products.update.error': 'تعذر تحديث المنتج',
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
  'emp.snap.roundsHistoryTitle': 'الجولات المُسجّلة اليوم',
  'emp.snap.roundsHistory.defaultTitle': 'جولات اليوم',
  'emp.snap.roundsHistory.loading': 'جارٍ التحميل…',
  'emp.snap.roundsHistory.empty': 'لا توجد جولات بعد.',
  'emp.snap.roundsHistory.bottle': 'قنينة',
  'emp.snap.roundsHistory.atTime': 'عند {{time}}',
  'emp.snap.roundsHistory.totalLabel': 'الإجمالي اليوم:',
  'emp.snap.roundsHistory.totalUnit': 'قنينة',
  'emp.snap.roundsHistory.error': 'خطأ: {{message}}',
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
  'emp.footer.copyright': '© 2026 TRX بواسطة لينة الرواّس. جميع الحقوق محفوظة.',
  'emp.status.online': 'متصل',
  'emp.status.offline': 'غير متصل — التعديلات تُحفظ محلياً',
  'emp.status.pendingSync': 'بانتظار الإرسال: {{count}}',
  'emp.home.loading': 'جارٍ التحميل…',
  'emp.home.empty.title': 'لا توجد شحنة نشطة',
  'emp.home.empty.body': 'ابدأ شحنة جديدة لمتابعة التسليم وتسجيل الطلبات.',
  'emp.home.syncError': 'تعذّر قراءة قائمة الطلبات المؤجلة.',
  'emp.round.empty': 'لا توجد جولة نشطة حالياً. ابدأ شحنة أو جولة عند الحاجة.',
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
  'addresses.areas.offlineHint':
    'غير متصل — التعديلات تُحفظ محلياً.',
  'addresses.areas.retry': 'إعادة المحاولة',
  'addresses.areasForDay.title': '🚚 اختر المنطقة ليوم {{dayName}}',
  'addresses.areasForDay.loading': '⏳ جارٍ التحميل...',
  'addresses.areasForDay.empty': '😕 لا توجد مناطق محفوظة لهذا اليوم',
  'addresses.areasForDay.unknownDay': 'يوم غير معروف',
  'addresses.areasForDay.loadError': 'خطأ في التحميل',
  'addresses.areasForDay.otherAreas': 'مناطق أخرى: طلبات خارجية (تتطلب انترنت)',
  'addresses.areasForDay.offlineHint': 'البيانات المعروضة من الذاكرة المحلية. تأكد من بدء الشحنة عند توفر الاتصال إذا كانت القائمة فارغة.',
  'addresses.areasForDay.retry': 'إعادة المحاولة',
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
  'customersForArea.offlineHint': 'أنت غير متصل — يمكنك متابعة العمل؛ تُزامن الطلبات المعلّقة عند عودة الاتصال.',
  'customersForArea.retry': 'إعادة المحاولة',
  'customersForArea.scrollTop': 'العودة إلى أعلى القائمة',
  'customersForArea.pending.cardAriaLabel': '{{name}} — طلب غير مرسل بعد',
  'orders.title': 'Orders',
  'orders.table.customer': 'الزبون',
  'orders.table.delivered': 'المُسلّمة',
  'orders.table.returned': 'المُعادة',
  'orders.table.seeMore': 'عرض المزيد...',
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
  'expenses.delete.success': 'تم الحذف بنجاح',
  'expenses.delete.error': 'تعذر الحذف',
  'expenses.confirmDelete': 'هل تريد بالتأكيد حذف {{name}}؟ سيتم حذف البيانات نهائياً.',
  'expenses.confirmUpdate': 'تأكيد حفظ التعديلات على {{name}}؟',
  'expenses.update.success': 'تم تحديث النفقة بنجاح',
  'expenses.update.error': 'تعذر تحديث النفقة',
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
  'profits.delete.success': 'تم الحذف بنجاح',
  'profits.delete.error': 'تعذر الحذف',
  'profits.confirmDelete': 'هل تريد بالتأكيد حذف {{name}}؟ سيتم حذف البيانات نهائياً.',
  'profits.confirmUpdate': 'تأكيد حفظ التعديلات على {{name}}؟',
  'profits.update.success': 'تم تحديث الربح بنجاح',
  'profits.update.error': 'تعذر تحديث الربح',
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
  'common.moreOptions': 'المزيد من الخيارات لـ {{name}}',
  'common.noChanges': 'لا يوجد تغييرات للحفظ',
  'common.edit': 'تعديل',
  'updateCustomer.tab.info': 'البيانات',
  'updateCustomer.tab.invoices': 'الرصيد',
  'updateCustomer.tab.area': 'الترتيب',
  'updateCustomer.card.infoTitle': 'البيانات',
  'updateCustomer.card.areaTitle': 'الترتيب في المنطقة',
  'updateCustomer.areaPicker.title': 'تغيير الترتيب داخل المنطقة',
  'updateCustomer.invoiceSavedToast': 'تم الحفظ وتحديث الأرقام',
  'updateCustomer.loadError': 'تعذّر تحميل بيانات الزبون',
  'updateCustomer.retry': 'إعادة المحاولة',
  'updateCustomer.errorBoundary.title': 'تعذّر عرض هذه الصفحة',
  'updateCustomer.errorBoundary.body':
    'حدث خطأ غير متوقع. يمكنك إعادة تحميل الصفحة للمحاولة من جديد.',
  'updateCustomer.errorBoundary.reload': 'إعادة تحميل الصفحة',
  'updateCustomer.toast.placementLoadFailed': 'تعذر تحميل زبائن المنطقة للترتيب',
  'updateCustomer.toast.phoneDigitsOnly': 'أدخل أرقام فقط',
  'updateCustomer.toast.setPlacementBeforeSave': 'عيّن ترتيبًا جديدًا داخل المنطقة قبل الحفظ',
  'updateCustomer.toast.noChanges': 'لا توجد تغييرات لإرسالها',
  'updateCustomer.toast.missingToken': 'Missing auth token',
  'updateCustomer.toast.updateFailed': 'فشل التحديث',
  'updateCustomer.toast.updateSuccess': 'تم التحديث بنجاح',
  'updateCustomer.toast.customerMissing': 'بيانات الزبون غير متوفرة',
  'updateCustomer.toast.startShipmentFirst': 'ابدأ الشحنة أولاً قبل تسجيل الطلب',
  'updateCustomer.toast.operationFailed': 'فشل العملية',
  'updateCustomer.toast.deactivateSuccess': 'تم إيقاف الزبون',
  'updateCustomer.confirm.deactivate': 'هل تريد إيقاف هذا الزبون؟',
  'updateCustomer.toast.restoreSuccess': 'تم تنشيط الزبون',
  'updateCustomer.toast.invalidSequence': 'أدخل رقم ترتيب صحيح (1 أو أكبر)',
  'updateCustomer.toast.restoreWithSequenceSuccess': 'تم تنشيط الزبون وتعيين الترتيب',
  'updateCustomer.toast.adminOnly': 'هذه العملية للمشرف فقط',
  'updateCustomer.toast.deleteSuccess': 'تم حذف الزبون نهائيًا',
  'updateCustomer.placement.listStart': 'في بداية القائمة',
  'updateCustomer.placement.listEnd': 'في نهاية القائمة',
  'updateCustomer.form.title': 'تعديل بيانات الزبون',
  'updateCustomer.form.name': 'الاسم',
  'updateCustomer.form.phone': 'الهاتف',
  'updateCustomer.form.address': 'العنوان',
  'updateCustomer.form.area': 'المنطقة',
  'updateCustomer.form.placement': 'الموضع داخل المنطقة',
  'updateCustomer.form.selectArea': 'اختر المنطقة…',
  'updateCustomer.form.keepPlacement': '(احتفظ بالموضع الحالي)',
  'updateCustomer.form.chooseAreaFirst': 'اختر منطقة أولاً',
  'updateCustomer.form.placementLoading': 'جارٍ تحميل مواقع الزبائن…',
  'updateCustomer.form.placementHint': 'يمكنك تحديد موقع الزبون بالنسبة لباقي زبائن المنطقة.',
  'updateCustomer.form.currentSequence': 'الترتيب الحالي',
  'updateCustomer.form.submit': 'حفظ التعديلات',
  'updateCustomer.form.placeholderNewName': 'الاسم الجديد',
  'updateCustomer.form.placeholderNewPhone': 'رقم الهاتف الجديد',
  'updateCustomer.form.placeholderNewAddress': 'العنوان الجديد',
  'updateCustomer.header.customerFallback': 'الزبون',
  'updateCustomer.header.emDash': '—',
  'updateCustomer.status.active': 'نشط',
  'updateCustomer.status.inactive': 'غير نشط',
  'updateCustomer.header.deactivate': 'إيقاف',
  'updateCustomer.header.restore': 'تنشيط',
  'updateCustomer.header.sequenceLabel': 'الترتيب:',
  'updateCustomer.header.restorePlaceholder': 'مثال: 25',
  'updateCustomer.header.restoreSave': 'حفظ',
  'updateCustomer.header.hardDelete': 'حذف نهائي',
  'updateCustomer.header.hardDeleteTitleEnabled': 'حذف نهائي',
  'updateCustomer.header.hardDeleteTitleDisabled': 'للمشرف فقط',
  'updateCustomer.header.recordOrderExternal': 'تسجيل طلب خارجي',
  'updateCustomer.header.statement': 'كشف الحساب / إضافة دفعة',
  'updateCustomer.header.toggleEditHide': 'إخفاء التعديل',
  'updateCustomer.header.toggleEditShow': 'تعديل معلومات الزبون',
  'updateCustomer.modal.confirmUpdateTitle': 'تأكيد تحديث الزبون',
  'updateCustomer.modal.close': 'إغلاق',
  'updateCustomer.modal.reviewHint': 'راجع التعديلات التالية قبل حفظها:',
  'updateCustomer.modal.fieldName': 'الاسم:',
  'updateCustomer.modal.fieldPhone': 'الهاتف:',
  'updateCustomer.modal.fieldAddress': 'العنوان:',
  'updateCustomer.modal.fieldNewArea': 'المنطقة الجديدة:',
  'updateCustomer.modal.fieldPlacement': 'الموضع داخل المنطقة:',
  'updateCustomer.modal.backEdit': 'تعديل',
  'updateCustomer.modal.saving': 'جارٍ الحفظ…',
  'updateCustomer.modal.confirmSave': 'تأكيد الحفظ',
  'updateCustomer.modal.deleteTitle': 'حذف نهائي للزبون',
  'updateCustomer.modal.deleteStep1':
    'هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف الزبون نهائيًا من النظام.',
  'updateCustomer.modal.cancel': 'إلغاء',
  'updateCustomer.modal.continue': 'متابعة',
  'updateCustomer.modal.deleteStep2':
    'تأكيد أخير: قد يكون لدى الزبون <strong>طلبات مرتبطة</strong>. إن وُجدت سيُرفض الحذف.',
  'updateCustomer.modal.deleting': 'جارٍ الحذف...',
  'updateCustomer.modal.deleteConfirm': 'حذف نهائي',
  'updateCustomer.invoices.title': 'الرصيد الحالي',
  'updateCustomer.invoices.adminEdit': '✎ تعديل (إداري)',
  'updateCustomer.invoices.adminEditTitle':
    'هذه الأداة مخصّصة لتصحيح فروقات صغيرة فقط: فرق القناني المسموح به لا يتجاوز ±2. يمكن تعديل الرصيد الافتتاحي لأي قيمة.',
  'updateCustomer.invoices.loading': 'جارٍ التحميل…',
  'updateCustomer.opening.note':
    'هذه الأداة مخصّصة لتصحيح فروقات صغيرة فقط: فرق القناني المسموح به لا يتجاوز قنّتين (±2). يمكن تعديل الرصيد الافتتاحي (USD) لأي قيمة. لا يمكن التعديل على الرصيد العام، فقط على الرصيد الإفتتاحي، لأن الرصيد العام مجموع طلبات الزبون، إذا كان هناك خطأ في تسجيل أي طلب، الرجاء التوجه لكشف الحساب وتعديل الطلب الذي يحتوي الخطأ. من خلال صفحة تعديل الطلب والتفاصيل. بإمكانك التعديل على الرصيد الإفتتاحي والإطلاع عليه من خلال صفحة كشف الحساب.',
  'updateCustomer.opening.labelBottles': 'القناني المتبقية (الرقم المطلوب إظهاره)',
  'updateCustomer.opening.labelBalance': 'الرصيد المستحق USD (الرقم المطلوب إظهاره)',
  'updateCustomer.opening.phBottles': 'مثال: 3',
  'updateCustomer.opening.phBalance': 'مثال: 8.00',
  'updateCustomer.opening.busy': 'جارٍ الحفظ…',
  'updateCustomer.opening.save': 'حفظ',
  'updateCustomer.opening.toastNeedValue': 'أدخل قيمة واحدة على الأقل',
  'updateCustomer.opening.confirm1':
    'تنبيه: سيتم تعديل الأمر الافتتاحي لهذا الزبون حسب القيم المدخلة. هل أنت متأكد/ة؟',
  'updateCustomer.opening.confirm2':
    'تأكيد أخير: هذه العملية لا تؤثر على الطلبات الحقيقية ولكنها تغيّر الرصيد/القناني الافتتاحية. متابعة؟',
  'updateCustomer.opening.success': 'تم تعديل الرصيد/القناني الافتتاحية',
  'updateCustomer.opening.failed': 'فشل العملية',
  'recordOrderForCustomer.cache.noDiscountOffline':
    '⚠️ لم يتم العثور على بيانات الخصم في وضع عدم الاتصال.',
  'recordOrderForCustomer.cache.loadError':
    '⚠️ فشل تحميل بيانات الخصم من الذاكرة المؤقتة.',
  'recordOrderForCustomer.discount.title': 'خصم مُفعّل لهذا الزبون',
  'recordOrderForCustomer.discount.perBottle': '{{price}} / القنّينة',
  'recordOrderForCustomer.discount.lbpLine': '≈ {{lbp}} / القنّينة',
  'recordOrderForCustomer.discount.referenceRate': '(سعر مرجعي: {{rate}} ل.ل/1$)',
  'recordOrderForCustomer.discount.paymentNoteLabel': 'ملاحظة الدفع:',
  'recordOrderForCustomer.discount.footer': '* يُطبَّق تلقائيًا على الحساب',
  'recordOrderForCustomer.discount.loadingHint': 'جارٍ تحميل بيانات الخصم…',
  'recordOrderForCustomer.pageEyebrow': 'تسجيل طلب',
};

export function t(
  key: TranslationKey | (string & object),
  params?: Record<string, string | number>
): string {
  let text = translations[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
  }
  return text;
}

