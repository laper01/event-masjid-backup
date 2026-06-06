"use client";

import { useEffect, useRef, useState } from "react";

interface EventLocationMapProps {
  address: string;
  locationName?: string;
  onCoordinatesFound?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

interface Coords {
  lat: number;
  lng: number;
}

/* ── Free geocoding via Nominatim (OpenStreetMap) ── */
async function geocodeAddress(address: string): Promise<Coords | null> {
  if (!address || address.trim().length < 3) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address.trim())}&format=json&limit=1`,
      { headers: { "User-Agent": "EventsMasjidsIO/1.0", "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { return null; }
}

/* ── Reverse geocode coords → address string ── */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "EventsMasjidsIO/1.0", "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name ?? null;
  } catch { return null; }
}

export function EventLocationMap({
  address,
  locationName,
  onCoordinatesFound,
  onAddressChange,
}: EventLocationMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInst     = useRef<unknown>(null);
  const markerInst  = useRef<unknown>(null);

  const [coords, setCoords]   = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Inject Leaflet CSS once */
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id  = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    setMounted(true);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  /* ── Initialize map ── */
  useEffect(() => {
    if (!mounted || !mapRef.current || mapInst.current) return;

    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      // Fix webpack default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Default: ISNA Plainfield IN
      const defaultLat = 39.6773;
      const defaultLng = -86.3644;

      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      /* Custom brand-colored marker */
      const greenIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            position:relative;
            width:36px; height:36px;
            cursor:grab;
          ">
            <div style="
              width:36px; height:36px;
              background:#002d1f;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid #b3efd4;
              box-shadow:0 3px 10px rgba(0,45,31,0.4);
              display:flex; align-items:center; justify-content:center;
            ">
              <div style="
                width:12px; height:12px;
                background:#b3efd4;
                border-radius:50%;
                transform:rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      /* ── DRAGGABLE marker ── */
      const marker = L.marker([defaultLat, defaultLng], {
        icon: greenIcon,
        draggable: true,   // ← key change
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Manrope,sans-serif;font-size:12px;font-weight:600;color:#002d1f;">
            ${locationName || "Drag to set exact location"}
          </div>`,
          { closeButton: false }
        );

      /* ── On drag start — show hint ── */
      marker.on("dragstart", () => {
        setDragging(true);
        marker.closePopup();
      });

      /* ── On drag end — reverse geocode new position ── */
      marker.on("dragend", async () => {
        setDragging(false);
        const pos = marker.getLatLng();
        const newCoords = { lat: pos.lat, lng: pos.lng };
        setCoords(newCoords);
        onCoordinatesFound?.(pos.lat, pos.lng);

        // Reverse geocode to update address field
        if (onAddressChange) {
          setLoading(true);
          const newAddress = await reverseGeocode(pos.lat, pos.lng);
          setLoading(false);
          if (newAddress) {
            onAddressChange(newAddress);
            marker.bindPopup(
              `<div style="font-family:Manrope,sans-serif;font-size:11px;color:#002d1f;">
                <div style="font-weight:700;margin-bottom:2px;">${locationName || "Event location"}</div>
                <div style="color:#6f7973;font-size:10px;">${newAddress.split(",").slice(0, 3).join(", ")}</div>
              </div>`,
              { closeButton: false }
            ).openPopup();
          }
        }
      });

      /* ── Click on map to move marker ── */
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        onCoordinatesFound?.(lat, lng);

        // Reverse geocode on click
        if (onAddressChange) {
          setLoading(true);
          reverseGeocode(lat, lng).then((addr) => {
            setLoading(false);
            if (addr) {
              onAddressChange(addr);
              marker.bindPopup(
                `<div style="font-family:Manrope,sans-serif;font-size:11px;color:#002d1f;">
                  <div style="font-weight:700;margin-bottom:2px;">${locationName || "Event location"}</div>
                  <div style="color:#6f7973;font-size:10px;">${addr.split(",").slice(0, 3).join(", ")}</div>
                </div>`,
                { closeButton: false }
              ).openPopup();
            }
          });
        }
      });

      mapInst.current    = map;
      markerInst.current = marker;
    }

    init();

    return () => {
      cancelled = true;
      if (mapInst.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInst.current as any).remove();
        mapInst.current   = null;
        markerInst.current = null;
      }
    };
  }, [mounted]);

  /* ── Forward geocode when address prop changes ── */
  useEffect(() => {
    if (!address || address.trim().length < 5) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);

      const found = await geocodeAddress(address);
      setLoading(false);

      if (!found) { setError(true); return; }

      setCoords(found);
      onCoordinatesFound?.(found.lat, found.lng);
      setError(false);

      if (mapInst.current && markerInst.current) {
        const L = (await import("leaflet")).default;
        const map    = mapInst.current as ReturnType<typeof L.map>;
        const marker = markerInst.current as ReturnType<typeof L.marker>;

        map.flyTo([found.lat, found.lng], 15, { duration: 1 });
        marker.setLatLng([found.lat, found.lng]);
        marker.bindPopup(
          `<div style="font-family:Manrope,sans-serif;font-size:11px;color:#002d1f;">
            <div style="font-weight:700;margin-bottom:2px;">${locationName || "Event location"}</div>
            <div style="color:#6f7973;font-size:10px;">${address.split(",").slice(0, 3).join(", ")}</div>
          </div>`,
          { closeButton: false }
        ).openPopup();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [address]);

  /* ── Loading state before hydration ── */
  if (!mounted) {
    return (
      <div className="h-44 w-full bg-surface-container-high rounded-xl flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-outline/10 shadow-sm">
      {/* The actual map */}
      <div ref={mapRef} className="h-44 w-full" />

      {/* Drag hint tooltip — shown on first render */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
        <div className={`flex items-center gap-1.5 bg-on-surface/80 backdrop-blur-sm text-surface text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md transition-opacity duration-300 ${coords ? "opacity-0" : "opacity-100"}`}>
          <span className="material-symbols-outlined text-[14px]">open_with</span>
          Drag pin or click map to set location
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-outline/10">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-[12px] font-semibold text-on-surface">
              {dragging ? "Updating location..." : "Finding location..."}
            </span>
          </div>
        </div>
      )}

      {/* Error badge */}
      {error && !loading && (
        <div className="absolute bottom-8 left-2 right-2 z-[999]">
          <div className="flex items-center gap-2 bg-error-container/95 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <span className="material-symbols-outlined text-error text-[14px]">location_off</span>
            <span className="text-[11px] font-semibold text-on-error-container">
              Location not found — try a different address or drag the pin manually.
            </span>
          </div>
        </div>
      )}

      {/* Coordinates badge */}
      {coords && !loading && (
        <div className="absolute bottom-6 right-2 z-[999]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-outline/10">
            <p className="text-[9px] font-bold text-outline font-mono">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventLocationMap;