import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shield, AlertTriangle, MapPin, Navigation, Plus, X, Save } from 'lucide-react';
import { useMapData } from '../../../context/MapContext';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const riskIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const safeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Component to handle clicks on map
function MapClickHandler({ onMapClick, isAddMode }: { onMapClick: (lat: number, lng: number) => void, isAddMode: boolean }) {
    useMapEvents({
        click: (e) => {
            if (isAddMode) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

function LocationMarker() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        const fetchLocation = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const permStatus = await Geolocation.checkPermissions();
                    if (permStatus.location !== 'granted') {
                        const reqStatus = await Geolocation.requestPermissions();
                        if (reqStatus.location !== 'granted') {
                            console.warn('Geolocation permission denied');
                            return;
                        }
                    }
                    const coordinates = await Geolocation.getCurrentPosition();
                    const latlng = L.latLng(coordinates.coords.latitude, coordinates.coords.longitude);
                    setPosition(latlng);
                    map.flyTo(latlng, map.getZoom());
                } catch (e) {
                    console.error('Error getting location native:', e);
                }
            } else {
                map.locate().on("locationfound", function (e) {
                    setPosition(e.latlng);
                    map.flyTo(e.latlng, map.getZoom());
                });
            }
        };

        fetchLocation();
    }, [map]);

    return position === null ? null : (
        <Marker position={position} icon={userIcon}>
            <Popup>Ets aquí</Popup>
        </Marker>
    );
}

export default function SafetyMap({ onBack }: { onBack: () => void }) {
    const { locations, addLocation } = useMapData();
    const [showRisks, setShowRisks] = useState(false);
    const [showSafe, setShowSafe] = useState(true);
    const [center] = useState<[number, number]>([41.3851, 2.1734]); // Barcelona

    // Add Mode State
    const [isAddMode, setIsAddMode] = useState(false);
    const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [newLocationForm, setNewLocationForm] = useState({ name: '', type: 'safe', category: '', description: '' });

    const filteredLocations = locations.filter(loc => {
        if (loc.type === 'risk' && !showRisks) return false;
        if (loc.type === 'safe' && !showSafe) return false;
        return true;
    });

    const handleMapClick = (lat: number, lng: number) => {
        setNewLocationCoords({ lat, lng });
    };

    const handleSaveLocation = () => {
        if (!newLocationCoords || !newLocationForm.name) return;

        addLocation({
            name: newLocationForm.name,
            type: newLocationForm.type as 'risk' | 'safe',
            category: newLocationForm.category || 'Personalitzat',
            description: newLocationForm.description,
            lat: newLocationCoords.lat,
            lng: newLocationCoords.lng
        });


        // Reset
        setNewLocationCoords(null);
        setIsAddMode(false);
        setNewLocationForm({ name: '', type: 'safe', category: '', description: '' });
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 relative" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-10 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <Navigation className="w-5 h-5 text-slate-600 rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="text-brand-500" /> Mapa de Seguretat
                        </h1>
                        <p className="text-xs text-slate-500">Planifica la teva ruta segura</p>
                    </div>
                </div>

                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setIsAddMode(!isAddMode)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${isAddMode
                            ? 'bg-brand-600 text-white shadow-lg scale-105'
                            : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                            }`}
                    >
                        {isAddMode ? <X size={16} /> : <Plus size={16} />}
                        {isAddMode ? 'Cancel·lar' : 'Afegir Lloc'}
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <button
                        onClick={() => setShowSafe(!showSafe)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${showSafe
                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        <Shield size={16} />
                        Recursos
                    </button>
                    <button
                        onClick={() => setShowRisks(!showRisks)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${showRisks
                            ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        <AlertTriangle size={16} />
                        Riscos
                    </button>
                </div>
            </div>

            {/* Instruction Banner if Add Mode */}
            {isAddMode && !newLocationCoords && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[450] bg-brand-600 text-white px-6 py-2 rounded-full shadow-xl font-bold animate-bounce">
                    Fes clic al mapa per marcar la ubicació 👇
                </div>
            )}

            {/* Add Location Modal/Form Overlay */}
            {newLocationCoords && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 w-96 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Nou Lloc</h3>
                        <button onClick={() => setNewLocationCoords(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nom del lloc</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Ex: El meu parc preferit"
                                value={newLocationForm.name}
                                onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tipus</label>
                                <select
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    value={newLocationForm.type}
                                    onChange={(e) => setNewLocationForm({ ...newLocationForm, type: e.target.value })}
                                >
                                    <option value="safe">Recurs Segur (Verd)</option>
                                    <option value="risk">Zona de Risc (Vermell)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    placeholder="Ex: Parc, Bar..."
                                    value={newLocationForm.category}
                                    onChange={(e) => setNewLocationForm({ ...newLocationForm, category: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Descripció</label>
                            <textarea
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm h-20 resize-none"
                                placeholder="Per què és rellevant aquest lloc?"
                                value={newLocationForm.description}
                                onChange={(e) => setNewLocationForm({ ...newLocationForm, description: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            onClick={handleSaveLocation}
                            disabled={!newLocationForm.name}
                            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Guardar Ubicació
                        </button>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="flex-1 relative z-0 h-full w-full bg-slate-200">
                {!center && <div className="p-10 text-center text-slate-500">Initializing Map...</div>}
                <MapContainer key="safetymap-full" center={center} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%', minHeight: '500px' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler onMapClick={handleMapClick} isAddMode={isAddMode} />
                    <LocationMarker />

                    {/* Temporary Marker for new location */}
                    {newLocationCoords && (
                        <Marker position={[newLocationCoords.lat, newLocationCoords.lng]} opacity={0.6}>
                            <Popup>Nova ubicació...</Popup>
                        </Marker>
                    )}

                    {filteredLocations.map(loc => (
                        <Marker
                            key={loc.id}
                            position={[loc.lat, loc.lng]}
                            icon={loc.type === 'risk' ? riskIcon : safeIcon}
                        >
                            <Popup>
                                <div className="p-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block ${loc.type === 'risk' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {loc.category}
                                    </span>
                                    <h3 className="font-bold text-slate-900 m-0 text-base">{loc.name}</h3>
                                    <p className="text-slate-500 text-sm mt-1">{loc.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Legend / Info Overlay */}
                <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg z-[400] max-w-xs border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-2 text-sm">Llegenda</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span>Recursos (Biblioteques, Parcs, Gimnàs)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <span>Riscos (Joc, Alcohol)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>La teva ubicació</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
