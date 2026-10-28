# Deploy ke juragan62.aikita.id

Juragan +62 adalah situs statis: Nginx cukup menyajikan folder `dist/`. **Tidak perlu PM2/Node** di server.

## 1. DNS

Buat record `A` untuk `juragan62.aikita.id` → IP server.

## 2. Siapkan server (sekali saja)

```bash
sudo apt install -y nginx certbot rsync
sudo mkdir -p /var/www/juragan62/releases /var/www/certbot
sudo chown -R $USER:$USER /var/www/juragan62
```

## 3. Sertifikat HTTPS (sekali saja)

Konfigurasi lengkap butuh file sertifikat yang belum ada, jadi minta sertifikatnya dulu dengan blok HTTP saja:

```bash
# blok sementara: hanya port 80 untuk validasi
sudo tee /etc/nginx/sites-available/juragan62.aikita.id.conf >/dev/null <<'EOF'
server {
    listen 80;
    server_name juragan62.aikita.id;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/juragan62.aikita.id.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/certbot -d juragan62.aikita.id
```

## 4. Pasang konfigurasi final

```bash
# dari laptop
scp deploy/nginx/juragan62.aikita.id.conf user@server:/tmp/
# di server
sudo mv /tmp/juragan62.aikita.id.conf /etc/nginx/sites-available/juragan62.aikita.id.conf
sudo nginx -t && sudo systemctl reload nginx
```

Perpanjangan sertifikat otomatis lewat timer certbot. Supaya Nginx ikut memuat sertifikat baru:

```bash
echo 'deploy-hook = systemctl reload nginx' | sudo tee -a /etc/letsencrypt/cli.ini
```

## 5. Deploy (setiap rilis)

```bash
DEPLOY_HOST=user@server ./deploy/deploy.sh
```

Script ini menjalankan test, build, upload ke `releases/<waktu>`, lalu menukar symlink `dist` (tanpa downtime, 5 rilis terakhir disimpan untuk rollback).

Rollback manual:

```bash
ln -sfn /var/www/juragan62/releases/<rilis-sebelumnya> /var/www/juragan62/dist
```

## Catatan

- Nginx versi < 1.25 belum mengenal `http2 on;`. Ganti jadi `listen 443 ssl http2;` dan hapus baris `http2 on;`.
- Header `Content-Security-Policy` mengizinkan Google Fonts dan server sinyal PeerJS (`0.peerjs.com`). Kalau nanti memakai server PeerJS sendiri, tambahkan host-nya di `connect-src`.
- Server TURN opsional untuk mode online diatur saat build (`VITE_TURN_URL` dst., lihat README utama), bukan di Nginx.
