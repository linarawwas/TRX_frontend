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
    // === Step 1: Fetch core data in parallel ===
    const [dayRes, areasRes, productRes] = await Promise.all([
      fetch(`http://localhost:5000/api/days/${dayId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`http://localhost:5000/api/areas/days/${dayId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      }),
      fetch(
        `http://localhost:5000/api/products/productType/company/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: "Bottles" }),
        }
      ),
    ]);

    const [dayData, areas, productData] = await Promise.all([
      dayRes.json(),
      areasRes.json(),
      productRes.json(),
    ]);

    // === Step 2: Cache day, areas, product info ===
    await Promise.all([
      saveDayToDB(dayId, dayData),
      saveAreasToDB(dayId, areas),
      saveProductTypeToDB(companyId, productData),
    ]);

    // === Step 3: Load customers and their data in parallel per area ===
    for (const area of areas) {
      const customersRes = await fetch(
        `http://localhost:5000/api/customers/area/${area._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const customers = await customersRes.json();

      if (!Array.isArray(customers)) {
        console.error(
          `❌ Expected array for customers in area ${area._id}, got:`,
          customers
        );
      } else {
        console.log(
          `📥 Received ${customers.length} customers for area ${area._id}`
        );
        await saveCustomersToDB(area._id, customers);
      }

      // Collect discount and invoice promises per customer
      const customerTasks = customers.map(async (customer: any) => {
        try {
          const [discountRes, invoiceRes] = await Promise.all([
            fetch(
              `http://localhost:5000/api/customers/discount/${customer._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `http://localhost:5000/api/customers/reciept/${customer._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

          const [discountData, invoiceData] = await Promise.all([
            discountRes.json(),
            invoiceRes.json(),
          ]);

          await Promise.all([
            saveCustomerDiscountToDB(customer._id, discountData),
            saveCustomerInvoicesToDB(customer._id, invoiceData?.sums ?? {}),
          ]);
        } catch (err) {
          console.warn(`Skipping customer ${customer._id}:`, err);
        }
      });

      // Wait for all customers in area
      await Promise.all(customerTasks);
    }

    console.log("✅ Shipment data preloaded successfully");
  } catch (error) {
    console.error("❌ Error during shipment data preload:", error);
  }
}
