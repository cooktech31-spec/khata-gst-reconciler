# Khata — GST Reconciler
## Setup Guide (Hinglish)

**Kya hai yeh tool?**
Teen marketplace (Meesho/Amazon/Flipkart) ke GST export files ek saath upload karo —
Khata automatically reconcile karke GSTR-1 ready Excel aur AI Hinglish analysis deta hai.

---

## Prerequisites (Pehle yeh install karo)

- **Node.js 18+** → [nodejs.org](https://nodejs.org) se download
- **PostgreSQL database** → Ya Supabase free tier (recommended, setup neeche hai)
- **Anthropic API key** → [console.anthropic.com](https://console.anthropic.com) se
- **Git** (optional)

---

## Step 1 — Database Setup (Supabase Free Tier)

1. [supabase.com](https://supabase.com) pe account banao — free hai
2. New project banao
3. Left sidebar > Settings > Database > Connection string (URI) copy karo
4. Yeh URL kuch aisa dikhega:  
   `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`
5. Yahi URL backend ke `.env` mein `DATABASE_URL` mein daalenge

---

## Step 2 — Backend Setup

```bash
# Project folder mein jao
cd gst-reconciler/backend

# Dependencies install karo
npm install

# .env file banao
cp .env.example .env
```

Ab `.env` file kholo aur fill karo:

```
DATABASE_URL=postgresql://postgres:[pass]@db.[id].supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxx
API_KEY=koi-bhi-secret-string-banao-jaise-khata-2024-secret
TCS_RATE_PERCENT=0.5
PORT=4000
```

```bash
# Database tables create karo (ek baar karna hai)
npx prisma migrate dev --name init

# Backend start karo
node server.js
# Output dikhega: "Khata backend ready — port 4000"
```

---

## Step 3 — Frontend Setup

```bash
# Frontend folder mein jao
cd ../frontend

# Dependencies install karo
npm install

# .env.local banao
cp .env.example .env.local
```

`.env.local` fill karo:

```
VITE_API_BASE_URL=http://localhost:4000
VITE_API_KEY=wahi-secret-jo-backend-mein-likha-tha
```

```bash
# Frontend dev server start karo
npm run dev
# Browser mein khulega: http://localhost:5173
```

---

## Step 4 — Apni Files Kaise Download Karein

**Meesho** → Seller Panel > Payments > GST Invoice Summary > Download  
**Amazon** → Seller Central > Reports > Tax Document Library > MTR Report  
**Flipkart** → Seller Hub > Finance > Tax Invoice > Download Tax Report  

Yeh `.xlsx` ya `.csv` format mein aate hain — directly upload karo.

---

## Step 5 — Deploy to Production

### Frontend → Vercel (Free)

```bash
# Frontend folder mein
npm run build

# Ya seedha Vercel CLI use karo
npx vercel deploy
```

Vercel dashboard mein Environment Variables daalo:
- `VITE_API_BASE_URL` = `https://your-backend.railway.app`
- `VITE_API_KEY` = apna secret

### Backend → Railway (Free tier available)

1. [railway.app](https://railway.app) pe account banao
2. New project > Deploy from GitHub (ya local upload)
3. Environment Variables mein wahi `.env` values daalo
4. Root directory: `backend/`
5. Start command: `node server.js`

Railway automatically port detect karta hai.

---

## Folder Structure

```
gst-reconciler/
├── backend/
│   ├── prisma/schema.prisma     # Database schema
│   ├── src/
│   │   ├── parsers/             # Meesho/Amazon/Flipkart file parsers
│   │   ├── services/
│   │   │   ├── reconcile.js     # Core reconciliation engine
│   │   │   ├── aiInsights.js    # Claude API Hinglish analysis
│   │   │   └── exportExcel.js   # GSTR-1 Excel export
│   │   └── routes/
│   │       ├── upload.js        # POST /api/reconcile
│   │       └── batches.js       # GET /api/batches
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/          # UI building blocks
│       ├── pages/               # Home.jsx (upload), Results.jsx (dashboard)
│       └── lib/                 # api.js, format.js helpers
│
└── sample-data/                 # Test CSV files (3 platforms)
```

---

## Testing (Sample Data Se)

Backend mein real database ke bina test kar sakte ho:

```bash
cd backend
node test/testParsers.js
```

Yeh sample-data/ folder ki CSVs parse karke result print karega.

---

## Agar Koi Issue Aaye

| Problem | Solution |
|---------|----------|
| `prisma migrate` fail hua | DATABASE_URL check karo — postgresql:// se shuru hona chahiye |
| AI insight nahi aa raha | ANTHROPIC_API_KEY check karo — sk-ant- se shuru hona chahiye |
| Upload fail ho raha hai | VITE_API_KEY aur backend API_KEY same hona chahiye |
| 12%/28% rate flag aata hai | Correct hai — yeh GST 2.0 mein abolished rates hain |
| TCS mismatch dikha raha hai | Platform ka GSTR-8 report check karo — 0.5% hona chahiye |

---

## Multi-Tenant SaaS Banana Hai? (Future)

Abhi yeh single-seller tool hai (ek GSTIN per deployment).  
Multi-tenant ke liye:
1. `src/middleware/apiKeyAuth.js` ko Supabase Auth se replace karo
2. `Company` table already multi-tenant ready hai
3. Frontend mein login page add karo

---

## Data Privacy

- Koi bhi file third-party server pe nahi jaati
- Sirf Claude API ko reconciliation summary (raw data nahi) bheja jaata hai analysis ke liye
- Sab data tumhara apna Supabase database mein store hota hai
