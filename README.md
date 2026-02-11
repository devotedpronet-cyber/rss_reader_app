# RSS Feed Reader Web App

A sleek, modern web application that displays RSS feeds in categorized tabs with large thumbnails where available.

## Features

- Sleek, modern design with glassmorphism effects and smooth animations
- Four categorized tabs for different RSS feed topics
- Large thumbnail images displayed where available in feeds
- Clean, intuitive interface with tab navigation
- Fast loading with concurrent feed fetching
- External link tab that redirects directly to the target website
- Enhanced error handling with multiple feed sources and CORS proxy fallbacks
- Fully responsive design optimized for mobile devices

## Categories

1. **Payments Industry** - Latest news from payment processors and fintech
2. **Bitcoin & Blockchain** - Cryptocurrency and blockchain technology updates
3. **News in Portugal** - Portuguese news sources
4. **External Link** - Direct link to kindgirls.com/r.php (clicking the tab redirects immediately)

## Technical Details

- Pure HTML/CSS/JavaScript (no backend required)
- Uses multiple CORS proxy fallbacks to fetch RSS feeds directly in browser
- Sleek glassmorphism design with gradient backgrounds
- Smooth animations and micro-interactions
- Responsive design with mobile-first approach
- Modern CSS features like flexbox, grid, and backdrop-filter
- Enhanced error handling and fallback feed sources
- Automatic retry mechanism with 4 different CORS proxy servers

## How to Use

1. Host the files on any static web hosting service (GitHub Pages, Netlify, Vercel, etc.)
2. Access the index.html file in a web browser
3. Navigate between tabs to view different categories
4. Click on article titles to read full content on the original sites
5. Click the "Kind Girls" tab to be redirected to the external site

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Sleek styling and responsive design
├── script.js           # JavaScript functionality for RSS fetching and UI
├── README.md           # This file
└── manifest.json       # Project metadata
```

## Browser Compatibility

The app uses modern web standards and should work in all modern browsers (Chrome, Firefox, Safari, Edge).

## Notes

- The app fetches RSS feeds directly in the browser using multiple CORS proxy fallbacks
- Images are extracted from RSS feed content when available
- Feed loading may take a few seconds depending on network conditions
- Multiple feed sources are included with fallbacks for improved reliability
- Some feeds may occasionally fail due to external factors, but multiple fallbacks increase success rates
- The external tab redirects immediately to the target URL when clicked
- Multiple CORS proxy servers are tried automatically if one fails
- Design optimized for both desktop and mobile experiences