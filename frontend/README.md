# Tutor AI Frontend

A responsive classroom-inspired chat interface for the Tutor AI project.

## Features

- 🎨 Classroom-inspired design with chalkboard and notebook themes
- 💬 Real-time chat interface with typing indicators
- 📱 Fully responsive design for mobile and desktop
- 🎯 Subject-based message organization
- 📝 Notebook sidebar for past questions
- 🎤 Voice input support (coming soon)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # TailwindCSS and custom styles
│   └── main.js         # JavaScript functionality
├── public/             # Static assets
├── package.json        # Project dependencies
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # TailwindCSS configuration
```

## Customization

- Colors and themes can be modified in `tailwind.config.js`
- Font styles can be updated in the HTML file
- Mock responses can be modified in `main.js`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 