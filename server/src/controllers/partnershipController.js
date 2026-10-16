import {
  getCityHotspots,
  getAggregatedCampusEwasteData,
  getAllPartners,
  registerNewPartner,
  getAllBulkPickups,
  createBulkPickupRequest,
  updateBulkPickupStatus,
} from '../services/partnershipService.js';

export const getHotspots = async (req, res) => {
  try {
    const data = await getCityHotspots(req.query.city);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching city hotspots:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAggregatedData = async (req, res) => {
  try {
    const data = await getAggregatedCampusEwasteData();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching aggregated campus data:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartners = async (req, res) => {
  try {
    const data = await getAllPartners(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerPartner = async (req, res) => {
  try {
    const data = await registerNewPartner(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error registering partner:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getBulkPickups = async (req, res) => {
  try {
    const data = await getAllBulkPickups(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching bulk pickups:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBulkPickup = async (req, res) => {
  try {
    const data = await createBulkPickupRequest(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating bulk pickup:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBulkPickup = async (req, res) => {
  try {
    const data = await updateBulkPickupStatus(req.params.id, req.body.status, req.body.notes);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating bulk pickup:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
