(function () {
  window.BalanceConfig = {
    UPGRADE_SUCCESS_BY_LEVEL: {
      1: 100,
      2: 100,
      3: 100,
      4: 75,
      5: 50,
      6: 30,
      7: 25,
      8: 10,
      9: 5,
      10: 1,
    },

    DIFFICULTY_OVERRIDES: {
      very_hard: {
        label: "Very Hard",
        hpMultiplier: 1.75,
        damageMultiplier: 1.45,
        goldMultiplier: 1.75,
        expMultiplier: 1.7,
        dropMultiplier: 1.6,
        bossHpMultiplier: 2.25,
        spawnBonus: 3,
        chestQualityBonus: 0.24,
      },
      nightmare: {
        label: "Very Hard",
      },
    },

    BALANCE: {
      fieldGearDropBase: 0.06,
      fieldGearDropPerTier: 0.035,
      fieldGearDropCap: 0.34,
      fieldMiniBossGearChance: 0.82,
      levelCap: 60,
      xpBase: 90,
      xpQuadratic: 55,
      xpLinear: 35,
    },
  };
})();
