// utils/whatsapp.js
export const buildWhatsAppLink = ({
  to,                 // E.164 – ex: "9613248982"
  customerName,
  delivered,
  returned,
  paidUSD,
  paidLBP,
  totalDue,
  driverName = "سائق TRX",
}) => {
  const msg = `
مرحباً ${customerName}! ✅ تم تسليم طلبك.
📦 القناني المسلّمة: ${delivered}
🔁 القناني المرجَّعة: ${returned}
💵 المدفوع بالدولار: ${paidUSD} $
💴 المدفوع بالليرة: ${paidLBP.toLocaleString()} ل.ل
💰 المبلغ المتبقّي: ${totalDue} $
- ${driverName}
شركة TRX للمياه 💧
  `.trim();

  return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
};
