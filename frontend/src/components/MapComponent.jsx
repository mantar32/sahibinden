import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks for location selection
const LocationMarker = ({ onLocationSelect, position }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return position ? <Marker position={position} /> : null;
};

// Component to recenter map when position changes (View Mode)
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 15);
        }
    }, [position, map]);
    return null;
};

const MapComponent = ({ position, onLocationSelect, readOnly = false }) => {
    // Default center (Ankara) if no position provided
    const defaultCenter = [39.9334, 32.8597];
    const center = position || defaultCenter;

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '300px', borderRadius: '12px', overflow: 'hidden', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={!readOnly}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {readOnly ? (
                    <>
                        {position && <Marker position={position} />}
                        {position && <RecenterMap position={position} />}
                    </>
                ) : (
                    <LocationMarker
                        onLocationSelect={onLocationSelect}
                        position={position}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
