import type { MapRef } from '@vis.gl/react-maplibre';
import { Map as MapLibre, Marker, NavigationControl, Popup } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import type { Program } from '~/schemas/programs';

type LocationItem = Program['locations'][number];

interface ProgramMapProps {
  locations: Program['locations'];
}

export default function ProgramMap({ locations }: ProgramMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [hoveredLocation, setHoveredLocation] = useState<LocationItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const hasFittedBounds = useRef(false);
  const prevLocationsRef = useRef<Program['locations']>(locations);

  const theme =
    document.getElementsByTagName('html')?.[0]?.getAttribute('data-fr-theme') === 'dark'
      ? 'dark'
      : 'sunny';
  const API_KEY = '5V4ER9yrsLxoHQrAGQuYNu4yWqXNqKAM6iaX5D1LGpRNTBxvQL3enWXpxMQqTrY8';
  const mapStyle = `https://api.jawg.io/styles/jawg-${theme}.json?access-token=${API_KEY}`;

  // Memoize valid locations to prevent recalculation on every render
  const validLocations = useMemo(
    () =>
      locations.filter(
        (loc): loc is LocationItem & { geo: { coordinates: [number, number] } } =>
          loc.geo !== undefined &&
          loc.geo.coordinates !== undefined &&
          loc.geo.coordinates.length === 2,
      ),
    [locations],
  );

  // Calculate initial view state based on locations
  const initialViewState = useMemo(() => {
    if (validLocations.length === 0) {
      // Default to France center
      return {
        longitude: 2.3522,
        latitude: 46.6034,
        zoom: 5,
      };
    }

    if (validLocations.length === 1) {
      const firstLocation = validLocations[0];
      if (!firstLocation) {
        return {
          longitude: 2.3522,
          latitude: 46.6034,
          zoom: 5,
        };
      }
      return {
        longitude: firstLocation.geo.coordinates[0],
        latitude: firstLocation.geo.coordinates[1],
        zoom: 12,
      };
    }

    // Multiple locations: calculate center and approximate zoom
    const lngs = validLocations.map((loc) => loc.geo.coordinates[0]);
    const lats = validLocations.map((loc) => loc.geo.coordinates[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Approximate zoom level based on bounds span
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;
    const maxSpan = Math.max(lngSpan, latSpan);

    let zoom = 5;
    if (maxSpan < 0.01) zoom = 14;
    else if (maxSpan < 0.05) zoom = 12;
    else if (maxSpan < 0.1) zoom = 11;
    else if (maxSpan < 0.5) zoom = 9;
    else if (maxSpan < 1) zoom = 8;
    else if (maxSpan < 2) zoom = 7;
    else if (maxSpan < 5) zoom = 6;

    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom,
    };
  }, [validLocations]);

  // Reset the fitted bounds flag when locations actually change
  useEffect(() => {
    if (prevLocationsRef.current !== locations) {
      hasFittedBounds.current = false;
      prevLocationsRef.current = locations;
    }
  }, [locations]);

  // Fit bounds after map loads for more precise fitting
  useEffect(() => {
    if (!mapRef.current || validLocations.length <= 1 || hasFittedBounds.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // Wait for map to be loaded
    const fitBoundsOnLoad = () => {
      if (hasFittedBounds.current) return;
      hasFittedBounds.current = true;

      const lngs = validLocations.map((loc) => loc.geo.coordinates[0]);
      const lats = validLocations.map((loc) => loc.geo.coordinates[1]);

      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];

      map.fitBounds(bounds, {
        padding: 50,
        duration: 500,
      });
    };

    if (map.loaded()) {
      fitBoundsOnLoad();
    } else {
      map.once('load', fitBoundsOnLoad);
    }
  }, [validLocations]);

  if (validLocations.length === 0) {
    return (
      <div className="formation-map-empty">
        <span className="fr-icon-map-pin-2-line" aria-hidden="true"></span>
        <p className="fr-text--sm fr-mb-0">Aucune localisation disponible</p>
      </div>
    );
  }

  return (
    <MapLibre
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      attributionControl={false}
    >
      <NavigationControl position="top-right" />

      {validLocations.map((location) => {
        const isSite = location.types.includes('site');
        const isHovered = hoveredLocation?.id === location.id;

        return (
          <Marker
            key={location.id}
            longitude={location.geo.coordinates[0]}
            latitude={location.geo.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <span
              className={`${isSite ? 'fr-icon-map-pin-user-fill' : 'fr-icon-map-pin-2-fill'} fr-icon--lg formation-map-pin`}
              style={{
                color: isSite
                  ? 'var(--background-action-high-green-emeraude)'
                  : 'var(--background-action-high-blue-france)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: isHovered ? 'scale(1.3)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredLocation(location)}
              onMouseLeave={() => setHoveredLocation(null)}
              aria-hidden="true"
            ></span>
          </Marker>
        );
      })}

      {hoveredLocation?.geo?.coordinates && hoveredLocation.geo.coordinates.length === 2 && (
        <Popup
          longitude={hoveredLocation.geo.coordinates[0] as number}
          latitude={hoveredLocation.geo.coordinates[1] as number}
          closeButton={false}
          closeOnClick={false}
          className="formation-map-tooltip"
        >
          <div className="">
            <h4 className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-mb-1v">
              {hoveredLocation.name}
            </h4>
            {hoveredLocation.uai && (
              <p className="fr-text--xs fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
                UAI: {hoveredLocation.uai}
              </p>
            )}
          </div>
        </Popup>
      )}

      {selectedLocation?.geo?.coordinates && selectedLocation.geo.coordinates.length === 2 && (
        <Popup
          longitude={selectedLocation.geo.coordinates[0] as number}
          latitude={selectedLocation.geo.coordinates[1] as number}
          onClose={() => setSelectedLocation(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="">
            <h4 className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-mb-1v">
              {selectedLocation.name}
            </h4>
            {selectedLocation.uai && (
              <p className="fr-text--xs fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
                UAI: {selectedLocation.uai}
              </p>
            )}
            {selectedLocation.address && (
              <p className="fr-text--xs fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
                {selectedLocation.address.street}
              </p>
            )}
          </div>
        </Popup>
      )}
    </MapLibre>
  );
}
