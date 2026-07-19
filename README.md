# SARKAR ⚡ Free Fire Guild Website

A premium, private mobile-first guild portal for SARKAR. Built with Vite, React, Tailwind CSS, and Netlify Functions with MongoDB integration.

## 🚀 Deployment (Netlify)

This project is ready to be deployed on Netlify.

### 1. MongoDB Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database named `sarkar_guild`.
3. Create a collection named `members`.
4. Get your Connection String (SRV).

### 2. Environment Variables
Add the following variables to your Netlify site settings (**Site settings > Build & deploy > Environment > Environment variables**):

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB Connection String |
| `DB_NAME` | `sarkar_guild` (or your preferred DB name) |
| `SITE_PASSWORD` | Shared password for guild members to access the site |
| `ADMIN_EMAIL` | Email for admin login |
| `ADMIN_PASSWORD` | Password for admin dashboard |
| `JWT_SECRET` | A random long string for security |

### 3. Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

## 🛠️ Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Install Netlify CLI to test functions locally:
   ```bash
   npm install -g netlify-cli
   ```

3. Run locally:
   ```bash
   netlify dev
   ```

## ✨ Features

- **Liquid Glassmorphism UI:** Premium frosted panels with subtle red accents.
- **Mobile-First:** Thumb-friendly layout with bottom navigation.
- **Site Gate:** Site-wide password protection for privacy.
- **Members List:** Dynamic member roster fetched from MongoDB.
- **Admin Dashboard:** Hidden portal to manage, edit, and remove members.
- **Zero Logic Exposure:** Backend URLs and DB logic are hidden in serverless functions.
