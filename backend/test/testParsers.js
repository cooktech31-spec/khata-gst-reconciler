// Quick smoke test — sample CSVs ko parse karke reconcile engine chalata hai
// Run: node test/testParsers.js

const fs = require("fs");
const path = require("path");

const { parseMeeshoFile } = require("../src/parsers/meeshoParser");
const { parseAmazonFile } = require("../src/parsers/amazonParser");
const { parseFlipkartFile } = require("../src/parsers/flipkartParser");
const { reconcile } = require("../src/services/reconcile");

const SAMPLE_DIR = path.join(__dirname, "..", "..", "sample-data");

function loadFile(name) {
  return fs.readFileSync(path.join(SAMPLE_DIR, name));
}

console.log("=== STEP 1: Parsing each platform file ===\n");

const meesho = parseMeeshoFile(loadFile("meesho_sample.csv"), "meesho_sample.csv");
console.log(`Meesho: ${meesho.lineItems.length} rows parsed`, meesho.warnings.length ? meesho.warnings : "");

const amazon = parseAmazonFile(loadFile("amazon_sample.csv"), "amazon_sample.csv");
console.log(`Amazon: ${amazon.lineItems.length} rows parsed`, amazon.warnings.length ? amazon.warnings : "");

const flipkart = parseFlipkartFile(loadFile("flipkart_sample.csv"), "flipkart_sample.csv");
console.log(`Flipkart: ${flipkart.lineItems.length} rows parsed`, flipkart.warnings.length ? flipkart.warnings : "");

const allItems = [...meesho.lineItems, ...amazon.lineItems, ...flipkart.lineItems];

console.log("\n=== STEP 2: Sample normalized row (sanity check) ===");
console.log(JSON.stringify({ ...allItems[0], rawRow: undefined }, null, 2));

console.log("\n=== STEP 3: Running reconciliation engine ===\n");
const result = reconcile(allItems, "Rajasthan");

console.log("--- SUMMARY ---");
console.log(result.summary);

console.log("\n--- HSN SUMMARY ---");
console.table(result.hsnSummary);

console.log("\n--- STATE SUMMARY ---");
console.table(result.stateSummary);

console.log("\n--- B2B INVOICES ---");
console.table(result.b2bInvoices);

console.log("\n--- PLATFORM BREAKDOWN ---");
console.table(result.platformBreakdown);

console.log("\n--- FLAGGED ITEMS (data quality issues) ---");
result.flaggedItems.forEach((item) => {
  console.log(`[${item.platform}] Order ${item.orderId}:`);
  item.flags.forEach((f) => console.log(`   -> ${f.type}: ${f.message}`));
});

console.log("\n=== TEST COMPLETE ===");
