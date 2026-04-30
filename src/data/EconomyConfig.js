(function () {
  const GOLD_SINKS = {
    repair: {
      baseCost: 8,
      perTier: 6,
      perUpgrade: 9,
      durabilityRestore: 100,
    },
    dungeonEntry: {
      normal: 0,
      hard: 35,
      very_hard: 85,
      nightmare: 85,
    },
    market: {
      listingFee: 5,
      taxRate: 0.04,
      minimumTax: 1,
    },
    crafting: {
      classGearCacheFee: 75,
      materialRefineFee: 12,
    },
  };

  const ITEM_SINKS = {
    upgradeFailure: {
      minLevel: 5,
      destroyChanceByTargetLevel: { 5: 0, 6: 0.06, 7: 0.12, 8: 0.18, 9: 0.25, 10: 0.35 },
      downgradeChanceByTargetLevel: { 5: 0.12, 6: 0.18, 7: 0.24, 8: 0.3, 9: 0.36, 10: 0.45 },
      refundMaterialId: "ironShard",
    },
    salvage: {
      returnRatio: 0.35,
      rarityBonus: { common: 1, uncommon: 1.25, rare: 1.7, epic: 2.4, legendary: 3.4 },
    },
  };

  function getDungeonEntryCost(difficultyKey = "normal") {
    return GOLD_SINKS.dungeonEntry[difficultyKey] ?? GOLD_SINKS.dungeonEntry.normal ?? 0;
  }

  function getMarketTax(amount = 0) {
    const value = Math.max(0, Math.floor(amount || 0));
    if (value <= 0) return 0;
    return Math.max(GOLD_SINKS.market.minimumTax, Math.ceil(value * GOLD_SINKS.market.taxRate));
  }

  function getRepairCost(item = null) {
    if (!item) return 0;
    const tier = Math.max(1, item.tier || item.requiredLevel || 1);
    const upgrade = Math.max(0, item.upgradeLevel || 0);
    return GOLD_SINKS.repair.baseCost + tier * GOLD_SINKS.repair.perTier + upgrade * GOLD_SINKS.repair.perUpgrade;
  }

  window.EconomyConfig = {
    GOLD_SINKS,
    ITEM_SINKS,
    getDungeonEntryCost,
    getMarketTax,
    getRepairCost,
  };
})();
