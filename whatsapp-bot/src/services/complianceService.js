export class ComplianceService {
  /**
   * Real conversion factor: 1 kg e-waste recycled saves ~1.44 kg CO2e
   */
  static calculateCo2Saved(weightKg) {
    if (!weightKg || weightKg <= 0) return 0;
    return parseFloat((weightKg * 1.44).toFixed(2));
  }

  /**
   * Check CPCB 30-day SLA compliance across active database items
   */
  static evaluateSlaBreaches(items = []) {
    const now = new Date();
    const breaches = [];

    items.forEach((item) => {
      if (item.status === 'collected' && item.collectedAt) {
        const daysSinceCollection = Math.floor((now - new Date(item.collectedAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceCollection > 30) {
          breaches.push({
            trackingCode: item.trackingCode,
            type: item.type,
            severity: 'CRITICAL',
            rule: 'CPCB Rule 13(1): E-waste must not be stored on campus exceeding 30 days before recycler transfer.',
            daysPending: daysSinceCollection,
          });
        }
      } else if (item.status === 'registered' && item.createdAt) {
        const daysSinceRegistration = Math.floor((now - new Date(item.createdAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceRegistration > 7) {
          breaches.push({
            trackingCode: item.trackingCode,
            type: item.type,
            severity: 'WARNING',
            rule: 'Campus SLA: Registered item unassigned or unscheduled beyond 7 calendar days.',
            daysPending: daysSinceRegistration,
          });
        }
      }
    });

    return breaches;
  }

  /**
   * Return safe handling checklist for hazardous components
   */
  static getSafetyChecklist(itemType = '') {
    const type = itemType.toLowerCase();
    const general = [
      '✅ Do not open, puncture, or mechanically crush batteries or sealed power banks.',
      '✅ Tape exposed terminals of lithium-ion cells with non-conductive electrical tape.',
      '✅ Keep hardware in dry, fire-retardant designated campus bins.',
    ];

    if (type.includes('battery') || type.includes('power bank')) {
      return [
        '⚠️ LITHIUM HAZARD: Risk of thermal runaway if crushed or exposed to moisture.',
        ...general,
      ];
    }

    if (type.includes('monitor') || type.includes('tv') || type.includes('display')) {
      return [
        '⚠️ LEAD & MERCURY HAZARD: Prevent glass fracturing and cold-cathode tube rupture.',
        ...general,
      ];
    }

    return general;
  }
}
