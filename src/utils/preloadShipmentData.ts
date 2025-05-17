import {
  saveAreasToDB,
  saveCustomersToDB,
  saveCustomerDiscountToDB,
  saveDayToDB,
  saveProductTypeToDB,
  saveCustomerInvoicesToDB,
} from "./indexedDB";

export async function preloadShipmentData({
  dayId,
  token,
  companyId,
}: {
  dayId: string;
  token: string;
  companyId: string;
}) {
  try {
    // 1. Fetch & cache Day info
    const dayRes = await fetch(`http://localhost:5000/api/days/${dayId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dayData = await dayRes.json();
    await saveDayToDB(dayId, dayData);

    // 2. Fetch & cache Areas
    const areasRes = await fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ companyId }),
    });
    const areas = await areasRes.json();
    await saveAreasToDB(dayId, areas);

    // 3. For each area → fetch customers, discounts, and invoices
    for (const area of areas) {
      const customersRes = await fetch(`http://localhost:5000/api/customers/area/${area._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const customers = await customersRes.json();
      await saveCustomersToDB(area._id, customers);

      for (const customer of customers) {
        // 3a. Save discount
        const discountRes = await fetch(
          `http://localhost:5000/api/customers/discount/${customer._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const discountData = await discountRes.json();
        await saveCustomerDiscountToDB(customer._id, discountData);

        // 3b. Save invoice
        const invoiceRes = await fetch(
          `http://localhost:5000/api/customers/reciept/${customer._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const invoiceData = await invoiceRes.json();
        await saveCustomerInvoicesToDB(customer._id, invoiceData.sums);
      }
    }

    // 4. Fetch & cache product info for company
    const productRes = await fetch(
      `http://localhost:5000/api/products/productType/company/${companyId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "Bottles" }),
      }
    );
    const productData = await productRes.json();
    await saveProductTypeToDB(companyId, productData);

    console.log("✅ All shipment-related data preloaded and cached in IndexedDB");
  } catch (error) {
    console.error("❌ Error preloading shipment data:", error);
  }
}
