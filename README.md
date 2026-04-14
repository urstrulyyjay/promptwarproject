
## Vision
StadiumFlow is an advanced, mobile-first concept application designed to revolutionize the live event experience. By combining real-time crowd data, AI-driven recommendations, and sleek, premium glassmorphism aesthetics, the system optimizes attendee flow and radically reduces wait times within massive sporting venues and arenas.

Our goal is simple: **Eliminate the friction of crowds.**

## Features & Interfaces

The application features a dual-sided architecture, allowing both fans and staff to interact with the same synchronized stadium brain.

### 1. Fan Experience (The User App)
* **AI Fast Entry Plan**: The system actively monitors gate traffic and dynamically recommends faster entry alternatives (e.g., routing a fan from a 25-minute wait at Gate A to a 2-minute wait at Gate C).
* **Smart Food Quick-Check**: Instead of standing in line, fans can digitally check food wait times. If a preferred stall is congested, the “Brain” automatically recommends the fastest alternative stall nearby.
* **Live Dynamic Routing**: A visual routing engine that reroutes attendees away from congested zones in real-time, visualizing the new path directly on a stadium map.
* **Digital Lines**: Allows fans to wait anywhere instead of physically standing in lines for concessions.

### 2. Staff Command Center (The Admin App)
* **Live Zone Density**: Operational dashboard to monitor crowd percentages across various concourses and merchandise areas.
* **Gate Management**: Staff can forcefully open or close gates as needed to direct flow. These actions instantly communicate with the recommendation engine to stop sending fans to closed gates.
* **Activity & Emergency Logs**: Complete live activity feed tracking system changes and the ability to trigger global evacuation routes or broadcast alerts to all active fans.

## Technical Architecture & Workflow

* **Vanilla Structure**: Built purely with lightweight HTML, CSS, and localized JavaScript to maximize performance.
* **The "Brain" (`data.js`)**: An intelligent abstraction layer that manages stadium state. It houses logic that compares queue times and crowd densities to output live routing overrides and food stall recommendations.
* **Live Simulation Engine**: To demonstrate its capabilities, the application runs a background interval (`simulateLiveUpdates`) that mathematically jitters queue times, zone crowds, and wait times every 3 seconds, proving that the front-end dynamically reacts to shifting environments.
* **Aesthetic System**: Engineered with a unified glassmorphism design language using custom CSS tokens (`styles.css`), rendering a dark-mode, neon-accented premium UI without reliance on heavy frameworks.

## Quick Start
To view the prototype locally:
1. Clone the repository to your local machine.
2. Start a standard HTTP server in the root directory (e.g., `python3 -m http.server 8000`).
3. Navigate to `http://localhost:8000` in your browser.
4. Select whether to enter as a **Fan** or **Staff** to explore the respective interfaces.




## 👨‍💻 Author

Jay Dhokne
IT Student | Developer | Creative Technologist

GitHub: https://github.com/urstrulyyjay





##⭐ Show Support

If you like this project, give it a ⭐ on GitHub.
