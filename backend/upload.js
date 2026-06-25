// =====================================================================
// COLUMN MAPS — har platform ke real export file ke column headers
// =====================================================================
// WHY THIS FILE EXISTS (important — isse zaroor padhna):
//
// Meesho/Amazon/Flipkart apne report ke column names samay-samay par
// badalte rehte hain (Amazon ka "transaction-wise" vs "ready-to-file"
// report alag column names rakhte hain, Flipkart kabhi-kabhi sheet
// protection laga deta hai, etc).
//
// Agar hum column names ko code mein HARDCODE karte ("row['Taxable Value']")
// toh 2-3 mahine baad jab platform format badlega, tool TOOT jayega aur
// tujhe pata bhi nahi chalega kyun.
//
// Isliye yahan har "logical field" (jaise taxableValue) ke against
// MULTIPLE possible column name aliases di gayi hain. Parser jab file
// kholta hai, woh header row check karta hai aur jo bhi alias match
// kare usse use kar leta hai.
//
// >>> ACTION ITEM TERE LIYE <<<
// Apni real exported file kholke header row dekh, aur agar koi column
// yahan list mein nahi hai, bas us field ke array mein add kar de.
// Koi code logic change karne ki zarurat nahi — sirf yeh list badhani hai.
// =====================================================================

const MEESHO_COLUMN_MAP = {
  orderId: ["Sub Order No", "Sub Order No.", "Order No", "Order Id"],
  invoiceDate: ["Order Date", "Invoice Date"],
  productName: ["Product Name", "Product"],
  hsnCode: ["HSN Code", "HSN", "Hsn Code"],
  taxableValue: ["Taxable Value", "Taxable Amount", "Total Taxable Value"],
  taxRate: ["GST Rate", "Gst Rate %", "Tax Rate"],
  cgst: ["CGST Amount", "CGST"],
  sgst: ["SGST Amount", "SGST"],
  igst: ["IGST Amount", "IGST"],
  tcsAmount: ["TCS Amount", "TCS"],
  buyerState: ["Customer State", "Ship To State", "Buyer State"],
  buyerGstin: ["Customer GSTIN", "Buyer GSTIN"],
  orderStatus: ["Reason for Credit Entry", "Order Status", "Live Order Status"],
};

const AMAZON_COLUMN_MAP = {
  orderId: ["Order Id", "Order ID"],
  invoiceNumber: ["Invoice Number", "Invoice Num"],
  invoiceDate: ["Invoice Date"],
  productName: ["Item Description", "Item Description (30 Char)"],
  hsnCode: ["Hsn/Sac", "HSN/SAC", "Hsn Code"],
  taxableValue: ["Tax Exclusive Gross", "Taxable Value", "Principal Amount"],
  taxRate: ["Igst Rate", "Cgst Rate", "Tax Rate"], // resolved combined in parser
  cgst: ["Cgst Tax", "CGST Tax Amount"],
  sgst: ["Sgst Tax", "SGST Tax Amount"],
  igst: ["Igst Tax", "IGST Tax Amount"],
  tcsAmount: ["Tcs Igst Amount", "Tcs Cgst Amount", "Tcs Sgst Amount", "TCS Amount"],
  buyerState: ["Ship To State", "Customer Ship To State"],
  buyerGstin: ["Customer Bill To Gstid", "Buyer Gstin", "Customer Gstin"],
  transactionType: ["Transaction Type"], // Shipment / Refund / Cancel
  orderStatus: ["Transaction Type"],
};

const FLIPKART_COLUMN_MAP = {
  orderId: ["Order Id", "Order Item Id", "Order ID"],
  invoiceNumber: ["Invoice Number"],
  invoiceDate: ["Order Date", "Invoice Date"],
  productName: ["Product Title", "Item Description"],
  hsnCode: ["HSN Code", "Hsn Code"],
  taxableValue: ["Taxable Value", "Assessable Value"],
  taxRate: ["Tax Rate", "GST Rate"],
  cgst: ["CGST Amount", "CGST"],
  sgst: ["SGST Amount", "SGST"],
  igst: ["IGST Amount", "IGST"],
  tcsAmount: ["TCS Amount", "TCS"],
  buyerState: ["Buyer State", "Customer State", "Ship To State"],
  buyerGstin: ["Buyer Gstin", "Customer GSTIN"],
  orderStatus: ["Order Status", "Type"], // "Sale" / "Return" / "Cancel"
};

module.exports = {
  MEESHO_COLUMN_MAP,
  AMAZON_COLUMN_MAP,
  FLIPKART_COLUMN_MAP,
};
