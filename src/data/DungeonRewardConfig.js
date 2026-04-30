(function () {
  const CLEAR_SCORE_GRADES = [
    { grade: "S", minKillRatio: 0.95, chestTierBonus: 3, goldMultiplier: 1.35, xpMultiplier: 1.25, label: "Full Clear" },
    { grade: "A", minKillRatio: 0.75, chestTierBonus: 2, goldMultiplier: 1.18, xpMultiplier: 1.12, label: "Strong Clear" },
    { grade: "B", minKillRatio: 0.5, chestTierBonus: 1, goldMultiplier: 1.0, xpMultiplier: 1.0, label: "Partial Clear" },
    { grade: "C", minKillRatio: 0, chestTierBonus: 0, goldMultiplier: 0.82, xpMultiplier: 0.85, label: "Boss Rush" },
  ];

  const DIFFICULTY_REWARD_BONUS = {
    normal: { tierBonus: 0, materialBonus: 0 },
    hard: { tierBonus: 1, materialBonus: 1 },
    very_hard: { tierBonus: 2, materialBonus: 2 },
    nightmare: { tierBonus: 2, materialBonus: 2 },
  };

  const BOSS_PHASE_RULES = {
    default: [
      { atHpPct: 0.7, name: "Enrage", damageMultiplier: 1.12, spawnAdds: 1, telegraphMs: 900 },
      { atHpPct: 0.35, name: "Desperation", damageMultiplier: 1.28, spawnAdds: 2, telegraphMs: 700 },
    ],
    abyss_gate: [
      { atHpPct: 0.75, name: "Abyss Pulse", damageMultiplier: 1.18, spawnAdds: 2, telegraphMs: 850 },
      { atHpPct: 0.45, name: "Void Split", damageMultiplier: 1.32, spawnAdds: 3, telegraphMs: 700 },
      { atHpPct: 0.2, name: "Last Gate", damageMultiplier: 1.5, spawnAdds: 4, telegraphMs: 550 },
    ],
  };

  function getClearScore(kills = 0, total = 1) {
    const killRatio = total > 0 ? Math.max(0, Math.min(1, kills / total)) : 0;
    return { ...CLEAR_SCORE_GRADES.find((entry) => killRatio >= entry.minKillRatio), killRatio };
  }

  function getDifficultyBonus(difficultyKey = "normal") {
    return DIFFICULTY_REWARD_BONUS[difficultyKey] || DIFFICULTY_REWARD_BONUS.normal;
  }

  function getBossPhases(dungeonId = "default") {
    return BOSS_PHASE_RULES[dungeonId] || BOSS_PHASE_RULES.default;
  }

  window.DungeonRewardConfig = {
    CLEAR_SCORE_GRADES,
    DIFFICULTY_REWARD_BONUS,
    BOSS_PHASE_RULES,
    getClearScore,
    getDifficultyBonus,
    getBossPhases,
  };
})();
