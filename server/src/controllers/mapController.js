import { getMapData } from '../services/mapService.js';

export const getMapLocations = async (req, res) => {
  try {
    const { lat, lng, hostel } = req.query;
    const studentHostel = hostel || req.user?.hostel || '';
    const data = await getMapData(lat, lng, studentHostel);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching map locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving campus map locations',
      error: error.message,
    });
  }
};

export const getNearestDropoff = async (req, res) => {
  try {
    const { lat, lng, hostel } = req.query;
    const studentHostel = hostel || req.user?.hostel || '';
    const data = await getMapData(lat, lng, studentHostel);
    return res.status(200).json({
      success: true,
      referenceLocation: data.referenceLocation,
      nearestDropoffPoint: data.nearestDropoffPoint,
      walkingDirections: `Head towards ${data.nearestDropoffPoint.locationDesc}. Approximately ${data.nearestDropoffPoint.distanceMeters} meters away (${data.nearestDropoffPoint.estimatedWalkingMinutes} min walk).`,
    });
  } catch (error) {
    console.error('Error computing nearest drop-off:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error computing nearest drop-off point',
      error: error.message,
    });
  }
};
