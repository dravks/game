# MMO Isekai Dungeon Editor Pack

Bu paket, mevcut oyunu bozmadan eklenen güvenli bir dungeon editor başlangıç paketidir.

## Nasıl açılır?

Windows:

1. ZIP'i aç.
2. `run_dungeon_editor.bat` dosyasına çift tıkla.
3. Tarayıcıda otomatik olarak şu sayfa açılır:
   `http://localhost:4173/dungeon-editor.html`

Alternatif:

```bash
npx serve . -l 4173
```

Sonra:

```text
http://localhost:4173/dungeon-editor.html
```

## Eklenenler

- `dungeon-editor.html`
- `src/tools/dungeon-editor-app.js`
- `src/tools/dungeon-editor.css`
- `assets/dungeon_pack/PNG/*`
- `assets/dungeon_pack/Tiled_files/Dungeon1.tmx`
- `assets/dungeon_pack/custom_dungeons/*.json`
- `run_dungeon_editor.bat`

## Editor özellikleri

- Grid tabanlı 2D dungeon çizimi
- Floor / wall / prop / decoration yerleştirme
- Collision blokları
- Mob spawn noktaları
- Boss spawn noktası
- Player spawn noktası
- Chest ve exit/merdiven noktaları
- JSON import/export
- LocalStorage save/load
- 10 hazır dungeon template
- Playtest için localStorage'a JSON kaydetme

## Kontroller

- Sol tık: seçili asset/tool'u yerleştir
- Sağ tık: sil
- Shift + sürükle: hızlı boya
- Mouse wheel: zoom
- Orta mouse sürükle: kamera pan
- WASD: kamera pan
- G: grid aç/kapat
- Ctrl+Z: undo
- Ctrl+Y: redo
- S: save
- E: export JSON
- I: import JSON
- Delete: seçili objeyi sil
- ESC: seçim iptal

## 10 hazır dungeon

Şu dosyalar eklendi:

1. `forgotten_halls.json`
2. `ashen_barracks.json`
3. `sunken_sanctum.json`
4. `shadow_silk_cave.json`
5. `frostbite_crypt.json`
6. `emberforge_depths.json`
7. `bandit_quarry.json`
8. `necrotic_catacombs.json`
9. `crystal_hollow.json`
10. `abyss_gate.json`

Bunlar editor içindeki Template dropdown'ından yüklenebilir.

## Önemli not

Bu paket özellikle güvenli yapıldı: mevcut oyun sahnelerine minimum dokunuldu. Editor ayrı sayfada çalışır. Normal oyun bozulmasın diye `GameState.js`, `PrototypeScene.js`, `DungeonPrototypeScene.js` gibi ana dosyaların çalışma mantığına editor entegrasyonu zorla gömülmedi.

Şu an editor JSON üretir ve `mmoisekai-playtest-dungeon` localStorage key'ine kaydedebilir. Oyunun `DungeonPrototypeScene` tarafında bu JSON'u doğrudan okuyup oynatma entegrasyonu ayrı bir ikinci aşama olarak yapılmalı.

## İkinci aşama entegrasyon promptu

Codex/Gemini'ye şu kısa görevi ver:

```text
Integrate the standalone dungeon editor JSON into DungeonPrototypeScene.
If scene start data contains customDungeonStorageKey, load the dungeon JSON from localStorage, validate it, draw floor/wall/prop layers, create collision from collision layer, place player spawn, enemy spawns, boss spawn, chest, and exit. If the JSON is invalid, fall back to the existing generated dungeon. Do not break normal generated dungeons.
```

