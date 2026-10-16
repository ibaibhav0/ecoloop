import { ItemStore, UserStore, ApiKeyStore } from '../data/store.js';

/**
 * Public REST API: GET /api/stats/total
 * Returns real cumulative e-waste and carbon mitigation metrics from the active database.
 */
export const getTotalStats = async (req, res) => {
  try {
    const [items, students] = await Promise.all([
      ItemStore.findAll(),
      UserStore.getAllStudents(),
    ]);

    let totalWeightKg = 0;
    let verifiedRecycledKg = 0;
    const itemsByStatus = {
      registered: 0,
      scheduled: 0,
      collected: 0,
      handed_over: 0,
      verified_recycled: 0,
    };

    const typeMap = {};
    const hostelMap = {
      Nandani: { totalKg: 0, itemCount: 0 },
      Kaveri: { totalKg: 0, itemCount: 0 },
      Kumardhara: { totalKg: 0, itemCount: 0 },
      Saupernikha: { totalKg: 0, itemCount: 0 },
      Shambhavi: { totalKg: 0, itemCount: 0 },
      Netravati: { totalKg: 0, itemCount: 0 },
    };

    const distinctStudents = new Set();
    items.forEach((item) => {
      const weight = Number(item.actualWeight || item.approxWeight || 0);
      totalWeightKg += weight;

      if (item.userEmail || item.userId) {
        distinctStudents.add((item.userEmail || item.userId).toLowerCase());
      }

      if (item.status === 'verified_recycled') {
        verifiedRecycledKg += weight;
      }

      if (itemsByStatus[item.status] !== undefined) {
        itemsByStatus[item.status] += 1;
      }

      const t = item.type || 'Other Electronics';
      if (!typeMap[t]) {
        typeMap[t] = { type: t, count: 0, totalKg: 0 };
      }
      typeMap[t].count += 1;
      typeMap[t].totalKg += weight;

      const h = item.userHostel || 'Nandani';
      if (!hostelMap[h]) {
        hostelMap[h] = { totalKg: 0, itemCount: 0 };
      }
      hostelMap[h].totalKg += weight;
      hostelMap[h].itemCount += 1;
    });

    const itemsByType = Object.values(typeMap).map((t) => ({
      type: t.type,
      count: t.count,
      totalKg: Number(t.totalKg.toFixed(2)),
      sharePercent: totalWeightKg > 0 ? Number(((t.totalKg / totalWeightKg) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.totalKg - a.totalKg);

    const hostelRankings = Object.entries(hostelMap).map(([hostel, data]) => ({
      hostel,
      totalKg: Number(data.totalKg.toFixed(2)),
      itemCount: data.itemCount,
      co2eSavedKg: Number((data.totalKg * 1.44).toFixed(2)),
    })).sort((a, b) => b.totalKg - a.totalKg);

    const avoidedCo2eKg = Number((totalWeightKg * 1.44).toFixed(2));
    const treesEquivalent = Number((avoidedCo2eKg / 21.77).toFixed(2));

    return res.status(200).json({
      success: true,
      campus: 'NMAMIT Campus Circular Network (Nitte Deemed to be University)',
      region: 'Karkala / Udupi / Dakshina Kannada, Karnataka',
      totalItems: items.length,
      totalWeightKg: Number(totalWeightKg.toFixed(2)),
      verifiedRecycledKg: Number(verifiedRecycledKg.toFixed(2)),
      diversionRatePercent: totalWeightKg > 0 ? Number(((verifiedRecycledKg / totalWeightKg) * 100).toFixed(1)) : 0,
      avoidedCo2eKg,
      treesEquivalent,
      itemsByStatus,
      itemsByType,
      hostelRankings,
      participatingStudents: distinctStudents.size,
      environmentalBenchmark: {
        factor: '1.44 kg CO2e / kg e-waste recycled',
        citation: 'Global E-waste Monitor 2024 (UNITAR / ITU / UN)',
        sourceUrl: 'https://ewastemonitor.info',
        treeAbsorptionFactor: '21.77 kg CO2 / urban tree seedling / yr (US EPA)',
        epaUrl: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
      },
      authorizedRecycler: {
        name: 'Janavi Bairoliya',
        facility: 'CleanGreen Material Recovery & Dismantling LLP',
        cpcbRegistrationNo: 'CPCB/EPR/RECYCLER/2023/KA-08492',
        spcbAuthNo: 'KSPCB/RO-UDU/E-WASTE/AUTH/2024-25/114',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching total stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error computing total campus statistics',
      error: error.message,
    });
  }
};

/**
 * Developer API: POST /api/keys/generate
 * Provision an active API key for collegiate partners or developer apps.
 */
export const generateApiKey = async (req, res) => {
  try {
    const { name, ownerEmail, role = 'external_campus', notes = '' } = req.body;

    if (!name || !ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Application / Campus Name and Owner Email are required to generate an API key.',
      });
    }

    const apiKey = await ApiKeyStore.create({
      name,
      ownerEmail,
      role,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'API Key generated successfully. Use this key in the X-API-Key header.',
      apiKey: apiKey.key,
      name: apiKey.name,
      ownerEmail: apiKey.ownerEmail,
      documentation: '/api/docs',
      usageExample: {
        curl: `curl -H "X-API-Key: ${apiKey.key}" http://localhost:5000/api/items`,
      },
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating API key',
      error: error.message,
    });
  }
};

/**
 * Developer API: GET /api/keys
 * View registered API keys (for admin / developer inspection)
 */
export const listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKeyStore.findAll();
    return res.status(200).json({
      success: true,
      count: keys.length,
      keys: keys.map((k) => ({
        id: k._id,
        key: k.key,
        name: k.name,
        ownerEmail: k.ownerEmail,
        role: k.role,
        active: k.active,
        requestCount: k.requestCount,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
