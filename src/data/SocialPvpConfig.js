(function () {
  const PARTY = {
    maxSize: 5,
    xpShareRadius: 900,
    lootModes: ["free_for_all", "round_robin", "leader"],
    defaultLootMode: "round_robin",
  };

  const GUILD = {
    creationCost: 25000,
    maxNameLength: 18,
    ranks: ["Leader", "Officer", "Member", "Recruit"],
    starterCapacity: 30,
  };

  const PVP = {
    enabledZones: {
      arena: { id: "arena", name: "Training Arena", levelSync: true, deathPenalty: false, ratingEnabled: true },
      borderlands: { id: "borderlands", name: "Borderlands", levelSync: false, deathPenalty: true, ratingEnabled: true },
    },
    rating: {
      defaultRating: 1000,
      winGain: 18,
      lossPenalty: 12,
      streakBonus: 3,
    },
  };

  window.SocialPvpConfig = {
    PARTY,
    GUILD,
    PVP,
  };
})();
