import { ItemStore, UserStore } from '../data/store.js';
import { CARBON_FACTORS } from './carbonService.js';

export const IMPACT_STORY_CITATIONS = [
  {
    metric: 'Carbon Emissions Avoided Factor',
    factorValue: `${CARBON_FACTORS.co2eSavedPerKg} kg CO2e / kg e-waste`,
    sourceTitle: 'The Global E-waste Monitor 2024: Electronic Waste Rising, but Recycling Lags',
    publisher: 'United Nations Institute for Training and Research (UNITAR) & International Telecommunication Union (ITU)',
    url: 'https://ewastemonitor.info',
    notes: 'Documented formal recycling avoids 1.44 kg CO2e per kg e-waste by substituting primary mining, smelting, and virgin polymer extraction.',
  },
  {
    metric: 'Urban Tree Carbon Sequestration Equivalence',
    factorValue: `${CARBON_FACTORS.co2ePerTreeYear} kg CO2 / urban tree seedling / year`,
    sourceTitle: 'Greenhouse Gas Equivalencies Calculator & Emission Factors Hub',
    publisher: 'United States Environmental Protection Agency (US EPA)',
    url: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
    notes: 'Based on average carbon sequestered by an urban tree seedling grown for 10 years (approx 21.77 kg CO2 annually).',
  },
  {
    metric: 'Passenger Vehicle Driving Avoidance',
    factorValue: `${CARBON_FACTORS.kmDrivenAvoidedPerKgCo2} km driven / kg CO2e avoided`,
    sourceTitle: 'Monitoring of CO2 Emissions from Passenger Cars & Light Commercial Vehicles',
    publisher: 'European Environment Agency (EEA) & US EPA (120g CO2/km average)',
    url: 'https://www.eea.europa.eu/en/topics/in-depth/transport-and-mobility',
    notes: 'Calculates vehicle kilometers avoided based on average emission intensity of internal combustion vehicles.',
  },
  {
    metric: 'Smartphone Battery Recharges',
    factorValue: `${CARBON_FACTORS.smartphoneChargesPerKgCo2} recharges / kg CO2e`,
    sourceTitle: 'US EPA GHG Equivalencies Calculator',
    publisher: 'US EPA',
    url: 'https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator',
    notes: 'Calculates equivalent energy required to charge typical modern smartphones (~15.4 Wh battery with charger efficiency).',
  },
];

class ImpactStoryService {
  /**
   * Generate personal impact story for a student calculated strictly from their database records.
   */
  async getStudentImpactStory(user) {
    if (!user) {
      throw new Error('User required for generating personal impact story');
    }

    // 1. Fetch all items associated with this student
    const allItems = await ItemStore.findAll();
    const studentEmail = (user.email || '').toLowerCase();
    const studentIdStr = (user._id || user.id || '').toString();

    const studentItems = allItems.filter((item) => {
      const matchId = item.userId && item.userId.toString() === studentIdStr;
      const matchEmail = item.userEmail && item.userEmail.toLowerCase() === studentEmail;
      return matchId || matchEmail;
    });

    // 2. Compute actual weight sum from database items
    let totalRecycledKg = 0;
    let verifiedRecycledKg = 0;
    let itemTypesCount = {};

    studentItems.forEach((item) => {
      const weight = Number(item.actualWeight || item.approxWeight || 0);
      totalRecycledKg += weight;
      if (item.status === 'verified_recycled') {
        verifiedRecycledKg += weight;
      }
      const type = item.type || 'Other Electronics';
      itemTypesCount[type] = (itemTypesCount[type] || 0) + 1;
    });

    // Round weight cleanly: if whole number show integer, otherwise 1 decimal
    const roundedKg = Number(totalRecycledKg.toFixed(2));
    const displayWeight = roundedKg % 1 === 0 ? roundedKg.toFixed(0) : roundedKg.toFixed(1);

    // 3. Compute Environmental Savings Using Real Citable Conversion Factors
    // 1 kg e-waste = 1.44 kg CO2e saved (Global E-waste Monitor 2024)
    const co2eSavedKg = Number((roundedKg * CARBON_FACTORS.co2eSavedPerKg).toFixed(2));
    const displayCo2 = co2eSavedKg % 1 === 0 ? co2eSavedKg.toFixed(0) : co2eSavedKg.toFixed(2);

    // 1 tree = 21.77 kg CO2 / year (US EPA)
    const treesEquivalent = Number((co2eSavedKg / CARBON_FACTORS.co2ePerTreeYear).toFixed(1));
    const displayTrees = treesEquivalent;

    // Additional tangible equivalents
    const carKmAvoided = Number((co2eSavedKg * CARBON_FACTORS.kmDrivenAvoidedPerKgCo2).toFixed(1));
    const smartphoneCharges = Math.round(co2eSavedKg * CARBON_FACTORS.smartphoneChargesPerKgCo2);

    // 4. Primary Statutory & Story Quotes
    const primaryQuote = roundedKg > 0
      ? `You recycled ${displayWeight} kg of e-waste, saving ${displayCo2} kg of CO2. That's like planting ${displayTrees} trees.`
      : "You haven't recycled any e-waste yet. Register your first item to start saving CO2 and planting trees!";

    const descriptiveStory = roundedKg > 0
      ? `Through your active participation at Hostel ${user.hostel || 'Campus Block'}, you collected and diverted ${displayWeight} kg of retired electronics through EcoLoop's closed-loop chain of custody. By preventing toxic lead, mercury, and flame retardants from entering local landfills, you conserved critical rare earth metals and prevented ${displayCo2} kg of CO2e greenhouse gas emissions — equivalent to the annual carbon absorption of ${displayTrees} urban tree seedlings.`
      : "You haven't registered any e-waste items yet. Once you submit an item for pickup, your personal environmental impact story and carbon savings will be computed here in real time.";

    // 5. Categorized Milestone Badges
    const badges = [];
    if (studentItems.length >= 1) {
      badges.push({
        id: 'badge-starter',
        title: 'Campus Eco Pioneer',
        description: 'Deposited first e-waste item into verified custody',
        icon: '🌱',
      });
    }
    if (roundedKg >= 2) {
      badges.push({
        id: 'badge-diverter',
        title: 'Circular Champion',
        description: `Diverted over ${displayWeight} kg of toxic electronics`,
        icon: '♻️',
      });
    }
    if (treesEquivalent >= 0.1) {
      badges.push({
        id: 'badge-tree',
        title: 'Urban Canopy Guardian',
        description: `Equivalent to planting ${displayTrees} trees in clean air benefit`,
        icon: '🌲',
      });
    }
    if (itemTypesCount['Circuit Board / PCB'] || itemTypesCount['Mobile Phone / Tablet']) {
      badges.push({
        id: 'badge-metals',
        title: 'Rare Earth Savior',
        description: 'Recycled gold, silver, and copper from printed circuit assemblies',
        icon: '⚡',
      });
    }

    // 6. Pre-filled Social Media Sharing Templates
    const shareUrl = 'https://ecoloop.campus';
    const tweetText = `Proud to share my personal impact story with @EcoLoopCampus! 🌱 I recycled ${displayWeight} kg of e-waste, saving ${displayCo2} kg of CO2 — that's like planting ${displayTrees} trees! Verified circular chain of custody at Nitte Deemed to be University. #EcoLoop #SustainableCampus #CircularEconomy`;
    const linkedInText = `I just reviewed my personal environmental impact story on EcoLoop Campus E-Waste Platform. By responsibly recycling ${displayWeight} kg of e-waste from Hostel ${user.hostel || 'Nandani'}, I prevented ${displayCo2} kg of CO2e greenhouse gas emissions — equivalent to planting ${displayTrees} trees! All numbers calculated from official chain-of-custody data and cited via the UN Global E-waste Monitor 2024 & US EPA.`;
    const whatsAppText = `Hey! 🌱 Check out my e-waste recycling impact on EcoLoop:\n\n✨ Recycled: ${displayWeight} kg of e-waste\n🌍 CO2 Saved: ${displayCo2} kg of CO2\n🌲 Tree Equivalent: ${displayTrees} trees planted\n\nVerified circular tracking at Nitte Deemed to be University! Let's make our campus greener! 🚀`;

    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`;

    return {
      success: true,
      student: {
        name: user.name,
        email: user.email,
        hostel: user.hostel || 'Nandani',
        department: user.department || 'Computer Science & Engineering',
        studentId: user.studentId || '4NM22CS045',
        points: user.points || 0,
      },
      story: {
        headline: `${user.name.split(' ')[0]}'s Personal EcoLoop Impact Story`,
        primaryQuote,
        descriptiveStory,
        totalItemsCount: studentItems.length,
        totalRecycledKg: roundedKg,
        displayWeight,
        co2eSavedKg,
        displayCo2,
        treesEquivalent,
        displayTrees,
        carKmAvoided,
        smartphoneCharges,
        badges,
        itemBreakdown: studentItems.map((item) => ({
          trackingCode: item.trackingCode,
          type: item.type,
          weightKg: Number(item.actualWeight || item.approxWeight || 0),
          status: item.status,
          hostel: item.userHostel,
          location: item.location,
          pickupDate: item.pickupDate || 'Completed',
          createdAt: item.createdAt,
        })),
        citations: IMPACT_STORY_CITATIONS,
        socialShare: {
          twitterShareUrl,
          linkedInShareUrl,
          whatsAppShareUrl,
          tweetText,
          linkedInText,
          whatsAppText,
          shareUrl,
        },
      },
    };
  }
}

export const impactStoryService = new ImpactStoryService();
