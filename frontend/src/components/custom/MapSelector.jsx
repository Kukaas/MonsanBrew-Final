import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';
import { toast } from 'sonner';
import PropTypes from 'prop-types';

export default function MapSelector({
  onLocationSelect,
  initialLatitude = 13.323830,
  initialLongitude = 121.845809,
  className = ""
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        // Check if mapbox-gl is already loaded
        if (window.mapboxgl) {
          initializeMap();
          return;
        }

        // Load CSS
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.onload = () => {
          window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
          initializeMap();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Mapbox:', error);
        toast.error('Failed to load map');
      }
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl) return;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLongitude, initialLatitude],
      zoom: 15
    });

    // Add navigation controls
    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

    // Add marker for selected location
    marker.current = new window.mapboxgl.Marker({
      color: '#FFC107',
      draggable: true
    })
    .setLngLat([initialLongitude, initialLatitude])
    .addTo(map.current);

    // Handle map click
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      updateMarker(lng, lat);
    });

    // Handle marker drag end
    marker.current.on('dragend', () => {
      const { lng, lat } = marker.current.getLngLat();
      updateMarker(lng, lat);
    });

    // Set initial location
    updateMarker(initialLongitude, initialLatitude);
  };

  const updateMarker = async (lng, lat) => {
    if (!marker.current) return;

    marker.current.setLngLat([lng, lat]);
    setSelectedLocation({ longitude: lng, latitude: lat });

    // Get address from coordinates (without loading state to prevent flickering)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_API_KEY}&country=PH&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0];
        setSelectedLocation(prev => ({
          ...prev,
          address: address.place_name,
          context: address.context
        }));
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarker(longitude, latitude);
        if (map.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
        }
        toast.success('Location updated to current position');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get current location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleConfirmLocation = () => {
    onLocationSelect(selectedLocation);
    toast.success('Location selected successfully');
  };

  const handleClearLocation = () => {
    setSelectedLocation({
      latitude: initialLatitude,
      longitude: initialLongitude
    });
    if (marker.current) {
      marker.current.setLngLat([initialLongitude, initialLatitude]);
    }
    if (map.current) {
      map.current.flyTo({ center: [initialLongitude, initialLatitude], zoom: 15 });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-64 rounded-lg border-2 border-gray-300 relative"
        style={{ minHeight: '256px' }}
      />

      {/* Location Info */}
      {selectedLocation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#FFC107] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Selected Location
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {selectedLocation.address || 'Address loading...'}
              </div>
              <div className="text-xs text-gray-500">
                Coordinates: {selectedLocation.latitude?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>
        <Button
          variant="yellow"
          size="sm"
          onClick={handleConfirmLocation}
          disabled={isLoading}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Confirm Location
        </Button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC107] mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
}

MapSelector.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
  initialLatitude: PropTypes.number,
  initialLongitude: PropTypes.number,
  className: PropTypes.string
};
