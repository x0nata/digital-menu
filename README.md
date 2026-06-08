# 🍽️ Digital Restaurant Menu

<div align="center">

![menu](https://img.shields.io/badge/mmm%20menu-Digital%20Restaurant%20Menu-red?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-EC4E20?style=for-the-badge)](https://convex.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

*A modern digital menu platform for restaurants — browse dishes, manage categories, and scan QR orders*

[🎯 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📖 Documentation](#-documentation) • [🌐 Deployment](#-deployment)

</div>

---

## 🎯 Features

### 🍝 **Digital Menu**
- **Dynamic Menu Display** - Browse categorized dishes with rich descriptions
- **Responsive Design** - Mobile-first layout optimized for any device
- **Dark Mode** - Seamless light/dark theme switching
- **Loading States** - Smooth loading indicators while content loads

### 👨‍🍳 **Admin Panel**
- **Dashboard** - Real-time overview and management controls
- **Dish Management** - Add, edit, and organize menu items with images
- **Category Management** - Flexible category organization
- **Settings** - Customize theming and restaurant branding

### 📱 **Waiter Tools**
- **QR Scanner** - Built-in QR code scanning for order processing
- **Order History** - Track today's scanned orders
- **Quick Actions** - Scan next or discard orders instantly

### 🎨 **Design System**
- **Customizable Theme** - Brand colors configured via admin settings
- **Consistent UI** - Unified component library with Tailwind
- **Icon Library** - Material Symbols integration throughout
- **Smooth Animations** - Polished transitions and micro-interactions

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

### Backend
[![Convex](https://img.shields.io/badge/Convex-Backend-EC4E20?style=flat-square)](https://convex.dev/)

### Libraries
[![html5-qrcode](https://img.shields.io/badge/html5--qrcode-Scanner-4285F4?style=flat-square)](https://github.com/mebjas/html5-qrcode)
[![Material Symbols](https://img.shields.io/badge/Material_Symbols-Icons-4285F4?style=flat-square)](https://fonts.google.com/icons)

</div>

---

## 📖 Documentation

### 🏗️ Project Structure

```
📦 mmm menu
├── 🍕 src/
│   ├──  App.jsx              # Main menu page
│   ├──  index.css            # Global styles & theme
│   ├──  main.jsx             # App entry & routing
│   ├──  admin/               # Admin dashboard panel
│   │   ├──  AdminLayout.jsx  # Admin layout shell
│   │   ├──  Dashboard.jsx    # Overview dashboard
│   │   ├──  DishesManager.jsx # Dish CRUD
│   │   ├──  CategoriesManager.jsx # Category CRUD
│   │   ├──  SettingsManager.jsx # Theme settings
│   │   └──  LoginPage.jsx    # Admin authentication
│   └──  waiter/              # Waiter tools
│       └──  WaiterScanner.jsx # QR order scanner
└── ⚡ convex/                 # Convex backend schema & functions
    └──  schema.ts            # Database schema
```

### 🔑 Key Features Implementation

- **Routing**: React Router v7 with admin sub-routes
- **Theming**: CSS custom properties for dynamic brand colors
- **QR Scanning**: html5-qrcode library with environment camera
- **State Management**: Convex for real-time data synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Admin Panel**: Nested routes with shared layout
- **Loading States**: Pulsing text indicators while content loads

---

## 🌐 Deployment

### Platform
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat-square&logo=vercel)](https://vercel.com/)

<div align="center">

**Made with 🤍**

</div>
