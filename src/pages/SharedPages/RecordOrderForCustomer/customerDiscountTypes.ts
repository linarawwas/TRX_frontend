/** Cached discount row shape from `getCustomerDiscountFromDB` */
export type CustomerDiscountCache = {
  hasDiscount: boolean;
  valueAfterDiscount: number;
  discountCurrency: string;
  noteAboutCustomer: string;
};
