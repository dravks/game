class QuestManager {
  constructor(scene) {
    this.scene = scene;
  }

  buildQuestUiState() {
    const scene = this.scene;
    const questState = scene.registry.get("questState");
    const repeatObjectiveState = scene.registry.get("repeatObjectiveState");
    const cycleObjectiveState = scene.registry.get("cycleObjectiveState");
    const repeatProgress = scene.registry.get("repeatObjectiveProgress");
    const repeatTarget = scene.getRepeatObjectiveTarget?.() || 8;
    const cycleProgress = scene.registry.get("cycleObjectiveProgress");
    const cycleTarget = scene.getCycleObjectiveTarget?.() || 2;

    switch (questState) {
      case "active":
        return {
          status: "Active",
          objective: "Clear the first dungeon route.",
          detail: "Return after the boss placeholder falls.",
          loopText: this.buildLoopStateText()
        };
      case "ready_to_turn_in":
        return {
          status: "Ready to Turn In",
          objective: "Talk to the Quest Giver.",
          detail: "Dungeon objective complete.",
          loopText: this.buildLoopStateText()
        };
      case "completed":
        if (cycleObjectiveState === "ready_to_turn_in") {
          return {
            status: "Follow-up Ready",
            objective: "Talk to the Quest Giver.",
            detail: `Clear-chain complete: ${cycleProgress}/${cycleTarget}. Claim +${scene.getCycleObjectiveRewardGold?.() ?? 22} Gold.`,
            loopText: this.buildLoopStateText()
          };
        }
        if (repeatObjectiveState === "ready_to_turn_in") {
          return {
            status: "Repeatable Ready",
            objective: "Talk to the Quest Giver.",
            detail: `Enemy bounty complete: ${repeatProgress}/${repeatTarget}. Claim +${scene.getRepeatObjectiveRewardGold?.() ?? 14} Gold.`,
            loopText: this.buildLoopStateText()
          };
        }
        if (cycleObjectiveState === "active") {
          return {
            status: "Follow-up Active",
            objective: `Complete ${cycleTarget} more dungeon clears.`,
            detail: `Clear progress: ${cycleProgress}/${cycleTarget} | Bounty ${repeatProgress}/${repeatTarget}`,
            loopText: this.buildLoopStateText()
          };
        }
        if (repeatObjectiveState === "active") {
          return {
            status: "Repeatable Active",
            objective: `Defeat ${repeatTarget} dungeon enemies total.`,
            detail: `Progress: ${repeatProgress}/${repeatTarget}`,
            loopText: this.buildLoopStateText()
          };
        }
        return {
          status: "Completed",
          objective: "First dungeon quest complete.",
          detail: `Reward claimed: +${scene.getQuestRewardGold?.() ?? 18} Gold`,
          loopText: this.buildLoopStateText()
        };
      default:
        return {
          status: "Not Accepted",
          objective: "Talk to the Quest Giver.",
          detail: "Accept the first dungeon quest.",
          loopText: this.buildLoopStateText()
        };
    }
  }

  buildLoopStateText() {
    const scene = this.scene;
    return `Loop: Clears ${scene.registry.get("dungeonCycles")} | Power ${scene.registry.get("playerPowerTier")} | Prep +${scene.calculatePreparationBonus?.() ?? 0}`;
  }

  getCompactQuestStatus() {
    const scene = this.scene;
    const qs = scene.registry.get("questState");
    const ros = scene.registry.get("repeatObjectiveState");
    const cos = scene.registry.get("cycleObjectiveState");
    
    if (qs === "ready_to_turn_in") return "Ready";
    if (qs === "completed" && cos === "ready_to_turn_in") return "Chain Ready";
    if (qs === "completed" && ros === "ready_to_turn_in") return "Bounty Ready";
    if (qs === "completed" && cos === "active") return "Chain Active";
    if (qs === "completed" && ros === "active") return "Bounty Active";
    if (qs === "active") return "Main Active";
    if (qs === "completed") return "Main Clear";
    return "Not Taken";
  }

  buildCompactRewardLines() {
    const scene = this.scene;
    const state = scene.cityProgressState;
    const cycleCount = state?.cycleCount ?? scene.registry.get("dungeonCycles") ?? 0;
    const materials = state?.materials || [];
    const materialPreview = materials.length > 0 ? materials.slice(0, 2).join(", ") : "None";
    
    return [
      `Run ${state?.cleared ? "CLEAR" : "IDLE"}  |  Cycle ${cycleCount}`,
      `Gold +${state?.goldGained ?? 0}  |  Mats ${materials.length}`,
      `Last Drop: ${materialPreview}`,
      `Prep +${scene.calculatePreparationBonus?.() ?? 0}  |  Power ${scene.registry.get("playerPowerTier")}  |  Train ${GameState.getClassTrainingLevel?.(scene.registry) || 0}`,
      `Spend: ${scene.registry.get("citySpendResult") || "None"}`,
    ];
  }

  buildCompactQuestLines() {
    const scene = this.scene;
    const qs = scene.registry.get("questState");
    const ros = scene.registry.get("repeatObjectiveState");
    const cos = scene.registry.get("cycleObjectiveState");

    let objective = "Talk to the Quest Giver";
    let progress = "No active target";

    if (qs === "active") {
      objective = "Clear the first dungeon route";
      progress = "Boss kill needed";
    } else if (qs === "ready_to_turn_in") {
      objective = "Return to Quest Giver";
      progress = `Main reward +${scene.getQuestRewardGold?.() ?? 18} Gold`;
    } else if (qs === "completed" && cos === "ready_to_turn_in") {
      objective = "Turn in clear chain";
      progress = `Reward +${scene.getCycleObjectiveRewardGold?.() ?? 22} Gold`;
    } else if (qs === "completed" && ros === "ready_to_turn_in") {
      objective = "Turn in enemy bounty";
      progress = `Reward +${scene.getRepeatObjectiveRewardGold?.() ?? 14} Gold`;
    } else if (qs === "completed" && cos === "active") {
      objective = "Repeat full clears";
      progress = `${scene.registry.get("cycleObjectiveProgress")}/${scene.getCycleObjectiveTarget?.() ?? 2} clears`;
    } else if (qs === "completed" && ros === "active") {
      objective = "Repeat enemy bounty";
      progress = `${scene.registry.get("repeatObjectiveProgress")}/${scene.getRepeatObjectiveTarget?.() ?? 8} kills`;
    } else if (qs === "completed") {
      objective = "Main quest finished";
      progress = "Use Q for full list";
    }

    return [
      `State: ${this.getCompactQuestStatus()}`,
      `Objective: ${objective}`,
      `Progress: ${progress}`,
      `Loop: ${scene.registry.get("dungeonCycles")} clear  |  Prep +${scene.calculatePreparationBonus?.() ?? 0}`,
    ];
  }

  buildObjectiveSummaryText() {
    const scene = this.scene;
    const qs = scene.registry.get("questState");
    const ros = scene.registry.get("repeatObjectiveState");
    const cos = scene.registry.get("cycleObjectiveState");
    
    if (qs === "ready_to_turn_in") return "Objective: Main quest ready to turn in";
    if (qs === "completed" && cos === "ready_to_turn_in") return "Objective: Follow-up clear chain ready";
    if (qs === "completed" && ros === "ready_to_turn_in") return "Objective: Repeat bounty ready to turn in";
    if (qs === "completed" && cos === "active") return `Objective: Clear chain ${scene.registry.get("cycleObjectiveProgress")}/${scene.getCycleObjectiveTarget?.() ?? 2}`;
    if (qs === "completed" && ros === "active") return `Objective: Enemy bounty ${scene.registry.get("repeatObjectiveProgress")}/${scene.getRepeatObjectiveTarget?.() ?? 8}`;
    if (qs === "active") return "Objective: Clear the first dungeon route";
    return "Objective: No active dungeon objective";
  }

  buildServiceStatusText() {
    const scene = this.scene;
    return `Services: Potion ${scene.registry.get("healthPotionCount")} | HP +${scene.registry.get("maxHpBonus")} | Power ${scene.registry.get("playerPowerTier")} | Train ${GameState.getClassTrainingLevel?.(scene.registry) || 0} | Prep +${scene.calculatePreparationBonus?.() ?? 0}`;
  }
}


window.QuestManager = QuestManager;