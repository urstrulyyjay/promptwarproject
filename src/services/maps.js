// src/services/maps.js
import { Loader } from 'https://esm.sh/@googlemaps/js-api-loader@1.16.6';
import { CONFIG } from '../config.js';

let map = null;

export const initGoogleMap = async (containerId) => {
    if (CONFIG.GOOGLE_MAPS_API_KEY === "your_maps_api_key_here") {
        console.warn("Google Maps not configured. Using static fallback.");
        return; // Stick to the static CSS SVG map layout
    }

    const loader = new Loader({
        apiKey: CONFIG.GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["visualization"]
    });

    try {
        const { Map } = await loader.importLibrary("maps");
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Clear SVG fallback

        map = new Map(container, {
            center: { lat: 37.7749, lng: -122.4194 }, // Center of stadium
            zoom: 18,
            mapId: 'DEMO_MAP_ID', // Replace with real map ID for advanced styling
            disableDefaultUI: true
        });

        // Add a mock heat map for representation of crowd
        const { HeatmapLayer } = await loader.importLibrary("visualization");
        const heatmapData = [
            new google.maps.LatLng(37.7749, -122.4194),
            new google.maps.LatLng(37.7750, -122.4192),
            new google.maps.LatLng(37.7748, -122.4195),
            new google.maps.LatLng(37.7747, -122.4193),
        ];

        const heatmap = new HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 40
        });

    } catch (e) {
        console.error("Google Maps Initialization Error:", e);
    }
};
