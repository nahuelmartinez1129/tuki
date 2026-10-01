"use client";

import {
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";


export type PuntoPoligono = {
  lat: number;
  lng: number;
};

type MapaZonasEnvioProps = {
  puntos: PuntoPoligono[];
  onChange: (puntos: PuntoPoligono[]) => void;
};

const POSICION_TUKI: [number, number] = [
  -38.2630868,
  -57.8463145,
];

function CrearPuntos({
  puntos,
  onChange,
}: {
  puntos: PuntoPoligono[];
  onChange: (puntos: PuntoPoligono[]) => void;
}) {
  useMapEvents({
    click(event) {
      const nuevoPunto: PuntoPoligono = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      };

      onChange([...puntos, nuevoPunto]);
    },
  });

  return null;
}

const iconoTuki = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      background: #1BA091;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
    ">
      T
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function MapaZonasEnvio({
  puntos,
  onChange,
}: MapaZonasEnvioProps) {
  function deshacerUltimo() {
    if (puntos.length === 0) return;

    onChange(puntos.slice(0, -1));
  }

  function limpiar() {
    onChange([]);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={POSICION_TUKI}
          zoom={19}
          scrollWheelZoom={true}
          className="h-[500px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CrearPuntos
            puntos={puntos}
            onChange={onChange}
          />

          <Marker
            position={POSICION_TUKI}
            icon={iconoTuki}
          />

          {puntos.length >= 3 && (
            <Polygon
              positions={puntos.map((punto) => [
                punto.lat,
                punto.lng,
              ])}
              pathOptions={{
                color: "#C6DB00",
                fillColor: "#C6DB00",
                fillOpacity: 0.25,
                weight: 3,
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={deshacerUltimo}
          disabled={puntos.length === 0}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-tuki-cream transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↩ Deshacer último punto
        </button>

        <button
          type="button"
          onClick={limpiar}
          disabled={puntos.length === 0}
          className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🗑 Limpiar zona
        </button>

        <span className="text-sm text-tuki-cream/50">
          {puntos.length === 0
            ? "Hacé clic en el mapa para comenzar."
            : `${puntos.length} punto${
                puntos.length === 1 ? "" : "s"
              } seleccionado${
                puntos.length === 1 ? "" : "s"
              }.`}
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-tuki-cream">
          📍 Cómo dibujar la zona
        </p>

        <p className="mt-1 text-sm leading-6 text-tuki-cream/50">
          Hacé clic sobre el mapa siguiendo el límite de
          la zona de reparto. Necesitás al menos 3 puntos
          para formar una zona.
        </p>
      </div>
    </div>
  );
}