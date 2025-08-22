import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import { toast } from 'sonner';
import PropTypes from 'prop-types';

export default function DeliveryNavigation({
  deliveryAddress,
  deliveryCoordinates,
  restaurantCoordinates = { latitude: 13.323830, longitude: 121.845809 },
  className = ""
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadMapbox = async () => {
      try {
        if (window.mapboxgl) {
          initializeMap();
          return;
        }

        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

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
  }, [deliveryCoordinates]);

  const initializeMap = () => {
    if (!mapContainer.current || !window.mapboxgl || !deliveryCoordinates) return;

    map.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [deliveryCoordinates.longitude, deliveryCoordinates.latitude],
      zoom: 12
    });

    map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

    // Wait for the map style to load before adding markers and route
    map.current.on('style.load', () => {

      // Add restaurant marker (starting point)
      new window.mapboxgl.Marker({ color: '#FF6B6B' })
        .setLngLat([restaurantCoordinates.longitude, restaurantCoordinates.latitude])
        .setPopup(new window.mapboxgl.Popup().setHTML('<div class="text-center"><strong>Starting Point</strong><br/>MonsanBrew</div>'))
        .addTo(map.current);

      // Add delivery location marker (destination)
      new window.mapboxgl.Marker({ color: '#4ECDC4' })
        .setLngLat([deliveryCoordinates.longitude, deliveryCoordinates.latitude])
        .setPopup(new window.mapboxgl.Popup().setHTML('<div class="text-center"><strong>Delivery Location</strong><br/>Customer Address</div>'))
        .addTo(map.current);

      // Load and display route after a short delay to ensure markers are added
      setTimeout(() => {
        loadRoute();
      }, 500);
    });
  };

  const loadRoute = async () => {
    if (!deliveryCoordinates || !map.current) return;

    try {
      setIsLoading(true);
      const start = `${restaurantCoordinates.longitude},${restaurantCoordinates.latitude}`;
      const end = `${deliveryCoordinates.longitude},${deliveryCoordinates.latitude}`;

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?access_token=${import.meta.env.VITE_MAPBOX_API_KEY}&geometries=geojson&overview=full&steps=true`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route);

        // Wait for map to be fully loaded before adding route
        const addRouteToMap = () => {
          if (!map.current || !map.current.isStyleLoaded()) {
            setTimeout(addRouteToMap, 100);
            return;
          }

          // Remove existing route if it exists
          if (map.current.getLayer('route')) {
            map.current.removeLayer('route');
          }
          if (map.current.getSource('route')) {
            map.current.removeSource('route');
          }

          // Add route source
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          // Add route layer
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#FFC107',
              'line-width': 6,
              'line-opacity': 0.9
            }
          });

          // Fit map to route bounds
          const bounds = new window.mapboxgl.LngLatBounds();
          bounds.extend([restaurantCoordinates.longitude, restaurantCoordinates.latitude]);
          bounds.extend([deliveryCoordinates.longitude, deliveryCoordinates.latitude]);
          map.current.fitBounds(bounds, { padding: 50 });
        };

        addRouteToMap();
      } else {
        console.error('No routes found in response');
        toast.error('No route found between locations');
      }
    } catch (error) {
      console.error('Failed to load route:', error);
      toast.error('Failed to load route');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters) => {
    const km = meters / 1000;
    if (km >= 1) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#FFC107]" />
            <CardTitle className="text-lg">Delivery Route</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Delivery Address */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-[#FFC107] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">
                Delivery Address
              </div>
              <div className="text-sm text-gray-600">
                {deliveryAddress || 'Address not available'}
              </div>
            </div>
          </div>

          {/* Route Information */}
          {routeData && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-sm font-medium text-blue-900">
                    {formatDuration(routeData.duration)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Distance</div>
                  <div className="text-sm font-medium text-blue-900">
                    {formatDistance(routeData.distance)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="mt-4">
            <div
              ref={mapContainer}
              className="w-full h-64 rounded-lg border-2 border-gray-300 relative"
              style={{ minHeight: '256px' }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC107] mx-auto mb-2"></div>
                  <div className="text-sm text-gray-600">Loading route...</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

DeliveryNavigation.propTypes = {
  deliveryAddress: PropTypes.string,
  deliveryCoordinates: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }),
  restaurantCoordinates: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  className: PropTypes.string
};
