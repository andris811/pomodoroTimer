# Pomodoro Timer ⏱️

A simple and stylish Pomodoro timer built with **React + TypeScript** and styled using **Tailwind CSS**.  
This app helps you stay focused using the Pomodoro Technique, with a clean interface and subtle animations inspired by [pomofocus.io](https://pomofocus.io).

---

## ✨ Features

- 🎯 Pomodoro / Short Break / Long Break modes  
- ✅ Tracks completed Pomodoros (resets after 4 sessions and a long break)  
- ⏳ Auto-start next session after 20 seconds  
- 🖱️ Manual “Start Now” / “Cancel” options  
- ⏸️ Pause / Resume at any time  
- ⏭️ Skip to next session if needed  
- 🔄 Animated checkmarks to indicate progress  
- 💡 Responsive design, hover and click feedback for buttons  

---

## 🧪 Testing Mode

Timer durations are currently shortened for development:

```ts
const MODES = {
  pomodoro: 10,
  short: 5,
  long: 15,
};
```

To use the actual Pomodoro timings, change them to:

```ts
const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pomodoro-timer.git
cd pomodoro-timer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## 🛠 Tech Stack

- React  
- TypeScript  
- Tailwind CSS  
- Vite  

---

## 📸 Preview

Coming soon...

---

## 📄 License

This project is open-source and free to use under the [MIT License](LICENSE).
