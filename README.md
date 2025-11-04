# Routine Tracker

A modern, interactive web application for guided workout routines with timers, progress tracking, and customizable exercises.

**Live Demo:** [https://bkach.github.io/routine-tracker/](https://bkach.github.io/routine-tracker/)

## Features

- ⏱️ **Timer-based and Rep-based exercises** - Support for both timed exercises and rep-based workouts
- 📊 **Progress tracking** - Visual progress bar showing routine completion
- 🎵 **Audio cues** - Countdown beeps and completion sounds
- ⌨️ **Keyboard shortcuts** - Space to play/pause, arrows to navigate
- 📱 **Responsive design** - Works great on desktop and mobile
- ✏️ **Customizable routines** - Edit YAML configuration in-browser
- 🔗 **Shareable links** - Share custom routines via compressed URLs
- 🗂️ **Timeline view** - See all exercises at a glance
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations

## Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management
- **js-yaml** - YAML configuration parsing
- **Web Audio API** - Programmatic sound generation
- **GitHub Pages** - Free static hosting

## Project Structure

```
routine-tracker/
├── public/
│   ├── routine.yml          # Default routine configuration
│   └── favicon.png          # App icon
├── src/
│   ├── components/          # React components
│   │   ├── ExerciseCard.tsx
│   │   ├── Timer.tsx
│   │   ├── RepsDisplay.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Timeline.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── EditorModal.tsx
│   │   └── CompletionView.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAudio.ts
│   │   ├── useTimer.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── store/               # Zustand state management
│   │   └── routineStore.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── yaml.ts
│   │   ├── exercises.ts
│   │   └── settings.ts
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Clone the repository
git clone https://github.com/bkach/routine-tracker.git
cd routine-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/routine-tracker/`

### Available Commands

```bash
npm run dev      # Start Vite dev server with hot reload
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint to check code quality
```

### Build for Production

```bash
# Build the app
npm run build

# The production build will be in the dist/ directory
# You can preview it locally with:
npm run preview
```

### Development Tips

- **Hot Module Replacement (HMR)**: Changes to TypeScript/React files will instantly update in the browser without page refresh
- **Type Checking**: TypeScript errors will show in the terminal and browser console
- **Browser DevTools**: React DevTools extension recommended for debugging components
- **State Inspection**: Use Redux DevTools extension to inspect Zustand store state

### Accessing the Old Version

The original single-file vanilla JavaScript version is preserved in `index.html.backup` for reference. To run it:

```bash
# Serve the old version directly
python3 -m http.server 8000
# Then open index.html.backup manually in browser
```

## Customizing Routines

### Edit in Browser

1. Click the ✏️ (Edit) button in the header
2. Modify the YAML configuration
3. Click "Save Changes"

### YAML Configuration Format

```yaml
title: "Your Routine Name"
subtitle: "Duration • Frequency"
exercises:
  - section: "Section Name"        # Optional grouping
    name: "Exercise Name"
    type: "timed"                   # or "reps"
    sets: 3
    duration: 60                    # For timed exercises (seconds)
    reps: "10 reps"                 # For rep exercises
    instructions: "How to perform the exercise"
    feel: "What you should feel"    # Optional tip
    restBetweenSets: 30            # Optional auto-rest
    restAfterExercise: 60          # Optional rest after all sets
```

### Example: Timed Exercise

```yaml
- name: "Plank Hold"
  type: "timed"
  sets: 3
  duration: 60
  instructions: "Hold a strong plank position"
  restBetweenSets: 30
```

### Example: Rep Exercise

```yaml
- name: "Push-ups"
  type: "reps"
  sets: 3
  reps: "15 reps"
  instructions: "Full range of motion"
  restBetweenSets: 45
```

## Keyboard Shortcuts

- **Space** - Start/Pause timer
- **← / →** - Previous/Next exercise
- **Escape** - Close modals

## Deployment

The app automatically deploys to GitHub Pages on every push to the `main` branch using GitHub Actions.

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## Settings

Access settings by clicking the ⚙️ icon:

- **Enable sounds** - Audio cues for countdown and completion
- **Enable countdown** - 3-2-1 countdown before starting timer
- **Auto-advance exercises** - Automatically move to next exercise

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Web Audio API support.

## License

MIT

## Contributing

Contributions welcome! Feel free to open issues or submit pull requests.
