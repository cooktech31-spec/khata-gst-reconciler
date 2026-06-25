generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Supabase Auth se aane wala user
model User {
  id        String    @id // Supabase auth UUID
  email     String    @unique
  createdAt DateTime  @default(now())
  companies Company[]
}

// Har seller ka alag company — userId se isolated
model Company {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  legalName String
  gstin     String
  homeState String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  batches   ReconciliationBatch[]

  @@unique([userId, gstin])
  @@index([userId])
}

model ReconciliationBatch {
  id                     String     @id @default(uuid())
  companyId              String
  company                Company    @relation(fields: [companyId], references: [id])
  periodMonth            Int
  periodYear             Int
  status                 String     @default("processing")
  totalOrders            Int        @default(0)
  totalTaxableValue      Decimal    @default(0) @db.Decimal(14, 2)
  totalTaxCollected      Decimal    @default(0) @db.Decimal(14, 2)
  tcsExpected            Decimal    @default(0) @db.Decimal(14, 2)
  tcsReportedByPlatforms Decimal    @default(0) @db.Decimal(14, 2)
  mismatchCount          Int        @default(0)
  aiInsightHinglish      String?    @db.Text
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt
  lineItems              LineItem[]

  @@unique([companyId, periodMonth, periodYear])
}

model LineItem {
  id            String              @id @default(uuid())
  batchId       String
  batch         ReconciliationBatch @relation(fields: [batchId], references: [id])
  platform      String
  orderId       String?
  invoiceNumber String?
  invoiceDate   DateTime?
  hsnCode       String?
  productName   String?
  taxableValue  Decimal             @default(0) @db.Decimal(12, 2)
  taxRate       Decimal?            @db.Decimal(5, 2)
  cgst          Decimal             @default(0) @db.Decimal(12, 2)
  sgst          Decimal             @default(0) @db.Decimal(12, 2)
  igst          Decimal             @default(0) @db.Decimal(12, 2)
  tcsAmount     Decimal             @default(0) @db.Decimal(12, 2)
  buyerState    String?
  buyerGstin    String?
  supplyType    String              @default("B2CS")
  orderStatus   String              @default("DELIVERED")
  flagMissingHsn   Boolean          @default(false)
  flagRateMismatch Boolean          @default(false)
  flagDuplicate    Boolean          @default(false)
  rawRow        Json?

  @@index([batchId])
  @@index([platform])
}
