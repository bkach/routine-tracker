# Ankle Routine

A simple web app for guided exercise routines with timers, progress tracking, and shareable configurations.

**🚀 [Live Demo](https://bkach.github.io/routine-tracker/)**

## Features

- **YAML-based Configuration** - Define routines in easy-to-read YAML
- **Built-in Editor** - Edit your routine directly in the browser
- **URL Sharing** - Share custom routines with compressed URLs
- **Configurable Settings** - Toggle sound, countdown beeps, and automatic rest periods
- **Timeline Navigation** - Visual progress tracker with quick navigation
- **Keyboard Shortcuts** - Arrow keys to navigate, Space to start/pause, Escape to close modals
- **Mobile Responsive** - Works on phones, tablets, and desktop
- **Audio Feedback** - Countdown beeps and completion chimes

## Quick Start

1. Open the app and follow the exercise cards
2. Use **→ Next** and **← Previous** to navigate (or arrow keys)
3. Click **Timeline** to see progress or **Edit** to customize
4. Click **Settings** to configure sound, countdown, and rest periods
5. Click **Share** to copy a shareable link with your custom routine

## Local Development

```bash
git clone https://github.com/bkach/routine-tracker.git
cd routine-tracker
python3 -m http.server 8000
open http://localhost:8000
```

## Tech Stack

Pure HTML, CSS, JavaScript • js-yaml • pako (compression) • Web Audio API
