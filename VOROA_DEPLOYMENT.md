# 🌐 Voroa Cloud Deployment Guide (JANTA555 Matka)

Aapka pura code aapke GitHub account par repository me push ho chuka hai:
🔗 **GitHub Repo:** [https://github.com/munna2006-jaat/janta555-matka](https://github.com/munna2006-jaat/janta555-matka)

---

## 🚀 Voroa (`app.getvoroa.com`) par Live Deploy karne ka Step-by-Step Process

---

### 1️⃣ Step 1: Voroa me Nayi Web Service Banayein

1. [app.getvoroa.com](https://app.getvoroa.com) me login karein.
2. Top right corner me **`+ New`** button par click karein.
3. **`Web Service`** (ya `Service`) select karein.
4. **Connect GitHub Account** par click karein aur apna GitHub (`munna2006-jaat`) chunein.
5. List me se apni nayi repository select karein:
   👉 **`janta555-matka`** (Branch: `main`)

---

### 2️⃣ Step 2: Build & Start Settings Configure Karein

Voroa ke service creation page par yeh exact settings bharein:

| Setting | Value |
| :--- | :--- |
| **Name** | `janta555` |
| **Region** | `Mumbai (IN)` *(ya jo bhi aapka database region hai)* |
| **Branch** | `main` |
| **Runtime** | `Node.js` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Port** | `5055` |

---

### 3️⃣ Step 3: Database Connect Karein (Optional / Voroa PostgreSQL)

Agar aapke paas Voroa par pehle se PostgreSQL database hai:
1. Voroa me left menu se apne database par jayein.
2. Niche scroll karein jaha likha hai: **"Connect to a service"**
3. **`Choose a service`** dropdown me apni nayi bani hui service (`janta555`) ko select karein.
4. **`Connect`** button daba dein! Voroa automatically `DATABASE_URL` inject kar dega.

> **Note:** Agar aap Voroa par alag se database connect nahi bhi karte, toh code ke andar built-in persistent SQLite database pehle se configured hai jo bina kisi database setup ke turant live chalega!

---

### 4️⃣ Step 4: Environment Variables (Variables tab)

Agar custom settings deni ho toh Voroa ke **Variables** tab me yeh add kar sakte hain:

```env
PORT=5055
NODE_ENV=production
ADMIN_USER=AdminJanta555
ADMIN_PASSWORD=Janta555@2026
META_PIXEL_ID=2066705063996932
```

---

### 5️⃣ Step 5: Deploy & Live Check

**Deploy** button par click karein. Voroa automatically:
1. Saari dependencies install karega (`npm install`)
2. Client Web, Admin Web aur Server compile karega (`npm run build`)
3. Server start karega (`npm start`)

Voroa aapko free live SSL domain de dega, jaise:
🔗 **`https://janta555-xxxx.getvoroa.app`**

Aap is single URL se sab kuch access kar sakte hain:
- 📱 **Main User App:** `https://janta555-xxxx.getvoroa.app/`
- 👑 **Master Admin Panel:** `https://janta555-xxxx.getvoroa.app/admin`

*(Admin Login: Username: `AdminJanta555` | Password: `Janta555@2026`)*

---

### 6️⃣ Custom Domain Lagana (e.g. `janta555.com`)

1. Voroa me apni Service ke **Settings -> Custom Domains** me jayein.
2. Apna domain daalein (jaise `janta555.com` ya `app.janta555.com`).
3. Voroa jo CNAME / A-Record dega, usko apne Domain DNS (Cloudflare / GoDaddy / Namecheap) me add kar dein.
4. Free SSL automatically activate ho jayega!
