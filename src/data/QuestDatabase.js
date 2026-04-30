(function () {
  const QUEST_DEFS = {
    forgotten_kekon: { id: "forgotten_kekon", title: "Forgotten Halls Hunt", dungeonId: "forgotten_halls", objectiveType: "kill", target: "kekon", required: 10, rewardGold: 40, rewardPaper: 1, description: "Kill 10 Kekon inside Forgotten Halls." },
    forgotten_boss: { id: "forgotten_boss", title: "Kekon Chief", dungeonId: "forgotten_halls", objectiveType: "boss", target: "Kekon Chief", required: 1, rewardGold: 65, rewardPaper: 1, description: "Defeat the Kekon Chief." },
    ashen_boss: { id: "ashen_boss", title: "Burned Captain", dungeonId: "ashen_barracks", objectiveType: "boss", target: "Burned Captain", required: 1, rewardGold: 90, rewardPaper: 2, description: "Defeat the Burned Captain." },
    sunken_boss: { id: "sunken_boss", title: "Sunken Priest", dungeonId: "sunken_sanctum", objectiveType: "boss", target: "Sunken Priest", required: 1, rewardGold: 105, rewardPaper: 2, description: "Defeat the Sunken Priest." },
    shadow_boss: { id: "shadow_boss", title: "Brood Mother", dungeonId: "shadow_silk_cave", objectiveType: "boss", target: "Brood Mother", required: 1, rewardGold: 120, rewardPaper: 2, description: "Defeat the Brood Mother." },
    frost_boss: { id: "frost_boss", title: "Frost Lich", dungeonId: "frostbite_crypt", objectiveType: "boss", target: "Frost Lich", required: 1, rewardGold: 140, rewardPaper: 3, description: "Defeat the Frost Lich." },
    ember_boss: { id: "ember_boss", title: "Ember Golem", dungeonId: "emberforge_depths", objectiveType: "boss", target: "Ember Golem", required: 1, rewardGold: 160, rewardPaper: 3, description: "Defeat the Ember Golem." },
    bandit_boss: { id: "bandit_boss", title: "Bandit Warlord", dungeonId: "bandit_quarry", objectiveType: "boss", target: "Bandit Warlord", required: 1, rewardGold: 180, rewardPaper: 3, description: "Defeat the Bandit Warlord." },
    necrotic_boss: { id: "necrotic_boss", title: "Graveborn King", dungeonId: "necrotic_catacombs", objectiveType: "boss", target: "Graveborn King", required: 1, rewardGold: 210, rewardPaper: 4, description: "Defeat the Graveborn King." },
    crystal_boss: { id: "crystal_boss", title: "Crystal Guardian", dungeonId: "crystal_hollow", objectiveType: "boss", target: "Crystal Guardian", required: 1, rewardGold: 240, rewardPaper: 4, description: "Defeat the Crystal Guardian." },
    abyss_clear: { id: "abyss_clear", title: "Abyss Gate: Very Hard", dungeonId: "abyss_gate", objectiveType: "clear", difficulty: "very_hard", required: 1, rewardGold: 400, rewardPaper: 5, rewardStatPoints: 1, description: "Clear Abyss Gate on Very Hard." },
    daily_field_hunt: { id: "daily_field_hunt", title: "Field Patrol", objectiveType: "kill", target: "slime", required: 20, rewardGold: 85, rewardXp: 120, description: "Clear 20 field monsters around Amasra." },
    upgrade_trial: { id: "upgrade_trial", title: "Anvil Trial", objectiveType: "upgrade", target: "equipment", required: 1, rewardGold: 60, rewardPaper: 2, rewardXp: 90, description: "Attempt one equipment upgrade at the anvil." },
    party_clear_intro: { id: "party_clear_intro", title: "Party Practice", objectiveType: "clear", required: 1, rewardGold: 120, rewardXp: 160, description: "Clear any dungeon while using the party-ready systems." },
    pvp_training_intro: { id: "pvp_training_intro", title: "Arena Training", objectiveType: "pvp", target: "arena", required: 1, rewardGold: 75, rewardXp: 100, description: "Complete one training PvP result in the arena system." },
  };

  window.QuestDatabase = {
    QUEST_DEFS,
    get(id) {
      return QUEST_DEFS[id] || null;
    },
    list() {
      return Object.values(QUEST_DEFS);
    },
  };
})();
