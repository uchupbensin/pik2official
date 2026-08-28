#!/bin/bash
# ===== Deploy Script PIK2 Property =====
# Cara pakai: bash deploy.sh
# Prasyarat: sudah SSH ke VPS, berada di folder project

set -e

echo "🚀 Mulai deploy..."
echo ""

# 1. Pull kode terbaru
echo "📥 Pull kode terbaru dari GitHub..."
git pull origin main

# 2. Build & restart container
echo "🔨 Build ulang container..."
docker compose -f docker-compose.yml build app 2>/dev/null || docker build -t pik2-property .

echo "🔄 Restart container..."
docker compose -f docker-compose.yml up -d app 2>/dev/null || docker run -d --name pik2-property --restart unless-stopped -p 3000:3000 pik2-property

echo ""
echo "✅ Deploy selesai!"
echo "🌐 Cek: https://pik2official.id"
