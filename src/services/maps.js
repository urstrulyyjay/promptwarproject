// src/services/maps.js
// Google Maps Service — graceful fallback to static SVG map
// NO top-level await

import { CONFIG } from '../config.js';

let map = null;

const isMapsConfigured = CONFIG.GOOGLE_MAPS_API_KEY &&
    CONFIG.GOOGLE_MAPS_API_KEY !== "" &&
    CONFIG.GOOGLE_MAPS_API_KEY !== "your_maps_api_key_here";

export const initGoogleMap = async (containerId) => {
    if (!isMapsConfigured) {
        console.log("Maps: Not configured — using static SVG fallback.");
        return;
    }

    try {
        const { Loader } = await import('https://esm.sh/@googlemaps/js-api-loader@1.16.6');

        const loader = new Loader({
            apiKey: CONFIG.GOOGLE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["visualization"]
        });

        const { Map } = await loader.importLibrary("maps");
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        map = new Map(container, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 18,
            mapId: 'DEMO_MAP_ID',
            disableDefaultUI: true
        });

        const { HeatmapLayer } = await loader.importLibrary("visualization");
        const heatmapData = [
            new google.maps.LatLng(37.7749, -122.4194),
            new google.maps.LatLng(37.7750, -122.4192),
            new google.maps.LatLng(37.7748, -122.4195),
            new google.maps.LatLng(37.7747, -122.4193),
        ];

        new HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 40
        });

    } catch (e) {
        console.error("Google Maps Initialization Error:", e);
    }
};
