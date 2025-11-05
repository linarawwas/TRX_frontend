// utils/whatsapp.ts
interface WhatsAppLinkParams {
  to: string; // E.164 – ex: "9613248982"
  customerName: string;
  delivered: number;
  returned: number;
  paidUSD: number;
  paidLBP: number;
  totalDue: number;
  driverName?: string;
}

export const buildWhatsAppLink = ({
  to,
  customerName,
  delivered,
  returned,
  paidUSD,
  paidLBP,
  totalDue,
  driverName = "سائق TRX",
}: WhatsAppLinkParams): string => {
  const msg = `
مرحباً ${customerName}! ✅ تم تسليم طلبك.
📦 القناني المسلّمة: ${delivered}
🔁 القناني المرجَّعة: ${returned}
💵 المدفوع بالدولار: ${paidUSD} $
💴 المدفوع بالليرة: ${paidLBP.toLocaleString()} ل.ل
💰 المبلغ المتبقّي: ${totalDue} $
- ${driverName}
شركة TRX للمياه 💧
  `.trim();

  return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
};

