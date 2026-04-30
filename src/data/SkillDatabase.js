(function () {
  const CLASS_LEVEL_SKILLS = {
    warrior: [
      { id: "skill_power_strike", className: "warrior", name: "Power Strike", unlockLevel: 1, icon: "icon_05", tint: 0xd98852, key: "1", mpCost: 10, cooldownMs: 3500, damageScale: 1.7, damageType: "physical", range: 145, description: "Heavy melee blow that crushes nearby enemies." },
      { id: "skill_shield_bash", className: "warrior", name: "Shield Bash", unlockLevel: 3, icon: "icon_03", tint: 0xb0c4de, key: "2", mpCost: 12, cooldownMs: 5200, damageScale: 1.2, damageType: "physical", range: 130, description: "Short defensive stun-style hit." },
      { id: "skill_cleave", className: "warrior", name: "Cleave", unlockLevel: 5, icon: "icon_06", tint: 0xd98852, key: "3", mpCost: 16, cooldownMs: 6000, damageScale: 1.35, damageType: "physical", range: 160, description: "Wide weapon swing for grouped enemies." },
      { id: "skill_battle_cry", className: "warrior", name: "Battle Cry", unlockLevel: 8, icon: "icon_12", tint: 0xffc857, key: "4", mpCost: 20, cooldownMs: 10000, damageScale: 1.0, damageType: "physical", range: 145, description: "Temporary battle focus." },
    ],
    mage: [
      { id: "skill_arcane_bolt", className: "mage", name: "Arcane Bolt", unlockLevel: 1, icon: "icon_06", tint: 0x77a9ff, key: "1", mpCost: 14, cooldownMs: 3200, damageScale: 1.4, damageType: "magic", range: 330, description: "Focused ranged spell." },
      { id: "skill_fireball", className: "mage", name: "Fireball", unlockLevel: 3, icon: "icon_08", tint: 0xff7a45, key: "2", mpCost: 18, cooldownMs: 5600, damageScale: 1.55, damageType: "magic", range: 310, description: "Explosive fire spell." },
      { id: "skill_frost_nova", className: "mage", name: "Frost Nova", unlockLevel: 5, icon: "icon_10", tint: 0x8fd3ff, key: "3", mpCost: 22, cooldownMs: 8000, damageScale: 1.1, damageType: "magic", range: 180, description: "Cold burst around the caster." },
      { id: "skill_meteor_spark", className: "mage", name: "Meteor Spark", unlockLevel: 8, icon: "icon_12", tint: 0xffc857, key: "4", mpCost: 30, cooldownMs: 12000, damageScale: 2.1, damageType: "magic", range: 340, description: "High-cost burst spell." },
    ],
    rogue: [
      { id: "skill_shadow_step", className: "rogue", name: "Shadow Step", unlockLevel: 1, icon: "icon_08", tint: 0xae7cff, key: "1", mpCost: 12, cooldownMs: 4200, damageScale: 1.5, damageType: "physical", range: 165, description: "Blink forward and cut enemies." },
      { id: "skill_backstab", className: "rogue", name: "Backstab", unlockLevel: 3, icon: "icon_07", tint: 0xd68cff, key: "2", mpCost: 14, cooldownMs: 5200, damageScale: 1.85, damageType: "physical", range: 120, description: "High burst strike." },
      { id: "skill_poison_blade", className: "rogue", name: "Poison Blade", unlockLevel: 5, icon: "icon_10", tint: 0x70d66f, key: "3", mpCost: 18, cooldownMs: 7000, damageScale: 1.25, damageType: "physical", range: 140, description: "Poison-flavored extra damage." },
      { id: "skill_evasion", className: "rogue", name: "Evasion", unlockLevel: 8, icon: "icon_12", tint: 0x9bd3ff, key: "4", mpCost: 22, cooldownMs: 10000, damageScale: 1.0, damageType: "physical", range: 120, description: "Defensive agility burst." },
    ],
    archer: [
      { id: "skill_power_shot", className: "archer", name: "Power Shot", unlockLevel: 1, icon: "icon_12", tint: 0xd8b15c, key: "1", mpCost: 11, cooldownMs: 3000, damageScale: 1.35, damageType: "ranged", range: 360, description: "Long-range empowered arrow." },
      { id: "skill_multi_shot", className: "archer", name: "Multi Shot", unlockLevel: 3, icon: "icon_06", tint: 0x9fd66f, key: "2", mpCost: 16, cooldownMs: 6000, damageScale: 1.2, damageType: "ranged", range: 310, description: "Several arrows in a cone." },
      { id: "skill_piercing_arrow", className: "archer", name: "Piercing Arrow", unlockLevel: 5, icon: "icon_05", tint: 0xf4df9c, key: "3", mpCost: 18, cooldownMs: 7500, damageScale: 1.6, damageType: "ranged", range: 380, description: "Piercing line shot." },
      { id: "skill_eagle_eye", className: "archer", name: "Eagle Eye", unlockLevel: 8, icon: "icon_01", tint: 0xffc857, key: "4", mpCost: 20, cooldownMs: 10000, damageScale: 1.0, damageType: "ranged", range: 340, description: "Ranged focus buff." },
    ],
  };

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function getClassSkills(className = "warrior") {
    const key = String(className || "warrior").toLowerCase();
    return clone(CLASS_LEVEL_SKILLS[key] || CLASS_LEVEL_SKILLS.warrior || []);
  }

  function getSkillById(skillId, className = null) {
    const classKeys = className ? [String(className).toLowerCase()] : Object.keys(CLASS_LEVEL_SKILLS);
    for (const key of classKeys) {
      const found = (CLASS_LEVEL_SKILLS[key] || []).find((skill) => skill.id === skillId);
      if (found) return clone(found);
    }
    return null;
  }

  function getPrimarySkill(className = "warrior") {
    return getClassSkills(className)[0] || null;
  }

  const CLASS_SKILL_DEFS = Object.fromEntries(Object.keys(CLASS_LEVEL_SKILLS).map((className) => [className, getPrimarySkill(className)]));

  window.SkillDatabase = {
    CLASS_LEVEL_SKILLS,
    CLASS_SKILL_DEFS,
    getClassSkills,
    getSkillById,
    getPrimarySkill,
    clone,
  };
})();
