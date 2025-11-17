import { useMemo } from "react";

interface LoadingStates {
  distributorsLoading?: boolean;
  customersLoading?: boolean;
  ordersLoading?: boolean;
  productsLoading?: boolean;
}

interface LoadingMessage {
  message: string;
  submessage: string;
  icon: string;
}

/**
 * Provides context-aware loading messages based on what's currently being loaded.
 * Makes the loading experience more informative and engaging.
 */
export function useLoadingMessage(states: LoadingStates): LoadingMessage | null {
  const { distributorsLoading, customersLoading, ordersLoading, productsLoading } = states;

  return useMemo(() => {
    const isLoading = distributorsLoading || customersLoading || ordersLoading || productsLoading;
    
    if (!isLoading) return null;

    // Priority order: show the most important/relevant loading state
    if (distributorsLoading && customersLoading && ordersLoading) {
      return {
        message: "🎯 جاري تحميل لوحة الموزّعين",
        submessage: "نحضر قائمة الموزّعين، العملاء المرتبطين، والطلبيات... هذا قد يستغرق بضع ثوانٍ",
        icon: "📊",
      };
    }

    if (distributorsLoading) {
      return {
        message: "👥 جاري تحميل قائمة الموزّعين",
        submessage: "نحضر بيانات الموزّعين والعمولات...",
        icon: "👥",
      };
    }

    if (customersLoading && ordersLoading) {
      return {
        message: "📈 جاري حساب الإحصائيات",
        submessage: "نحسب المبيعات والعمولات لكل موزّع بناءً على الطلبيات...",
        icon: "📈",
      };
    }

    if (customersLoading) {
      return {
        message: "👤 جاري تحميل بيانات العملاء",
        submessage: "نحضر قائمة العملاء المرتبطين بالموزّعين...",
        icon: "👤",
      };
    }

    if (ordersLoading) {
      return {
        message: "📦 جاري تحميل الطلبيات",
        submessage: "نحسب المبيعات والعمولات بناءً على الطلبيات...",
        icon: "📦",
      };
    }

    if (productsLoading) {
      return {
        message: "🛍️ جاري تحميل المنتجات",
        submessage: "نحضر قائمة المنتجات لحساب الأسعار...",
        icon: "🛍️",
      };
    }

    return {
      message: "⏳ جاري التحميل...",
      submessage: "يرجى الانتظار قليلاً",
      icon: "⏳",
    };
  }, [distributorsLoading, customersLoading, ordersLoading, productsLoading]);
}

