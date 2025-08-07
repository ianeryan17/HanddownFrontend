# 📱 Handdown Frontend – Community Marketplace App

This repository contains the **frontend mobile application** for Handdown, a community-driven marketplace designed for college students to share, exchange, and discover items within their campus community. Built with React Native and Expo Router, this app provides an intuitive swipe-based interface for browsing listings and connecting with other students.

---

## 📚 Features

- **Swipe-based Feed**: Tinder-like interface for browsing community listings
- **User Authentication**: Complete onboarding flow with email verification
- **Listing Management**: Create, edit, and manage item listings with photos
- **Real-time Messaging**: Built-in chat system for buyer-seller communication
- **Smart Search**: Filter and search listings by categories and tags
- **User Profiles**: Personalized profiles with listing history and preferences
- **Interest Matching**: Tag-based system to match users with relevant items

---

## 📂 Repository Contents

- `app/`: Main application directory with Expo Router structure
  - `onboarding/`: Authentication and user setup screens
  - `feed.jsx`: Main swipe-based listing feed
  - `search.jsx`: Search and filter functionality
  - `profile.jsx`: User profile management
  - `addlisting.jsx`: Create new listings interface
  - `messaging*/`: Chat and messaging components
- `assets/`: Images, fonts, and static resources
- `package.json`: Dependencies and project configuration
- `app.json`: Expo app configuration
- `tailwind.config.js`: Tailwind CSS styling setup
- `babel.config.js`: Babel configuration for React Native

---

## 🛠 Tech Stack

- **Frontend Framework**: React Native with Expo
- **Navigation**: Expo Router + React Navigation
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **Image Handling**: Expo Image Picker
- **UI Components**: Custom components with Ionicons
- **Animations**: React Native Reanimated

---

## ▶️ How to Run

1. **Install Node.js** and **Expo CLI**:

   ```bash
   npm install -g @expo/cli
   ```

2. **Clone this repository**:

   ```bash
   git clone https://github.com/ianeryan17/HanddownFrontend.git
   cd HanddownFrontend
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the development server**:

   ```bash
   npm start
   ```

5. **Run on device/simulator**:
   - **iOS**: `npm run ios` (requires Xcode)
   - **Android**: `npm run android` (requires Android Studio)
   - **Web**: `npm run web`
   - **Expo Go**: Scan QR code with Expo Go app

---

## 📱 App Structure

### Core Categories

The app supports listings across 17 categories:

- Books, Clothes, Accessories, Furniture, Bedding
- Electronics, Kitchenware, School Supplies
- Home Decor, Formalwear, Costumes, Sports Equipment
- Outdoor, Housing, Groceries, Arts & Craft, Transportation

### User Journey

1. **Onboarding**: Email verification → User info → Photo upload → Interest tags → Giving preferences
2. **Main App**: Browse feed → Swipe on listings → Message sellers → Manage profile
3. **Listing**: Create listings → Add photos → Set categories → Choose transaction type

---

## 🎨 Design Features

- **Custom Typography**: Multiple font families (Work Sans, Nunito, Lora, etc.)
- **Background Patterns**: Textured backgrounds for visual appeal
- **Swipe Animations**: Smooth card-based interactions with visual feedback
- **Responsive UI**: Optimized for both iOS and Android platforms
- **Loading States**: Comprehensive loading management throughout the app

---

## 🔧 Configuration

The app uses several configuration files:

- **Backend Integration**: Configurable API endpoints in `app/config.js`
- **Styling**: Tailwind CSS with custom color scheme (primary: `#2aa4eb`)
- **Navigation**: Tab-based navigation with custom icons
- **Fonts**: Custom font loading with Expo Font

---

## 🚀 Future Enhancements

- Push notifications for new messages and matches
- Advanced filtering and recommendation algorithms
- In-app payment integration
- Social features (reviews, ratings, friend connections)
- Location-based listing discovery
- Dark mode support

---

## 📄 License

This code was developed as part of a capstone project and is intended for educational and portfolio purposes. Please respect intellectual property rights when using or referencing this code.

---

**Built with ❤️ for the college community**
