import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiSearch, FiMap } = FiIcons;

const LocationMap = ({ location, onLocationUpdate }) => {
  const [showMap, setShowMap] = useState(false);
  const [searchAddress, setSearchAddress] = useState(location.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    if (showMap && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [showMap]);

  const initializeMap = async () => {
    try {
      // Load Google Maps API
      const { Loader } = await import('@googlemaps/js-api-loader');
      
      const loader = new Loader({
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your actual API key
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      // Initialize map
      const defaultCenter = location.coordinates || { lat: 40.7128, lng: -74.0060 }; // NYC default
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 15,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{"color": "#242f3e"}]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#242f3e"}]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#746855"}]
          }
        ]
      });

      // Add marker
      markerRef.current = new window.google.maps.Marker({
        position: defaultCenter,
        map: mapInstanceRef.current,
        draggable: true,
        title: location.name
      });

      // Handle marker drag
      markerRef.current.addListener('dragend', (e) => {
        const position = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        onLocationUpdate({ coordinates: position });
        reverseGeocode(position);
      });

      // Handle map click
      mapInstanceRef.current.addListener('click', (e) => {
        const position = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        markerRef.current.setPosition(position);
        onLocationUpdate({ coordinates: position });
        reverseGeocode(position);
      });

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      // Fallback to a simple map placeholder
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-800 rounded-lg">
            <div class="text-center text-gray-400">
              <div class="text-4xl mb-2">🗺️</div>
              <p>Map unavailable</p>
              <p class="text-sm">Please add Google Maps API key</p>
            </div>
          </div>
        `;
      }
    }
  };

  const reverseGeocode = async (position) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: position });
      
      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSearchAddress(address);
        onLocationUpdate({ address });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    
    setIsLoading(true);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ address: searchAddress });
      
      if (response.results[0]) {
        const position = {
          lat: response.results[0].geometry.location.lat(),
          lng: response.results[0].geometry.location.lng()
        };
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(position);
          markerRef.current.setPosition(position);
        }
        
        onLocationUpdate({ 
          coordinates: position, 
          address: response.results[0].formatted_address 
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <motion.button
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowMap(!showMap)}
        >
          <SafeIcon icon={FiMap} className="text-blue-400" />
          <span className="text-blue-400 text-sm">
            {showMap ? 'Hide Map' : 'Show Map'}
          </span>
        </motion.button>
        
        {location.coordinates && (
          <div className="flex items-center space-x-1 text-green-400 text-sm">
            <SafeIcon icon={FiMapPin} />
            <span>Located</span>
          </div>
        )}
      </div>

      {showMap && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search for an address..."
            />
            <motion.button
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              onClick={searchLocation}
              disabled={isLoading}
            >
              <SafeIcon icon={FiSearch} className="text-purple-400" />
            </motion.button>
          </div>

          <div
            ref={mapRef}
            className="w-full h-64 rounded-lg overflow-hidden border border-white/10"
            style={{ minHeight: '256px' }}
          >
            {/* Map will be initialized here */}
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>• Click on the map to set location</p>
            <p>• Drag the marker to adjust position</p>
            <p>• Search for addresses using the search box</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LocationMap;