# SKYTXT

A weather app with a slightly strange personality.

SKYTXT started as a simple idea: instead of making another weather dashboard full of cards and graphs, I wanted the weather to feel more like a small digital magazine page. The interface uses a scrapbook/editorial style with rough shapes, muted colors, handwritten notes, and weather illustrations.

**Live:** https://skytxt.vercel.app

## What it does

- Search for weather by city
- Detect your current location using the browser's geolocation
- Show the detected city using reverse geocoding
- Display current temperature and feels-like temperature
- Show humidity, wind speed, and pressure
- Show a 7-day forecast
- View the selected location on an interactive map
- Keep recently searched cities in the browser
- Work on desktop and mobile screens

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS
- OpenFreeMap
- Open-Meteo
- Nominatim / OpenStreetMap
- Vercel

The project does not require a paid API key for its core features.

## APIs

### Open-Meteo

Weather data comes from Open-Meteo.

It provides the current weather conditions and daily forecast data used throughout the app.

https://open-meteo.com/

### Open-Meteo Geocoding

City searches are converted into latitude and longitude using Open-Meteo's geocoding service.

https://open-meteo.com/en/docs/geocoding-api

### OpenStreetMap / Nominatim

When the user chooses "Use My Location", the browser provides the coordinates and Nominatim is used to turn those coordinates into a readable city and country name.

https://nominatim.openstreetmap.org/

### OpenFreeMap

The map uses MapLibre GL JS with OpenFreeMap tiles, so there is no map API key required for the project.

https://openfreemap.org/

## Running it locally

You will need Node.js installed.

Clone the repository:

```bash
git clone https://github.com/rajoshreedhar/SKYTXT.git
cd SKYTXT
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Project structure

```text
skytxt/
├── app/
│   ├── page.tsx
│   ├── WeatherMap.tsx
│   └── ...
├── public/
│   └── maplibre/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## Design

I wanted the visual style to feel less like a typical weather SaaS dashboard.

The design is built around:

- cream paper-like surfaces
- deep cabernet and dusty mauve accents
- dark backgrounds
- editorial typography
- rough borders and offset shadows
- handwritten-style notes
- weather doodles
- asymmetrical layouts

The goal was to make the interface feel like a small weather publication rather than a collection of UI cards.

## What I learned

This project was mainly an exercise in putting several pieces together into one working application.

Some of the things I worked with were:

- building a Next.js application from scratch
- working with external REST APIs
- converting city names into coordinates
- using browser geolocation
- reverse geocoding coordinates
- handling asynchronous API requests
- integrating MapLibre into Next.js
- dealing with a web worker setup for MapLibre
- storing data in localStorage
- making a responsive interface
- deploying a project through GitHub and Vercel

## Limitations

SKYTXT is a small project rather than a production weather service.

Weather data depends on the availability of the external APIs, and browser location depends on the user allowing location access.

The project is also intentionally kept simple. There is no user account system or backend database; recent cities are stored locally in the browser.

## Deployment

The project is deployed on Vercel and connected to the GitHub repository.

Every push to the main branch can trigger a new deployment.

## License

This project is mainly a personal portfolio and learning project.