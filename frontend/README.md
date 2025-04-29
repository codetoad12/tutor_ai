# The Daily Brief - UPSC Current Affairs

A modern digital newspaper-style web application for UPSC aspirants to stay updated with daily current affairs.

## Features

- **Digital Newspaper Layout**: Clean, familiar interface styled like a modern news site
- **Date-based Navigation**: Browse current affairs by date
- **Category Filters**: Filter news by categories relevant to UPSC
- **Exam Focus Sections**: Find content specific to Prelims, Mains, or Interview preparation
- **UPSC-optimized Content**: Each article includes:
  - Summary of the news event
  - Key concepts relevant to the UPSC syllabus
  - Direct syllabus connections
  - Potential questions that could be asked in exams

## Tech Stack

- React 18
- Tailwind CSS
- Vite
- date-fns for date handling

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/daily-brief.git
cd daily-brief/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## API Integration

The application expects a backend API with the following endpoint:

- `/api/current-affairs/?date=YYYY-MM-DD` - Returns current affairs articles for the specified date

## Build for Production

```bash
npm run build
# or
yarn build
```

This will generate optimized production files in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── DailyBrief.js      # Main component for the newspaper layout
│   ├── styles.css             # Global styles and Tailwind imports
│   ├── current-affairs.js     # Entry point for the application
│   └── current-affairs.html   # HTML template
├── public/                    # Static files
└── ...configuration files
```

## Customization

### Adding New Categories

1. Add the new category to the filtering logic in `DailyBrief.js`
2. Add corresponding styling in `styles.css` under the category badges section

### Modifying the Layout

The main layout is defined in the `DailyBrief.js` component and uses a responsive design:
- Mobile: Single column layout
- Desktop: Two-column layout with news feed and sidebar

## License

MIT 