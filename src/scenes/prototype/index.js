// Import all modules
import { PrototypeScene } from './PrototypeScene.js';
import { UIManager } from './UIManager.js';
import { CityLayout } from './CityLayout.js';
import { InputManager } from './InputManager.js';
import { PlayerManager } from './PlayerManager.js';
import { NpcManager } from './NpcManager.js';
import { QuestManager } from './QuestManager.js';
import { ServiceManager } from './ServiceManager.js';

// Export all modules
export {
  PrototypeScene,
  UIManager,
  CityLayout,
  InputManager,
  PlayerManager,
  NpcManager,
  QuestManager,
  ServiceManager
};

// Make modules available globally for compatibility
window.PrototypeScene = PrototypeScene;
window.UIManager = UIManager;
window.CityLayout = CityLayout;
window.InputManager = InputManager;
window.PlayerManager = PlayerManager;
window.NpcManager = NpcManager;
window.QuestManager = QuestManager;
window.ServiceManager = ServiceManager;