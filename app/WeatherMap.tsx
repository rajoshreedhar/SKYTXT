"use client";

import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

type WeatherMapProps = {
  latitude: number;
  longitude: number;
  city: string;
};

export default function WeatherMap({
  latitude,
  longitude,
  city,
}: WeatherMapProps) {
  return (
    <div className="relative overflow-hidden border border-[#A68B91]/40 bg-[#F3ECE0] shadow-[10px_10px_0_#6B2938]">
      <div className="absolute left-4 top-4 z-10 border border-[#4A1521] bg-[#F3ECE0] px-3 py-2 shadow-[4px_4px_0_#4A1521]">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#6B2938]">
          SKYTXT / LOCATION
        </p>
        <p className="font-serif text-lg font-black text-[#121214]">
          {city}
        </p>
      </div>

      <Map
        initialViewState={{
          latitude,
          longitude,
          zoom: 10,
        }}
        longitude={longitude}
        latitude={latitude}
        zoom={10}
        style={{
          width: "100%",
          height: "420px",
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <NavigationControl position="bottom-right" />

        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
        >
          <div className="relative">
            <div className="absolute -inset-3 animate-ping rounded-full bg-[#C58F9B]/40" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#F3ECE0] bg-[#4A1521] text-2xl shadow-[4px_4px_0_#121214]">
              ☁
            </div>
          </div>
        </Marker>
      </Map>
    </div>
  );
}