import { ItemStore, UserStore } from '../data/store.js';

export const getAnalytics = async (req, res) => {
  try {
    const items = await ItemStore.findAll({});
    const students = await UserStore.getAllStudents();

    let totalKg = 0;
    let collectedKg = 0;
    const statusCounts = {
      registered: 0,
      scheduled: 0,
      collected: 0,
      handed_over: 0,
      verified_recycled: 0,
    };

    const typeBreakdown = {};
    const hostelBreakdown = {};

    items.forEach(item => {
      const weight = item.actualWeight || item.approxWeight || 0;
      totalKg += weight;
      if (['collected', 'handed_over', 'verified_recycled'].includes(item.status)) {
        collectedKg += item.actualWeight || item.approxWeight || 0;
      }

      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }

      // Type stats
      typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;

      // Hostel stats
      const hostel = item.userHostel || 'Other';
      if (!hostelBreakdown[hostel]) {
        hostelBreakdown[hostel] = {
          hostel,
          itemsCount: 0,
          totalKg: 0,
          points: 0,
          verifiedRecycled: 0,
        };
      }
      hostelBreakdown[hostel].itemsCount++;
      hostelBreakdown[hostel].totalKg += weight;
      if (item.status === 'verified_recycled') {
        hostelBreakdown[hostel].verifiedRecycled++;
      }
    });

    // Add student points to hostel summary
    students.forEach(student => {
      const hostel = student.hostel || 'Other';
      if (!hostelBreakdown[hostel]) {
        hostelBreakdown[hostel] = {
          hostel,
          itemsCount: 0,
          totalKg: 0,
          points: 0,
          verifiedRecycled: 0,
        };
      }
      hostelBreakdown[hostel].points += student.points || 0;
    });

    const hostelStats = Object.values(hostelBreakdown).map(h => ({
      ...h,
      totalKg: Number(h.totalKg.toFixed(2)),
    }));

    // Environmental metrics based on EPA & e-waste studies
    const co2SavedKg = Number((collectedKg * 1.44).toFixed(1)); // ~1.44 kg CO2 saved per kg recycled
    const toxicLeadSavedG = Number((collectedKg * 12.5).toFixed(1)); // ~12.5g lead/toxic elements kept from groundwater
    const copperSavedG = Number((collectedKg * 140).toFixed(1)); // ~140g copper reclaimed

    return res.status(200).json({
      success: true,
      stats: {
        totalItems: items.length,
        totalKg: Number(totalKg.toFixed(2)),
        collectedKg: Number(collectedKg.toFixed(2)),
        statusCounts,
        hostelStats,
        typeBreakdown,
        impact: {
          co2SavedKg,
          toxicLeadSavedG,
          copperSavedG,
        },
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error computing analytics', error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const students = await UserStore.getAllStudents();
    const items = await ItemStore.findAll({});

    // Aggregate by hostel
    const hostelMap = {};
    const defaultHostels = ['Nandani', 'Kaveri', 'Kumardhara', 'Saupernikha', 'Shambhavi', 'Netravati'];

    defaultHostels.forEach(h => {
      hostelMap[h] = {
        hostel: h,
        totalPoints: 0,
        totalKg: 0,
        itemsCount: 0,
        studentCount: 0,
      };
    });

    students.forEach(s => {
      const h = s.hostel || 'Nandani';
      if (!hostelMap[h]) {
        hostelMap[h] = { hostel: h, totalPoints: 0, totalKg: 0, itemsCount: 0, studentCount: 0 };
      }
      hostelMap[h].totalPoints += s.points || 0;
      hostelMap[h].studentCount += 1;
    });

    items.forEach(item => {
      const h = item.userHostel || 'Nandani';
      if (!hostelMap[h]) {
        hostelMap[h] = { hostel: h, totalPoints: 0, totalKg: 0, itemsCount: 0, studentCount: 0 };
      }
      hostelMap[h].itemsCount += 1;
      const weight = item.actualWeight || item.approxWeight || 0;
      hostelMap[h].totalKg += weight;
    });

    const hostelRankings = Object.values(hostelMap)
      .map(h => ({
        ...h,
        totalKg: Number(h.totalKg.toFixed(1)),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || b.totalKg - a.totalKg);

    // Aggregate by Branch / Department
    const defaultBranches = [
      'Computer Science & Engineering (CSE)',
      'Electronics & Communication (ECE)',
      'Artificial Intelligence & Machine Learning (AIML)',
      'Information Science & Engineering (ISE)',
      'Mechanical Engineering (ME)',
      'Biotechnology (BT)',
      'Civil Engineering',
    ];

    const branchMap = {};
    defaultBranches.forEach(b => {
      branchMap[b] = {
        branch: b,
        totalPoints: 0,
        totalKg: 0,
        itemsCount: 0,
        studentCount: 0,
      };
    });

    students.forEach(s => {
      const b = s.department || 'Computer Science & Engineering (CSE)';
      if (!branchMap[b]) {
        branchMap[b] = { branch: b, totalPoints: 0, totalKg: 0, itemsCount: 0, studentCount: 0 };
      }
      branchMap[b].totalPoints += s.points || 0;
      branchMap[b].studentCount += 1;
    });

    items.forEach(item => {
      const b = item.userBranch || 'Computer Science & Engineering (CSE)';
      if (!branchMap[b]) {
        branchMap[b] = { branch: b, totalPoints: 0, totalKg: 0, itemsCount: 0, studentCount: 0 };
      }
      branchMap[b].itemsCount += 1;
      const weight = item.actualWeight || item.approxWeight || 0;
      branchMap[b].totalKg += weight;
    });

    const branchRankings = Object.values(branchMap)
      .map(b => ({
        ...b,
        totalKg: Number(b.totalKg.toFixed(1)),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || b.totalKg - a.totalKg);

    // Top students: only students who have actually recycled and earned reward points
    const topStudents = students
      .filter(s => (s.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map(s => ({
        id: s._id,
        name: s.name,
        hostel: s.hostel,
        department: s.department,
        points: s.points || 0,
      }));

    return res.status(200).json({
      success: true,
      hostelRankings,
      branchRankings,
      topStudents,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error computing leaderboard', error: error.message });
  }
};
