import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';

export default function NavigationButton({
  latitude,
  longitude,
  className = ""
}) {
  const openInMapbox = () => {
    if (!latitude || !longitude) return;

    const url = `https://www.mapbox.com/directions/driving/${longitude},${latitude}`;
    window.open(url, '_blank');
  };

  const openInWaze = () => {
    if (!latitude || !longitude) return;

    const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    window.open(url, '_blank');
  };

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={openInMapbox}
        className="flex-1"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Mapbox
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={openInWaze}
        className="flex-1"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Waze
      </Button>
    </div>
  );
}

NavigationButton.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  className: PropTypes.string
};
