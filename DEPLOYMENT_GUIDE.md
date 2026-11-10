# 🚀 Guru777 Production Deployment Handbook (Vora / VPS / Ubuntu)

Yeh guide aapko Guru777 Matka platform ko Vora / Hostinger / DigitalOcean / AWS / kisi bhi Ubuntu VPS par 100% production ready live karne ke steps batati hai.

---

## 🏗️ Architecture Overview

Platform me 4 main components hain:
1. **Backend Engine (`server/`)**: Express + SQLite WAL + Matka Settlement Engine + Automation Worker (Port `5050`).
2. **User Web Portal (`apps/user-web/dist`)**: Pink/White theme, Betting & Wallet (Subdomain: `play.yourdomain.com`).
3. **Live Result Web Portal (`apps/result-web/dist`)**: Neon/Gold theme, Fastest Results & Charts (Subdomain: `results.yourdomain.com`).
4. **Master Admin Panel (`apps/admin-web/dist`)**: 3-Column Beige/Gold Dashboard, Result Setter & Controls (Subdomain: `admin.yourdomain.com`).

---

## 📋 Step 1: Server Setup (Ubuntu 22.04 / 24.04 LTS)

SSH se apne server me login karein:
```bash
ssh root@your_server_ip
```

System packages update karein:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw build-essential
```

### Install Node.js 20 LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Check: v20.x.x
npm -v  # Check: v10.x.x
```

### Install PM2 Globally (Process Manager):
```bash
sudo npm install -g pm2
```

---

## 📂 Step 2: Upload / Clone Project Code

Aap project ko `/var/www/matka` directory me clone ya SCP/SFTP se upload karein:
```bash
sudo mkdir -p /var/www/matka
sudo chown -R $USER:$USER /var/www/matka
cd /var/www/matka
```

Agar zip file upload ki hai:
```bash
unzip matka.zip -d /var/www/matka/
cd /var/www/matka
```

Dependencies install karein:
```bash
npm install
```

---

## 🔨 Step 3: Production Build Generation

Teeno frontend web apps ka single-command high-speed optimized production build banayein:
```bash
npm run build
```
Yeh command create karegi:
- `apps/user-web/dist/`
- `apps/result-web/dist/`
- `apps/admin-web/dist/`

---

## ⚙️ Step 4: PM2 se Backend Server Start Karein

PM2 background me server ko 24/7 chalata hai aur crash ya server reboot hone par automatically restart kar deta hai:

```bash
# PM2 start using ecosystem config
pm2 start ecosystem.config.js

# Check status
pm2 status

# Server reboot hone par auto-start enable karein:
pm2 save
pm2 startup
```

PM2 logs dekhne ke liye:
```bash
pm2 logs guru777-backend
```

---

## 🌐 Step 5: Nginx Multi-Domain Setup

1. Copy Nginx configuration:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/guru777
```

2. File me apne domain names daalein:
```bash
sudo nano /etc/nginx/sites-available/guru777
```
*(Replace `play.yourdomain.com`, `results.yourdomain.com`, `admin.yourdomain.com` with your real domains or subdomains)*

3. Site enable karein aur Nginx restart karein:
```bash
sudo ln -s /etc/nginx/sites-available/guru777 /etc/nginx/sites-enabled/
sudo nginx -t # Syntax test (Must say successful)
sudo systemctl restart nginx
```

---

## 🔒 Step 6: Free SSL Certificate (HTTPS)

Let's Encrypt Certbot se sabhi domains par instant free SSL lagayein:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d play.yourdomain.com -d results.yourdomain.com -d admin.yourdomain.com
```

Certbot automatically HTTPS redirect aur auto-renewal schedule kar dega!

---

## 🛡️ Step 7: Firewall (UFW) Security

Server security ke liye sirf zaroori ports open rakhein:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🎮 Features & Control Manual

### 1. Manual vs Automatic Result Declaration
- **Instant Manual Result**:
  - Admin Panel me **"Declare Result"** par click karein.
  - Tab 1 **"Instant Manual"** me Market select karein, Open/Close Pana dalein.
  - **"Confirm & Declare Now"** dabate hi sabhi baziya settle ho jayengi aur jeetne waalo ke wallet me paise transfer ho jayenge.
- **Pre-Scheduled Manual Result (अपने हिसाब से टाइम आने पर रिज़ल्ट आए)**:
  - Tab 2 **"Pre-Schedule Result"** me jayein.
  - Market chunein, apna chaha hua Open Pana aur Close Pana pehle se save kar dein.
  - Background scheduler automatically exact market open aur close minute par check karega aur wahi result bina admin ke baithe publish & settle kar dega!
- **Automatic Result Draw (AI Risk Minimizer)**:
  - Tab 3 **"Automatic Draw (AI / Fair)"** me Market ke liye Auto Draw ON karein.
  - Mode chunein: `least_liability` (Company ka profit sabse jyada rakhega aur users ko minimum payout dega) ya `random` (kisi bhi panna ka draw).
  - Background worker exact open/close time par apne aap calculation karke result declare kar dega!

### 2. Financial Management
- **Deposit Approval**: User QR scan karke 12-digit UTR submit karega. Admin **"Deposit Requests"** me jaakar 1-click se **"Approve & Credit Wallet"** karega.
- **Withdrawal Requests**: User Bank A/C ya UPI par withdrawal lagayega. Admin payment transfer karke **"Mark Paid"** karega ya **"Reject & Refund"** karega.
- **Users**: Admin kisi bhi user ka balance edit kar sakta hai aur fraud user ko block kar sakta hai.

### 3. Database Backup
Aapka pura database SQLite WAL mode me `/var/www/matka/matka_production.db` me save rehta hai.
Roz raat ko backup lene ke liye cron job laga sakte hain:
```bash
crontab -e
# Add line:
0 3 * * * cp /var/www/matka/matka_production.db /var/backups/matka_$(date +\%F).db
```
