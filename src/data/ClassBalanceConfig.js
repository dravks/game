(function () {
  const CLASS_COMBAT_BALANCE = {
    warrior: { hpMultiplier: 1.16, mpMultiplier: 0.92, defenseMultiplier: 1.18, speedBonus: -6, apMultiplier: 1.08, role: "Melee Tank" },
    rogue: { hpMultiplier: 0.96, mpMultiplier: 1.0, defenseMultiplier: 0.92, speedBonus: 18, apMultiplier: 1.03, role: "Melee Crit" },
    mage: { hpMultiplier: 0.86, mpMultiplier: 1.28, defenseMultiplier: 0.78, speedBonus: -2, apMultiplier: 0.94, role: "Ranged Magic" },
    archer: { hpMultiplier: 1.0, mpMultiplier: 1.04, defenseMultiplier: 0.94, speedBonus: 8, apMultiplier: 1.0, role: "Ranged Physical" },
  };

  const BASIC_ATTACK_PROFILES = {
    warrior: { range: 62, hitOffset: 42, targetRadius: 48, cooldownMs: 620, damageMultiplier: 1.12, critChance: 0.06, critMultiplier: 1.55, damageType: "physical", projectile: false, tint: 0xf4df9c, effectScale: 0.95, textColor: "#ffdddd" },
    rogue: { range: 78, hitOffset: 50, targetRadius: 54, cooldownMs: 470, damageMultiplier: 0.98, critChance: 0.18, critMultiplier: 1.75, damageType: "physical", projectile: false, tint: 0xae7cff, effectScale: 0.9, textColor: "#ffd4ff" },
    mage: { range: 285, hitOffset: 150, targetRadius: 92, cooldownMs: 760, damageMultiplier: 0.92, critChance: 0.08, critMultiplier: 1.6, damageType: "magic", projectile: true, tint: 0x77a9ff, effectScale: 1.15, textColor: "#cfe2ff" },
    archer: { range: 325, hitOffset: 175, targetRadius: 82, cooldownMs: 560, damageMultiplier: 1.0, critChance: 0.13, critMultiplier: 1.7, damageType: "ranged", projectile: true, tint: 0xd8b15c, effectScale: 0.9, textColor: "#ffeeaa" },
  };

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function getCombatBalance(className = "warrior") {
    const key = String(className || "warrior").toLowerCase();
    return clone(CLASS_COMBAT_BALANCE[key] || CLASS_COMBAT_BALANCE.warrior);
  }

  function getBasicAttackProfile(className = "warrior") {
    const key = String(className || "warrior").toLowerCase();
    return clone(BASIC_ATTACK_PROFILES[key] || BASIC_ATTACK_PROFILES.warrior);
  }

  window.ClassBalanceConfig = {
    CLASS_COMBAT_BALANCE,
    BASIC_ATTACK_PROFILES,
    getCombatBalance,
    getBasicAttackProfile,
    clone,
  };
})();
