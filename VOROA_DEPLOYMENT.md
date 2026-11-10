# 🌐 Voroa Cloud Deployment Guide (Guru777 Matka)

Aapka pura code aapke GitHub account par **private repository** me push ho chuka hai:
🔗 **GitHub Repo:** [https://github.com/munna2006-jaat/guru777-matka](https://github.com/munna2006-jaat/guru777-matka)

---

## 🚀 Voroa (`app.getvoroa.com`) par Live Deploy karne ka Step-by-Step Process

Aapne pehle se hi Voroa par **`matka` (PostgreSQL)** database bana liya hai (Mumbai Region). Ab bas **1 Web Service** banani hai aur dono ko connect karna hai!

---

### 1️⃣ Step 1: Voroa me Nayi Web Service Banayein

1. [app.getvoroa.com](https://app.getvoroa.com) me login karein.
2. Top right corner me **`+ New`** button par click karein.
3. **`Web Service`** (ya `Service`) select karein.
4. **Connect GitHub Account** par click karein aur apna GitHub (`munna2006-jaat`) chunein.
5. List me se apni nayi repository select karein:
   👉 **`guru777-matka`** (Branch: `main`)

---

### 2️⃣ Step 2: Build & Start Settings Configure Karein

Voroa ke service creation page par yeh settings bharein:

| Setting | Value |
| :--- | :--- |
| **Name** | `guru777` (ya jo bhi aap rakhna chahein) |
| **Region** | `Mumbai (IN)` *(Wahi region chunein jisme aapka `matka` database hai)* |
| **Branch** | `main` |
| **Runtime** | `Node.js` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Port** | `5050` |

---

### 3️⃣ Step 3: Database ko Service se Connect Karein (Auto `DATABASE_URL`)

Aapke Voroa Database page par niche ek section hai jo aapke screenshot me dikh raha hai:
👉 **"Connect to a service"**

1. Voroa me left menu se apne **`matka`** database par jayein:
   `app.getvoroa.com/databases/de7af005db3fb38ebfa11ec9`
2. Niche scroll karein jaha likha hai:
   **"Connect to a service"**
3. **`Choose a service`** dropdown par click karein aur apni nayi bani hui service (jaise `guru777`) ko select karein.
4. Environment variable me `DATABASE_URL` pehle se bhara hoga.
5. **`Connect`** button daba dein!

*(Jaise hi aap Connect dabayenge, Voroa automatically database ka pura password aur secret connection string aapki Web Service ke environment variables me inject kar dega!)*

---

### 4️⃣ Step 4: Deploy & Live Check

Voroa automatically build chalayega:
1. `npm install`
2. `npm run build` (user-web, result-web, aur admin-web teeno ka ultra-fast static build generate karega)
3. `npm start` (backend start hoga, PostgreSQL database se table schema auto-create karega, default admin banayega, aur live monitor start karega)

Voroa aapko ek free live domain dega, jaise:
🔗 **`https://guru777-xxxx.getvoroa.app`**

Aap is single URL se teeno websites access kar sakte hain:
- 📱 **Main User Betting App:** `https://guru777-xxxx.getvoroa.app/`
- 📊 **Live Fastest Result Portal:** `https://guru777-xxxx.getvoroa.app/results`
- 👑 **Master Admin Panel:** `https://guru777-xxxx.getvoroa.app/admin`

*(Admin Default Login: Username: `admin` | Password: `guru777@admin`)*

---

### 5️⃣ (Optional) Apna Custom Domain / Subdomain Lagana

Agar aapke paas apna domain hai (jaise `guru777.com`):
1. Voroa me apni Service ke **Settings -> Custom Domains** me jayein.
2. Yeh 3 subdomains add karein:
   - `play.guru777.com` (Main App)
   - `results.guru777.com` (Result Portal)
   - `admin.guru777.com` (Admin Dashboard)
3. Humare server code me humne **Automatic Host-Header Subdomain Routing** pehle se laga di hai, isliye custom subdomains bina kisi extra configuration ke direct open honge!
