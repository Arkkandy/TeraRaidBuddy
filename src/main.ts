import UIElements from './UI/uielements';

import html2canvas from 'html2canvas';

import { SearchResult } from './UI/searchresult';
import {RaidPresetMode, AbilitySelectionMode, getPresetModeString} from './UI/uilogic'
import { setDamageBackgroundColor, setTypeBackgroundColor, setValidBackgroundColor, stringFromEVSpread, populateDropdown } from './UI/util';

import {calculate,Generations,Pokemon,Move, toID, Field, Stats, Side} from './smogon-calc'
import { StatsTable } from './smogon-calc';
import { NatureName, Specie, Terrain, TypeName, Weather } from './smogon-calc/data/interface';
import { getModifiedStat } from './smogon-calc/mechanics/util';


import * as Ranking from './ranking/ranking'
import { EVSpread } from './ranking/util'
import * as FilteringData from './ranking/filteringdata'
import { DefensiveNaturePreference, PrintVisibleDamage, RankingParameters, SearchRankingType } from './ranking/searchparameters';
import { ExtraAction, RaidBossPreset,
        T5Raids_IndigoDisk, T5Raids_Paldea, T5Raids_TealMask,
        T6Raids_IndigoDisk, T6Raids_Paldea, T6Raids_TealMask,
        tier5EventRaidBossPresets, tier5RaidBossPresets, tier6RaidBossPresets, tier7EventRaidBossPresets } from './presets/raidpreset';
import { moveLearnsetDictionary, fullLearnset } from './ranking/movelearnset';


// ========================================================================
// ========================================================================
// APPLICATION STATE VARIABLES

// Tera Raids only in Gen 9
const gen = Generations.get(9);

// Currently selected raid boss species
let selectedSpecies: Specie | undefined = undefined;

// Raid boss preset mode (Custom, 5/6 star raid, 5/7 star event)
let currentPresetMode :RaidPresetMode = RaidPresetMode.Custom;

// Raid boss ability selection mode (All abilities, Natural ability)
let abilityMode : AbilitySelectionMode = AbilitySelectionMode.NaturalAbilities;

// Search Result Cache (Stores the results from the last search which is currently shown in the table)
let currentSearchResult: SearchResult | undefined = undefined;

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// POPULATE INTERFACE ELEMENTS WITH DATA

// Populate the custom preset select & whitelist select with all available Pokemon in Gen 9
if ( UIElements.RaidBoss.CustomSelect && UIElements.SearchParams.FilterWhitelistSelect ) {
  // Obtain species names from data
  let partialSpeciesFilter: string[] = FilteringData.filteringData.map(
    item => item.name
  );
  partialSpeciesFilter.sort( (a,b) => {
    return a < b ? -1 : 1;
  });

  populateDropdown( UIElements.RaidBoss.CustomSelect, partialSpeciesFilter );
  populateDropdown( UIElements.SearchParams.FilterWhitelistSelect, partialSpeciesFilter );
}
// Populate 5 star raid boss select
if ( UIElements.RaidBoss.R5Select ) {

  let partialRaidFilter_Paldea: string[] = T5Raids_Paldea.map(
    item => item.speciesName
  );
  let partialRaidFilter_Teal: string[] = T5Raids_TealMask.map(
    item => item.speciesName
  );
  let partialRaidFilter_Indigo: string[] = T5Raids_IndigoDisk.map(
    item => item.speciesName
  );
  
  const groupPaldea = document.createElement('optgroup');
  groupPaldea.label = "Paldea Raids";
  UIElements.RaidBoss.R5Select.add( groupPaldea );
  populateDropdown( UIElements.RaidBoss.R5Select, partialRaidFilter_Paldea );

  const groupTeal = document.createElement('optgroup');
  groupTeal.label = "Teal Raids";
  UIElements.RaidBoss.R5Select.add( groupTeal );
  populateDropdown( UIElements.RaidBoss.R5Select, partialRaidFilter_Teal );

  const groupIndigo = document.createElement('optgroup');
  groupIndigo.label = "Indigo Raids";
  UIElements.RaidBoss.R5Select.add( groupIndigo );
  populateDropdown( UIElements.RaidBoss.R5Select, partialRaidFilter_Indigo );
}

// Populate 5 star raid boss select
if ( UIElements.RaidBoss.R5ESelect ) {
  let partialSpeciesFilter: string[] = tier5EventRaidBossPresets.map(
    item => item.speciesName
  );
  
  populateDropdown( UIElements.RaidBoss.R5ESelect, partialSpeciesFilter );
}

// Populate 6 star raid boss select
if ( UIElements.RaidBoss.R6Select ) {


  let partialRaidFilter_Paldea: string[] = T6Raids_Paldea.map(
    item => item.speciesName
  );
  let partialRaidFilter_Teal: string[] = T6Raids_TealMask.map(
    item => item.speciesName
  );
  let partialRaidFilter_Indigo: string[] = T6Raids_IndigoDisk.map(
    item => item.speciesName
  );
  
  const groupPaldea = document.createElement('optgroup');
  groupPaldea.label = "Paldea Raids";
  UIElements.RaidBoss.R6Select.add( groupPaldea );
  populateDropdown( UIElements.RaidBoss.R6Select, partialRaidFilter_Paldea );

  const groupTeal = document.createElement('optgroup');
  groupTeal.label = "Teal Raids";
  UIElements.RaidBoss.R6Select.add( groupTeal );
  populateDropdown( UIElements.RaidBoss.R6Select, partialRaidFilter_Teal );

  const groupIndigo = document.createElement('optgroup');
  groupIndigo.label = "Indigo Raids";
  UIElements.RaidBoss.R6Select.add( groupIndigo );
  populateDropdown( UIElements.RaidBoss.R6Select, partialRaidFilter_Indigo );

}

// Populate 7 star raid boss select
if ( UIElements.RaidBoss.R7ESelect ) {
  let partialSpeciesFilter: string[] = tier7EventRaidBossPresets.map(
    item => item.speciesName
  );
  
  populateDropdown( UIElements.RaidBoss.R7ESelect, partialSpeciesFilter );
}

// Populate default item selection for raid defenders
if ( UIElements.RaidBoss.BossHeldItem && UIElements.SearchParams.ItemDefaultSelect ) {
  let partialItemFilter: string[] = [...gen.items].map(
    item => item.name
  );

  partialItemFilter.sort( (a,b) => {
    return a < b ? -1 : 1;
  });
  
  populateDropdown( UIElements.RaidBoss.BossHeldItem, partialItemFilter );
  populateDropdown( UIElements.SearchParams.ItemDefaultSelect, partialItemFilter );
}

if ( UIElements.RaidBoss.BossAllAbilitiesSelect ) {
  let allAbilities: string[] = [...gen.abilities].map(
    item => item.name
  );

  populateDropdown( UIElements.RaidBoss.BossAllAbilitiesSelect, allAbilities );
}


if ( UIElements.Results.PSFLearnMoveSelect ) {
  let partialMoveData : string[] = [];

  // Add all keys to an array
  for ( let e in fullLearnset ) {
    let item = fullLearnset[e];
    partialMoveData.push( item.move );
  }

  // Sort keys
  partialMoveData.sort( (a,b) => {
    return a < b ? -1 : 1;
  });

  // Populate select with options
  populateDropdown( UIElements.Results.PSFLearnMoveSelect, partialMoveData );

}


UIElements.RaidBoss.BossAbilityLabel.addEventListener('click', () => {
  if ( abilityMode == AbilitySelectionMode.NaturalAbilities ) {
    abilityMode = AbilitySelectionMode.AnyAbilities;

    UIElements.RaidBoss.BossAbilityLabel.textContent = "Ability";

    UIElements.RaidBoss.BossNaturalAbilitySelect.classList.add("collapsed");
    UIElements.RaidBoss.BossAllAbilitiesSelect.classList.remove("collapsed");
  }
  else {
    abilityMode = AbilitySelectionMode.NaturalAbilities;

    UIElements.RaidBoss.BossAbilityLabel.textContent = "Ability*";

    UIElements.RaidBoss.BossAllAbilitiesSelect.classList.add("collapsed");
    UIElements.RaidBoss.BossNaturalAbilitySelect.classList.remove("collapsed");
  }
});

UIElements.SearchParams.FilterWhitelistAdd.addEventListener('click', () => {
  const selectedEntry = UIElements.SearchParams.FilterWhitelistSelect.value;
  if (selectedEntry) {
    // Check if the selected entry already exists in the whitelist
    const isDuplicate = Array.from(UIElements.SearchParams.FilterWhitelist.children).some((item) => {
        return (item as HTMLElement).dataset.originalValue == selectedEntry;
    });

    // If not duplicate then we add to the whitelist
    if ( !isDuplicate ) {
      const listItem = document.createElement('li');
      listItem.dataset.originalValue = selectedEntry;
      listItem.innerHTML = `${selectedEntry} <button class="wlistRemoveButton">x</button>`;
      UIElements.SearchParams.FilterWhitelist.appendChild(listItem);

      // Add click event listener to remove button
      const removeButton = listItem.querySelector('.wlistRemoveButton') as HTMLButtonElement;
      removeButton.addEventListener('click', () => {
        UIElements.SearchParams.FilterWhitelist.removeChild(listItem);
      });
    }
  }

  UIElements.SearchParams.FilterWhitelistSelect.focus();
});
UIElements.SearchParams.FilterWhitelistClear.addEventListener('click', () => {
  UIElements.SearchParams.FilterWhitelist.innerHTML = "";
});



function updateDexFilterDescription() {
  let paldea: boolean = UIElements.SearchParams.FilterDexPaldea.checked;
  let teal: boolean = UIElements.SearchParams.FilterDexTeal.checked;
  let indigo: boolean = UIElements.SearchParams.FilterDexIndigo.checked;
  let home: boolean = UIElements.SearchParams.FilterDexHOME.checked;

  // If all checkboxes are the same, true or false, default to showing all
  if ( paldea == teal && teal == indigo && indigo == home ) {
    UIElements.SearchParams.DexDescription.innerHTML = '(Show All)';
  }
  else {
    let flags : boolean[] = [paldea,teal,indigo,home];
    let dexStrings = ['Paldea','Teal','Indigo','Home'];
    let message = '(';
    let count = 0;
    for ( let i = 0; i < dexStrings.length; ++i ) {
      if ( flags[i] ) {
        if ( count > 0 ) {
          message += ',';
        }
        message += dexStrings[i];
        count++;
      }
    }
    message += ')';
    UIElements.SearchParams.DexDescription.textContent = message;
  }
}
UIElements.SearchParams.FilterDexPaldea.addEventListener( 'change', updateDexFilterDescription );
UIElements.SearchParams.FilterDexTeal.addEventListener( 'change', updateDexFilterDescription );
UIElements.SearchParams.FilterDexIndigo.addEventListener( 'change', updateDexFilterDescription );
UIElements.SearchParams.FilterDexHOME.addEventListener( 'change', updateDexFilterDescription );

function updateRarityFilterDescription() {
  let regular: boolean = UIElements.SearchParams.FilterRarityRegular.checked;
  let paradox: boolean = UIElements.SearchParams.FilterRarityParadox.checked;
  let legendary: boolean = UIElements.SearchParams.FilterRarityLegendary.checked;
  let mythical: boolean = UIElements.SearchParams.FilterRarityMythical.checked;

  // If all checkboxes are the same, true or false, default to showing all
  if ( regular == paradox && paradox == legendary && legendary == mythical ) {
    UIElements.SearchParams.RarityDescription.innerHTML = '(Show All)';
  }
  else {
    let flags : boolean[] = [regular,paradox,legendary,mythical];
    let strings = ['Regular','Paradox','Legendary','Mythical'];
    let message = '(';
    let count = 0;
    for ( let i = 0; i < strings.length; ++i ) {
      if ( flags[i] ) {
        if ( count > 0 ) {
          message += ',';
        }
        message += strings[i];
        count++;
      }
    }
    message += ')';
    UIElements.SearchParams.RarityDescription.textContent = message;
  }
}
UIElements.SearchParams.FilterRarityRegular.addEventListener( 'change', updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityParadox.addEventListener( 'change', updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityLegendary.addEventListener( 'change', updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityMythical.addEventListener( 'change', updateRarityFilterDescription );

function onPresetChange( newPreset : RaidPresetMode ) : void {

  currentPresetMode = newPreset;

  // Reset tab highlights
  UIElements.RaidBoss.CustomPresetButton.classList.remove("active");
  UIElements.RaidBoss.R5PresetButton.classList.remove("active");
  UIElements.RaidBoss.R6PresetButton.classList.remove("active");
  UIElements.RaidBoss.R5EPresetButton.classList.remove("active");
  UIElements.RaidBoss.R7EPresetButton.classList.remove("active");

  // Hide species selectors
  UIElements.RaidBoss.R5Group.classList.add("collapsed");
  UIElements.RaidBoss.R5EGroup.classList.add("collapsed");
  UIElements.RaidBoss.R6Group.classList.add("collapsed");
  UIElements.RaidBoss.R7EGroup.classList.add("collapsed");
  UIElements.RaidBoss.CustomGroup.classList.add("collapsed");

  // Highlight and show elements by mode
  if ( currentPresetMode == RaidPresetMode.Custom ) {
    UIElements.RaidBoss.CustomGroup.classList.remove("collapsed");

    UIElements.RaidBoss.CustomPresetButton.classList.add("active");

    UIElements.RaidBoss.CustomSelect.focus();

    UIElements.RaidBoss.BossActionSection.classList.add('collapsed');
  }
  // If it's a non custom preset
  else {
    UIElements.RaidBoss.BossActionSection.classList.remove('collapsed');
    if ( currentPresetMode == RaidPresetMode.FiveStar ) {
      UIElements.RaidBoss.R5Group.classList.remove("collapsed");

      UIElements.RaidBoss.R5PresetButton.classList.add("active");

      UIElements.RaidBoss.R5Select.focus();
    }
    else if ( currentPresetMode == RaidPresetMode.FiveStarEvent ) {
      UIElements.RaidBoss.R5EGroup.classList.remove("collapsed");

      UIElements.RaidBoss.R5EPresetButton.classList.add("active");

      UIElements.RaidBoss.R5ESelect.focus();
    }
    else if ( currentPresetMode == RaidPresetMode.SixStar ) {
      UIElements.RaidBoss.R6Group.classList.remove("collapsed");

      UIElements.RaidBoss.R6PresetButton.classList.add("active");

      UIElements.RaidBoss.R6Select.focus();
    }
    else if ( currentPresetMode == RaidPresetMode.SevenStarEvent ) {
      UIElements.RaidBoss.R7EGroup.classList.remove("collapsed");

      UIElements.RaidBoss.R7EPresetButton.classList.add("active");

      UIElements.RaidBoss.R7ESelect.focus();
    }
  }

  // Update other boss data elements
  updateBossImage();
  reselectAbility();
  reselectPresetDefaults();
  overwriteStats();
}

UIElements.RaidBoss.CustomPresetButton.addEventListener( 'click',  () => {
  if ( currentPresetMode != RaidPresetMode.Custom) {
    onPresetChange(RaidPresetMode.Custom);
  }
});
UIElements.RaidBoss.R5PresetButton.addEventListener( 'click',  () => {
  if ( currentPresetMode != RaidPresetMode.FiveStar) {
    onPresetChange(RaidPresetMode.FiveStar);
  }
});
UIElements.RaidBoss.R6PresetButton.addEventListener( 'click',  () => {
  if ( currentPresetMode != RaidPresetMode.SixStar) {
    onPresetChange(RaidPresetMode.SixStar);
  }
});
UIElements.RaidBoss.R5EPresetButton.addEventListener( 'click',  () => {
  if ( currentPresetMode != RaidPresetMode.FiveStarEvent) {
    onPresetChange(RaidPresetMode.FiveStarEvent);
  }
});
UIElements.RaidBoss.R7EPresetButton.addEventListener( 'click',  () => {
  if ( currentPresetMode != RaidPresetMode.SevenStarEvent) {
    onPresetChange(RaidPresetMode.SevenStarEvent);
  }
});






function getRaidPreset( presetList : RaidBossPreset[], id : string ) {
  return presetList.find( item => item.speciesName == id );
}

function getSelectedBossPreset() {
  let preset : RaidBossPreset | undefined
  switch(currentPresetMode) {
    case RaidPresetMode.FiveStar: {
      preset = getRaidPreset( tier5RaidBossPresets, UIElements.RaidBoss.R5Select.value );
      break;
    }
    case RaidPresetMode.FiveStarEvent: {
      preset = getRaidPreset( tier5EventRaidBossPresets, UIElements.RaidBoss.R5ESelect.value );
      break;
    }
    case RaidPresetMode.SixStar:{
      preset = getRaidPreset( tier6RaidBossPresets, UIElements.RaidBoss.R6Select.value );
      break;
    }
    case RaidPresetMode.SevenStarEvent: {
      preset = getRaidPreset( tier7EventRaidBossPresets, UIElements.RaidBoss.R7ESelect.value );
      break;
    }
    default: preset = undefined;
  }

  return preset;
}

function setBossPresetMainMoves( raidBoss: RaidBossPreset ) {
    // Assign main moveset - Only if the respective slot is valid in the preset
    UIElements.RaidBoss.BossMove1.value = ( raidBoss.mainMoves.length > 0 ? raidBoss.mainMoves[0] : "(No Move)");
    UIElements.RaidBoss.BossMove2.value = ( raidBoss.mainMoves.length > 1 ? raidBoss.mainMoves[1] : "(No Move)");
    UIElements.RaidBoss.BossMove3.value = ( raidBoss.mainMoves.length > 2 ? raidBoss.mainMoves[2] : "(No Move)");
    UIElements.RaidBoss.BossMove4.value = ( raidBoss.mainMoves.length > 3 ? raidBoss.mainMoves[3] : "(No Move)");
}

function setBossPresetAddMoves( raidBoss: RaidBossPreset ) {
    // Assign additional moveset - Only if the respective slot is valid in the preset
    if ( raidBoss.addMoves != undefined ) {
      UIElements.RaidBoss.BossAddMove1.value = ( raidBoss.addMoves.length > 0 ? raidBoss.addMoves[0] : "(No Move)");
      UIElements.RaidBoss.BossAddMove2.value = ( raidBoss.addMoves.length > 1 ? raidBoss.addMoves[1] : "(No Move)");
      UIElements.RaidBoss.BossAddMove3.value = ( raidBoss.addMoves.length > 2 ? raidBoss.addMoves[2] : "(No Move)");
      UIElements.RaidBoss.BossAddMove4.value = ( raidBoss.addMoves.length > 3 ? raidBoss.addMoves[3] : "(No Move)");
    }
    // Otherwise reset additional moves
    else {//if ( currentPresetMode != RaidPresetMode.Custom ) {
      UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
      UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
      UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
      UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
    }
}

function setBossPresetMoves( raidBoss: RaidBossPreset ) {
  setBossPresetMainMoves( raidBoss );
  setBossPresetAddMoves( raidBoss );
}

function reselectPresetDefaults() {
  let preset : RaidBossPreset | undefined = getSelectedBossPreset();

  if ( preset == undefined ) { return; }

  let raidBoss : RaidBossPreset = preset;

  // Set general data
  UIElements.RaidBoss.BossTeraType.value = raidBoss.teraType as string;
  UIElements.RaidBoss.BossLevel.value = raidBoss.level.toString();
  UIElements.RaidBoss.BossNature.value = ( raidBoss.nature ? raidBoss.nature as string : 'Hardy' );
  UIElements.RaidBoss.BossNaturalAbilitySelect.value = raidBoss.ability;
  UIElements.RaidBoss.BossAllAbilitiesSelect.value = raidBoss.ability;

  // Fetch moves and place them in the UI
  setBossPresetMoves( raidBoss );

  // Set held item
  if ( preset.item != undefined ) {
    UIElements.RaidBoss.BossHeldItem.value = raidBoss.item!;
  }
  else {
    UIElements.RaidBoss.BossHeldItem.value = "";
  }

  // Set Extra Actions
  showExtraActions( preset.extraActions, UIElements.RaidBoss.BossActionTable );
}

function showExtraActions( actions: ExtraAction[] | undefined, table: HTMLTableElement ) {
  // Clear previous contents
  let actiontbody = table.tBodies[0];
  actiontbody.innerHTML = "";

  if ( actions ) {
    actions.forEach( (action) => {
      let actionRow = actiontbody.insertRow();  
      let actionDesc = createTableBodyCell( actionRow, action.description, 1);
      if ( action.description.startsWith("Move:")) {
        let move = gen.moves.get( toID(action.description.slice(6)));
        if ( move ) {
          setTypeBackgroundColor( actionDesc, move.type );
          actionDesc.textContent = move.name;
        }
        else {
          actionDesc.style.paddingLeft = "8px";
        }
      }
      else {
        actionDesc.style.paddingLeft = "8px";
        actionDesc.style.backgroundColor = "white";
      }

      // HP
      let hpCell = createTableBodyCell( actionRow, action.hp ? action.hp.toString() : "-", 1 );
      hpCell.style.textAlign = 'center';
      hpCell.style.backgroundColor = "white";

      // TIME
      let timeCell = createTableBodyCell( actionRow, action.time ? action.time.toString() : "-", 1 );
      timeCell.style.textAlign = 'center';
      timeCell.style.backgroundColor = "white";
    });
  }
  else {
    let defaultRow = actiontbody.insertRow();
    createTableBodyCell( defaultRow, "No extra actions", 3 ).style.textAlign = 'center';
  }
}

function overwriteStats() {
  let raidBossName: string;
  switch(currentPresetMode) {
    case RaidPresetMode.FiveStar: {
      raidBossName = UIElements.RaidBoss.R5Select.value;
      break;
    }
    case RaidPresetMode.FiveStarEvent: {
      raidBossName = UIElements.RaidBoss.R5ESelect.value;
      break;
    }
    case RaidPresetMode.SixStar:{
      raidBossName = UIElements.RaidBoss.R6Select.value;
      break;
    }
    case RaidPresetMode.SevenStarEvent: {
      raidBossName = UIElements.RaidBoss.R7ESelect.value;
      break;
    }
    case RaidPresetMode.Custom: {
      raidBossName = UIElements.RaidBoss.CustomSelect.value;
      break;
    }
    default: return;
  }

  selectedSpecies = gen.species.get( toID( raidBossName ) );
  
  UIElements.RaidBoss.BossHPBase.value = selectedSpecies?.baseStats.hp.toString()!;
  UIElements.RaidBoss.BossAtkBase.value = selectedSpecies?.baseStats.atk.toString()!;
  UIElements.RaidBoss.BossDefBase.value = selectedSpecies?.baseStats.def.toString()!;
  UIElements.RaidBoss.BossSpaBase.value = selectedSpecies?.baseStats.spa.toString()!;
  UIElements.RaidBoss.BossSpdBase.value = selectedSpecies?.baseStats.spd.toString()!;
  UIElements.RaidBoss.BossSpeBase.value = selectedSpecies?.baseStats.spe.toString()!;

  if ( currentPresetMode != RaidPresetMode.Custom ) {
  // #TODO: Add custom IVs / EVs to presets?
    UIElements.RaidBoss.BossHPIV.value = "31";
    UIElements.RaidBoss.BossAtkIV.value = "31";
    UIElements.RaidBoss.BossDefIV.value = "31";
    UIElements.RaidBoss.BossSpaIV.value = "31";
    UIElements.RaidBoss.BossSpdIV.value = "31";
    UIElements.RaidBoss.BossSpeIV.value = "31";

    UIElements.RaidBoss.BossHPEV.value = "0";
    UIElements.RaidBoss.BossAtkEV.value = "0";
    UIElements.RaidBoss.BossDefEV.value = "0";
    UIElements.RaidBoss.BossSpaEV.value = "0";
    UIElements.RaidBoss.BossSpdEV.value = "0";
    UIElements.RaidBoss.BossSpeEV.value = "0";

    UIElements.RaidBoss.BossAtkStage.value = "0";
    UIElements.RaidBoss.BossDefStage.value = "0";
    UIElements.RaidBoss.BossSpaStage.value = "0";
    UIElements.RaidBoss.BossSpdStage.value = "0";
    UIElements.RaidBoss.BossSpeStage.value = "0";

  }

  updateHPStat();
  updateAtkStat();
  updateDefStat();
  updateSpaStat();
  updateSpdStat();
  updateSpeStat();
}

function getImagePath(pokeName: string) {
  let path = "../assets/sprites/";
  let extension = ".png";
  return path + pokeName.toLowerCase() + extension;
}

function updateBossImage() {
  let bossName : string = "_unknown";

  switch ( currentPresetMode ) {
    case RaidPresetMode.Custom: bossName = UIElements.RaidBoss.CustomSelect.value; break;
    case RaidPresetMode.FiveStar: bossName = UIElements.RaidBoss.R5Select.value; break;
    case RaidPresetMode.FiveStarEvent: bossName = UIElements.RaidBoss.R5ESelect.value; break;
    case RaidPresetMode.SixStar: bossName = UIElements.RaidBoss.R6Select.value; break;
    case RaidPresetMode.SevenStarEvent: bossName = UIElements.RaidBoss.R7ESelect.value; break;
  }

  let fullPath = getImagePath( bossName );
  UIElements.RaidBoss.BossSprite.src = fullPath;
}

function reselectAbility() {
  let activeSelect : HTMLSelectElement | undefined = undefined;

  switch ( currentPresetMode ) {
    case RaidPresetMode.Custom: activeSelect = UIElements.RaidBoss.CustomSelect; break;
    case RaidPresetMode.FiveStar: activeSelect = UIElements.RaidBoss.R5Select; break;
    case RaidPresetMode.FiveStarEvent: activeSelect = UIElements.RaidBoss.R5ESelect; break;
    case RaidPresetMode.SixStar: activeSelect = UIElements.RaidBoss.R6Select; break;
    case RaidPresetMode.SevenStarEvent: activeSelect = UIElements.RaidBoss.R7ESelect; break;
  }

  let pokeIndex = FilteringData.filteringData.findIndex( item => item.name == ( activeSelect as HTMLSelectElement ).value );

  /* Remake the natural ability select */ 
  // Remove children
  UIElements.RaidBoss.BossNaturalAbilitySelect.innerHTML = "";

  // Add ability slot 1 (Always exists)
  const newOption1 = document.createElement('option');
  newOption1.value = FilteringData.filteringData[pokeIndex].abilities.slot1;
  newOption1.text = "1:" + FilteringData.filteringData[pokeIndex].abilities.slot1;
  UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOption1);

  // Add ability 2 if applicable
  if ( FilteringData.filteringData[pokeIndex].abilities.slot2 ) {
    const newOption2 = document.createElement('option');
    newOption2.value = FilteringData.filteringData[pokeIndex].abilities.slot2 as string;
    newOption2.text = "2:" + FilteringData.filteringData[pokeIndex].abilities.slot2 as string;
    UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOption2);
  }
  // Add hidden ability if applicable
  if ( FilteringData.filteringData[pokeIndex].abilities.h ) {
    const newOptionH = document.createElement('option');
    newOptionH.value = FilteringData.filteringData[pokeIndex].abilities.h as string;
    newOptionH.text = "H:" + FilteringData.filteringData[pokeIndex].abilities.h as string;
    UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionH);
  }

  /* Special ability checks:
  #TODO include this as part of the dataset and not hardcoded */
  if ( FilteringData.filteringData[pokeIndex].name == "Greninja") {
    const newOptionS = document.createElement('option');
    newOptionS.value = "Battle Bond";
    newOptionS.text = "S:" + "Battle Bond";
    UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionS);
  }
  if ( FilteringData.filteringData[pokeIndex].name == "Rockruff") {
    const newOptionS = document.createElement('option');
    newOptionS.value = "Own Tempo";
    newOptionS.text = "S:" + "Own Tempo";
    UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionS);
  }
}

UIElements.RaidBoss.CustomSelect.addEventListener( 'change', () => { updateBossImage(); reselectAbility(); reselectPresetDefaults(); overwriteStats(); } );
UIElements.RaidBoss.R5Select.addEventListener( 'change', () => { updateBossImage(); reselectAbility(); reselectPresetDefaults(); overwriteStats(); } );
UIElements.RaidBoss.R5ESelect.addEventListener( 'change', () => { updateBossImage(); reselectAbility(); reselectPresetDefaults(); overwriteStats(); } );
UIElements.RaidBoss.R6Select.addEventListener( 'change', () => { updateBossImage(); reselectAbility(); reselectPresetDefaults(); overwriteStats(); } );
UIElements.RaidBoss.R7ESelect.addEventListener( 'change', () => { updateBossImage(); reselectAbility(); reselectPresetDefaults(); overwriteStats(); });

if ( UIElements.RaidBoss.BossMove1 && UIElements.RaidBoss.BossMove2 &&
     UIElements.RaidBoss.BossMove3 && UIElements.RaidBoss.BossMove4 ) {
  let moveArray = [...gen.moves].map( item => item.name );

  moveArray.sort( (a,b) => {
    return a < b ? -1 : 1;
  });

  populateDropdown( UIElements.RaidBoss.BossMove1, moveArray );
  populateDropdown( UIElements.RaidBoss.BossMove2, moveArray );
  populateDropdown( UIElements.RaidBoss.BossMove3, moveArray );
  populateDropdown( UIElements.RaidBoss.BossMove4, moveArray );

  populateDropdown( UIElements.RaidBoss.BossAddMove1, moveArray );
  populateDropdown( UIElements.RaidBoss.BossAddMove2, moveArray );
  populateDropdown( UIElements.RaidBoss.BossAddMove3, moveArray );
  populateDropdown( UIElements.RaidBoss.BossAddMove4, moveArray );  
}


/*Refresh/Clear moves */
UIElements.RaidBoss.BossMoveDefaultButton.addEventListener('click', () => {
  let preset = getSelectedBossPreset();
  if ( preset != undefined ) {
    setBossPresetMainMoves( preset );
  }
  else {
    UIElements.RaidBoss.BossMove1.value = "(No Move)";
    UIElements.RaidBoss.BossMove2.value = "(No Move)";
    UIElements.RaidBoss.BossMove3.value = "(No Move)";
    UIElements.RaidBoss.BossMove4.value = "(No Move)";
  }
});
UIElements.RaidBoss.BossAddMoveDefaultButton.addEventListener('click', () => {
  let preset = getSelectedBossPreset();
  if ( preset != undefined ) {
    setBossPresetAddMoves( preset );
  }
  else {
    UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
  }
});

UIElements.Header.focusTableButton.addEventListener('click', () => {
    // Automatically scroll to the table
    let fullTable = document.getElementById('resultTableContents') as HTMLDivElement;
    if ( fullTable ) {
      fullTable.scrollIntoView({ behavior: 'smooth' });
    }
});

/*Expand/Collapse Advanced Search parameters*/
UIElements.Header.advancedModeToggle.addEventListener('click', () => {
    if ( UIElements.SearchParams.SearchParamContainer ) {
      UIElements.SearchParams.SearchParamContainer.classList.toggle('collapsed');
    }
});

/*Perform search and apply results*/
UIElements.Header.calculateButton.addEventListener('click', function handleClick(event) {
  const cooldownEffect = document.getElementById('searchCooldownEffect') as HTMLDivElement;

  UIElements.Header.calculateButton.disabled = true;
  cooldownEffect.style.display = 'block';

  performRaidSearch();

  setTimeout(() => {
    UIElements.Header.calculateButton.disabled = false;
    cooldownEffect.style.display = 'none';
  }, 3000 );
});

function performRaidSearch() {
  // Time elapsed profiling
  const startTime = new Date().getTime();

  // Read all search parameters
  const rankingParameters = readSearchParameters();

  // Verify if moves are valid
  const mainMoves : Move[] = readBossMainMoveset(rankingParameters);

  // Quit if no moves are selected
  if ( mainMoves.length == 0 ) {
    alert('Must select at least one move in the main moveset!');
    return;
  }
  // If selected moves are valid then we can proceed

  // Read the extra moves
  const extraMoves : Move[] = readBossExtraMoves( rankingParameters );

  UIElements.Results.SearchSummary.textContent = '';

  // Prepare data (#TODO: Read all data from webpage inputs)
  const raidBoss = readRaidBossParameters();
  let field = readFieldParameters();

  // Send data into the raid ranking function
  const rankResultData = Ranking.raidDefenderRanking( gen, raidBoss, mainMoves, extraMoves, field, rankingParameters);

  currentSearchResult = new SearchResult( rankResultData );
  currentSearchResult.filteredData = currentSearchResult.rankingData.originalData;

  currentSearchResult.itemsPerPage = Number.parseInt( UIElements.Results.ResultItemsPerPageSelect.value );
  currentSearchResult.currentPage = 1;
  updatePaging( currentSearchResult );
  
  // Build table from results
  if ( UIElements.Results.ResultsTable ) {
    // Populate table head

    // Create table head with info
    createResultTableHead( currentSearchResult );

    // Create table head with currently viewable entries
    createResultTableEntries( currentSearchResult, 1 );

    // Show notable settings and effects
    updateEffectsInfo( currentSearchResult );
    hidePSFInfo();

    // Boss Summary
    createBossInfoSummary( currentSearchResult, getPresetModeString( currentPresetMode ) );

    // Unhide PSF Container (Hidden when the website first opens)
    UIElements.Results.PSFContainer.classList.remove('collapsed');

    // Summarize search into heading
    try {
      //searchSummary.textContent = raidBoss.name + " (Lv. " + raidBoss.level + ") Ability: " +  raidBoss.ability + " Nature: " + raidBoss.nature + " | TERA: " + raidBoss.teraType + ' | Raid Boss   VS   Generation 9';

      // Determine time elapsed since beginning of ranking operation
      const elapsed = (new Date().getTime())-startTime;
      UIElements.Results.SearchSummary.textContent += 'Execution time: ' + (elapsed/1000).toFixed(3) + "s" + " | Calculated: " + rankResultData.entriesAnalyzed.toString() + " | Skipped: " + rankResultData.entriesSkipped.toString();
    }
    catch(e: any) {
      UIElements.Results.SearchSummary.textContent = "Exception";
    }

    // Automatically scroll to the table
    if ( UIElements.Results.FullTable ) {
      UIElements.Results.FullTable.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function createResultTableHead( search: SearchResult ) {
  // Retrieve and clear the table head
  const thead = UIElements.Results.ResultsTable.getElementsByTagName('thead')[0];
  thead.innerHTML = '';

  // 1st head row (parameter sets)
  const hrow1 = thead.insertRow();
  // 2nd head row (specific data)
  const hrow2 = thead.insertRow();

  // Create 'Raid Counter' group
  createTableHeadCell(hrow2,'Ranking');
  createTableHeadCell(hrow2,'Pokemon');

  // Shortcut variables to the original data
  let rankingParameters = search.rankingData.originalParameters;
  let useExtraMoves = rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ||
  rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolSelect;
  let movepool = (useExtraMoves ? search.rankingData.extraMoves : search.rankingData.mainMoves );

  let raidCounterColspan = 1;
  if ( rankingParameters.advanced.defenderTeraType != '' ) {
    raidCounterColspan = 3;
    createTableHeadCell(hrow1,'Raid Counter', 3).classList.add('Limiter', 'TopRow');
    createTableHeadCell(hrow2,'Tera Type').classList.add('Limiter');
  }
  else {
    raidCounterColspan = 4;
    createTableHeadCell(hrow1,'Raid Counter', 4).classList.add('Limiter', 'TopRow');
    createTableHeadCell(hrow2,'Type 1');
    createTableHeadCell(hrow2,'Type 2').classList.add('Limiter');
  }
  
  // Create 'Best Move' group
  let bestMoveSize = 0;
  if ( rankingParameters.results.moveDamageVisibility != PrintVisibleDamage.MainMoveBoth && rankingParameters.results.moveDamageVisibility != PrintVisibleDamage.MainMoveSelect ) {
    bestMoveSize = 2;
  }
  let bestMoveBoth = false;
  if ( rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMoveBoth || rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BothMoveBoth ||
    rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ) {
    bestMoveBoth = true;
    bestMoveSize++;
  }
  if ( bestMoveSize > 0 ) {
    createTableHeadCell(hrow1,'Best Move', bestMoveSize ).classList.add('Limiter', 'TopRow');

    createTableHeadCell(hrow2,'Move', 1 );
    createTableHeadCell(hrow2,'Damage', ( bestMoveSize == 3 ? 2 : 1 ) ).classList.add('Limiter');
  }
  
  let mainMoveSize = 0;
  if ( rankingParameters.results.moveDamageVisibility != PrintVisibleDamage.BestMoveBoth && rankingParameters.results.moveDamageVisibility != PrintVisibleDamage.BestMoveSelect ) {
    mainMoveSize = movepool.length;
  }
  let mainMoveBoth = false;
  if ( rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.MainMoveBoth || rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BothMoveBoth ||
    rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ) {
    mainMoveBoth = true;
    mainMoveSize *= 2;
  }
  
  if ( mainMoveSize > 0 ) {
    let movepoolTitle = (useExtraMoves ? 'Extra Moves' : 'Main Movepool');
    createTableHeadCell(hrow1, movepoolTitle, mainMoveSize ).classList.add('Limiter', 'TopRow');

    for ( let m = 0; m < movepool.length; ++m ) {
      let moveCell = createTableHeadCell(hrow2, movepool[m].name, mainMoveBoth? 2 : 1 );
      // Add limiter if last move
      if ( m == movepool.length-1) {
        moveCell.classList.add('Limiter')
      }
    }
  }

  let infoDetailsColspan = rankingParameters.results.showIfOutspeed ? 3 : 2;
  createTableHeadCell( hrow1, "Info & Details", infoDetailsColspan ).classList.add('TopRow');
  createTableHeadCell( hrow2, "EV Spread");
  if ( rankingParameters.results.showIfOutspeed ) {
    createTableHeadCell( hrow2, "Outspeed?");
  }
  createTableHeadCell( hrow2, "Effects & Modifiers");

  search.mainMoveBoth = mainMoveBoth;
  search.mainMoveSize = mainMoveSize;

  search.bestMoveBoth = bestMoveBoth;
  search.bestMoveSize = bestMoveSize;

  search.maxColspan = raidCounterColspan + mainMoveSize + bestMoveSize + infoDetailsColspan;
}

function updatePaging( search: SearchResult ) {
  // Delete all existing options
  UIElements.Results.ResultPageSelect.innerHTML = "";

  // Calc number of pages
  let numPages = Math.ceil( search.filteredData.length / search.itemsPerPage );
  UIElements.Results.ResultTotalPages.textContent = `/ ${numPages}`;

  // Remake options, one per page
  for ( let i = 1; i <= numPages; ++i ) {
    const newOption = document.createElement('option');
    newOption.value = i.toString();
    newOption.text = i.toString();
    UIElements.Results.ResultPageSelect.add(newOption);
  }

  // Default to page 1
  UIElements.Results.ResultPageSelect.value = "1";
}

function createResultTableEntries( search: SearchResult, page: number ) {
  // Get the tbody and clear it
  const tbody = UIElements.Results.ResultsTable.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  // #TODO: Change to filtered data when implemented
  let rankResultData = search.filteredData;
  let rankingParameters = search.rankingData.originalParameters;

  let useExtraMoves = rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ||
  rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolSelect;
  let mainMoves = search.rankingData.mainMoves;

  // Update viewable entries and limits
  search.currentPage = page;
  let startItem = ( page - 1 ) * search.itemsPerPage;
  let endItem = Math.min( startItem + search.itemsPerPage, rankResultData.length );

  if ( rankResultData.length > 0 ) {
    // GENERATE TABLE BODY WITH RESULTS
    for ( let rr = startItem; rr < endItem; ++rr ) {

      let result = rankResultData[rr];
    
      // Insert new row and take the cells
      const row = tbody.insertRow();
      const cellRank = row.insertCell(); // Ranking
      const cellSpecies = row.insertCell(); // Pokemon species
      if ( rankingParameters.advanced.defenderTeraType == '' ) {
        const cellType1 = row.insertCell(); // Type 1
        const cellType2 = row.insertCell(); // Type 2
        cellType1.textContent = result.type1;
        cellType2.textContent = result.type2;
        cellType2.classList.add('Limiter');
        setTypeBackgroundColor( cellType1, result.type1 );
        setTypeBackgroundColor( cellType2, result.type2 );
      }
      else {
        const cellTeraType = row.insertCell(); // Type Tera
        cellTeraType.classList.add('Limiter');
        cellTeraType.textContent = rankingParameters.advanced.defenderTeraType;
        setTypeBackgroundColor( cellTeraType, rankingParameters.advanced.defenderTeraType );
      }

      if ( search.bestMoveSize > 0 ) {
        const cellBestMove = row.insertCell(); // Best Move
        cellBestMove.textContent = mainMoves[result.maxDamageIndex].name;
        const cellBestDmg = row.insertCell(); // Best Move Dmg
        let maxDamage = result.getMaxDamagePercent() * 100;
        cellBestDmg.textContent = (maxDamage).toFixed(2) + '%';
        cellBestDmg.classList.add('Righthand');

        /*let simpleRedLerp = Math.round( 255 * ( Math.max( Math.min(maxDamage, 100), 0 )/100 ) );
        let simpleGreenLerp = Math.round( 255 * ((100 - Math.max( Math.min(maxDamage, 100), 0 ))/100) );
        let colorString = `rgb(${simpleRedLerp},${simpleGreenLerp},0)`;
        cellBestDmg.style.backgroundColor = colorString;*/
        
        setDamageBackgroundColor( cellBestDmg, maxDamage );
        // Placeholder for other damage value
        if ( search.bestMoveBoth ) {
          const cellBestSec = row.insertCell();
          let maxSecDamage = result.getMaxDamageSecPercent() * 100;
          cellBestSec.textContent = (maxSecDamage).toFixed(2) + '%';
          setDamageBackgroundColor( cellBestSec, maxSecDamage );
          cellBestSec.classList.add('Righthand','Limiter');
        }
        else {
          cellBestDmg.classList.add('Limiter');
        }
      }

      if ( search.mainMoveSize > 0  ) {

        if ( useExtraMoves ) {
          let extraMoves = search.rankingData.extraMoves;
          for ( let moveIndex = 0; moveIndex < extraMoves.length; ++moveIndex ) {
            const moveCell = row.insertCell();

            let damageValue = result.extraDamage[moveIndex].hpPercent * 100;
            moveCell.textContent = damageValue.toFixed(2) + '%';
            setDamageBackgroundColor( moveCell, damageValue );

            moveCell.classList.add('Righthand');

            // Placeholder for other damage value
            if ( search.mainMoveBoth ) {
              const moveCell2nd = row.insertCell();

              let secDamageValue = result.secondaryExtraDamage[moveIndex].hpPercent * 100;
              moveCell2nd.textContent = secDamageValue.toFixed(2) + '%';
              setDamageBackgroundColor( moveCell2nd, secDamageValue );
              moveCell2nd.classList.add('Righthand');

              if ( moveIndex == (extraMoves.length-1)) {
                moveCell2nd.classList.add('Limiter');
              }
            }
            else if ( moveIndex == (extraMoves.length-1)) {
              moveCell.classList.add('Limiter');
            }
          }
        }
        else {
          for ( let moveIndex = 0; moveIndex < mainMoves.length; ++moveIndex ) {
            const moveCell = row.insertCell();

            let damageValue = result.damage[moveIndex].hpPercent * 100;
            moveCell.textContent = damageValue.toFixed(2) + '%';
            setDamageBackgroundColor( moveCell, damageValue );

            moveCell.classList.add('Righthand');

            // Placeholder for other damage value
            if ( search.mainMoveBoth ) {
              const moveCell2nd = row.insertCell();

              let secDamageValue = result.secondaryDamage[moveIndex].hpPercent * 100;
              moveCell2nd.textContent = secDamageValue.toFixed(2) + '%';
              setDamageBackgroundColor( moveCell2nd, secDamageValue );
              moveCell2nd.classList.add('Righthand');

              if ( moveIndex == (mainMoves.length-1)) {
                moveCell2nd.classList.add('Limiter');
              }
            }
            else if ( moveIndex == (mainMoves.length-1)) {
              moveCell.classList.add('Limiter');
            }
          }
        }
      }
      
      // Populate data
      cellRank.textContent = result.finalRank.toString();// (rr+1).toString();
      if (rankingParameters.results.showSprites ) {
        let path = getImagePath( result.species );
        cellSpecies.innerHTML = `<div class=\"table-sprite-div\"><img src=\"${path}\" width=\"32\" height=\"32\">${result.species}</div>`
      }
      else {
        cellSpecies.textContent = result.species;
      }

      const cellEvSpread = row.insertCell(); // EV Spread (Leftover)
      cellEvSpread.textContent = stringFromEVSpread( result.nature, result.evSpread );
      if ( rankingParameters.results.showLeftoverEVs ) {
        let spread = new EVSpread( result.nature, result.evSpread );
        cellEvSpread.textContent += ' (' + spread.getUnallocatedEVs() + ')';
      }

      if ( rankingParameters.results.showIfOutspeed ) {
        const cellOutspeed = row.insertCell(); // Outspeed?
        cellOutspeed.textContent = ( result.outspeed ? 'Y' : 'N' );
        setValidBackgroundColor( cellOutspeed, result.outspeed );
      }

      const cellEffects = row.insertCell(); // Effects & modifiers
      cellEffects.textContent = result.getListOfModifiers();
    }
  }
  else {
    // Insert new row and take the cells
    const row = tbody.insertRow();
    createTableBodyCell( row, "All results were filtered!", search.maxColspan ).classList.add("NoResults");
  }
}

function updateEffectsInfo( search: SearchResult ) {
  let infoPanel = UIElements.Results.InfoEffectsAndSettings;
  infoPanel.textContent = "EV Method: " + search.rankingData.originalParameters.search.rankingType.toString();
  let bossSide : string[] = [];
  if ( search.rankingData.originalField.attackerSide.isFocusEnergy ) {
    bossSide.push("Focus Energy");
  }
  if ( search.rankingData.originalField.attackerSide.isTailwind ) {
    bossSide.push('Tailwind');
  }
  let defenderSide : string[] = [];
  if ( search.rankingData.originalField.defenderSide.isDefenseCheer ) {
    defenderSide.push("Defense Cheer");
  }
  if ( search.rankingData.originalField.defenderSide.isAuroraVeil ) {
    defenderSide.push('Aurora Veil');
  }
  else {
    if ( search.rankingData.originalField.defenderSide.isReflect ) {
      defenderSide.push('Reflect');
    }
    if ( search.rankingData.originalField.defenderSide.isLightScreen ) {
      defenderSide.push('Light Screen');
    }
  }
  if ( search.rankingData.originalField.defenderSide.isTailwind ) {
    defenderSide.push('Tailwind');
  }
  if ( bossSide.length > 0 ) {
    infoPanel.textContent += " | Boss: " + bossSide.join(", ");
  }
  if ( defenderSide.length > 0 ) {
    infoPanel.textContent += " | Defender: " + defenderSide.join(", ");
  }
  UIElements.Results.InfoEffectsAndSettings.classList.remove('collapsed');
  //if ( search.rankingData.)
  // EV Method, Focus Energy, Defense Cheer, Reflect, Light Screen, Aurora Veil, Tailwind
}

function hidePSFInfo() {
  UIElements.Results.InfoFilters.classList.add('collapsed');
}
function showPSFInfo() {
  UIElements.Results.InfoFilters.classList.remove('collapsed');
}

function createBossInfoSummary( search: SearchResult, preset: string )  {
  UIElements.Results.BossInfoContainer.classList.remove('collapsed');

  UIElements.Results.BossInfoPreset.textContent = preset;
  UIElements.Results.BossInfoSpecies.textContent = search.rankingData.raidBoss.name;
  UIElements.Results.BossInfoSprite.src = getImagePath( search.rankingData.raidBoss.name );

  // Remove any previous type coloring
  UIElements.Results.BossInfoTeraType.classList.forEach( className => {
    if ( className.includes('-type')) {
      UIElements.Results.BossInfoTeraType.classList.remove(className);
    }
  });
  UIElements.Results.BossInfoTeraType.textContent = "Tera " + search.rankingData.raidBoss.teraType!;
  setTypeBackgroundColor( UIElements.Results.BossInfoTeraType, search.rankingData.raidBoss.teraType!)

  UIElements.Results.BossInfoLevel.textContent = search.rankingData.raidBoss.level.toString();
  UIElements.Results.BossInfoItem.textContent = ( search.rankingData.raidBoss.item ? search.rankingData.raidBoss.item : "-None-" );
  UIElements.Results.BossInfoNature.textContent = search.rankingData.raidBoss.nature;
  UIElements.Results.BossInfoAbility.textContent = ( search.rankingData.raidBoss.ability ? search.rankingData.raidBoss.ability : "-None-" );
  
  UIElements.Results.BossInfoHPValue.textContent = ( search.rankingData.raidBoss.stats.hp * search.rankingData.originalParameters.hpMultiplier ).toString();
  UIElements.Results.BossInfoAtkValue.textContent = search.rankingData.raidBoss.stats.atk.toString();
  UIElements.Results.BossInfoDefValue.textContent = search.rankingData.raidBoss.stats.def.toString();
  UIElements.Results.BossInfoSpaValue.textContent = search.rankingData.raidBoss.stats.spa.toString();
  UIElements.Results.BossInfoSpdValue.textContent = search.rankingData.raidBoss.stats.spd.toString();
  UIElements.Results.BossInfoSpeValue.textContent = search.rankingData.raidBoss.stats.spe.toString();

  /* MAIN MOVESET */
  clearTypeBackground(UIElements.Results.BossInfoMain1);
  clearTypeBackground(UIElements.Results.BossInfoMain2);
  clearTypeBackground(UIElements.Results.BossInfoMain3);
  clearTypeBackground(UIElements.Results.BossInfoMain4);

  UIElements.Results.BossInfoMain1.textContent = search.rankingData.mainMoves[0].name;
  colorBossInfoMove(UIElements.Results.BossInfoMain1, search.rankingData.mainMoves[0], search.rankingData.raidBoss );
  if ( search.rankingData.mainMoves.length >= 2 ) {
    UIElements.Results.BossInfoMain2.textContent = search.rankingData.mainMoves[1].name;
    colorBossInfoMove(UIElements.Results.BossInfoMain2, search.rankingData.mainMoves[1], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoMain2.textContent = "-";
  }
  if ( search.rankingData.mainMoves.length >= 3 ) {
    UIElements.Results.BossInfoMain3.textContent = search.rankingData.mainMoves[2].name;
    colorBossInfoMove(UIElements.Results.BossInfoMain3, search.rankingData.mainMoves[2], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoMain3.textContent = "-";
  }
  if ( search.rankingData.mainMoves.length >= 4 ) {
    UIElements.Results.BossInfoMain4.textContent = search.rankingData.mainMoves[3].name;
    colorBossInfoMove(UIElements.Results.BossInfoMain4, search.rankingData.mainMoves[3], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoMain4.textContent = "-";
  }

  /* EXTRA MOVES */
  clearTypeBackground(UIElements.Results.BossInfoExtra1);
  clearTypeBackground(UIElements.Results.BossInfoExtra2);
  clearTypeBackground(UIElements.Results.BossInfoExtra3);
  clearTypeBackground(UIElements.Results.BossInfoExtra4);

  if ( search.rankingData.extraMoves.length >= 1 ) {
    UIElements.Results.BossInfoExtra1.textContent = search.rankingData.extraMoves[0].name;
    colorBossInfoMove(UIElements.Results.BossInfoExtra1, search.rankingData.extraMoves[0], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoExtra1.textContent = "-";
  }
  if ( search.rankingData.extraMoves.length >= 2 ) {
    UIElements.Results.BossInfoExtra2.textContent = search.rankingData.extraMoves[1].name;
    colorBossInfoMove(UIElements.Results.BossInfoExtra2, search.rankingData.extraMoves[1], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoExtra2.textContent = "-";
  }
  if ( search.rankingData.extraMoves.length >= 3 ) {
    UIElements.Results.BossInfoExtra3.textContent = search.rankingData.extraMoves[2].name;
    colorBossInfoMove(UIElements.Results.BossInfoExtra3, search.rankingData.extraMoves[2], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoExtra3.textContent = "-";
  }
  if ( search.rankingData.extraMoves.length >= 4 ) {
    UIElements.Results.BossInfoExtra4.textContent = search.rankingData.extraMoves[3].name;
    colorBossInfoMove(UIElements.Results.BossInfoExtra4, search.rankingData.extraMoves[3], search.rankingData.raidBoss );
  }
  else {
    UIElements.Results.BossInfoExtra4.textContent = "-";
  }

  /* Show if boss is burned */
  if ( search.rankingData.raidBoss.status == 'brn') {
    UIElements.Results.BossInfoBurned.classList.remove('collapsed');
  }
  else {
    UIElements.Results.BossInfoBurned.classList.add('collapsed');
  }

  /* Show action table */
  if ( currentPresetMode == RaidPresetMode.Custom ) {
    UIElements.Results.BossInfoExtraSection.classList.add('collapsed');
  }
  else {
    showExtraActions( getSelectedBossPreset()?.extraActions, UIElements.Results.BossInfoExtraTable );
    UIElements.Results.BossInfoExtraSection.classList.remove('collapsed');
  }
}
function clearTypeBackground( element: HTMLElement ) {
  element.classList.forEach( className => {
    if ( className.includes('-type')) {
      element.classList.remove(className);
    }
  });
}
function colorBossInfoMove( moveElement: HTMLElement, move: Move, boss: Pokemon ) {
  // Set background color matching the type
  if ( move.name == "Tera Blast") {
    setTypeBackgroundColor( moveElement, boss.teraType! );
  }
  else {
    setTypeBackgroundColor( moveElement, move.type );
  }
}

function retrievePokemonSpecies() : string {
  switch( currentPresetMode ) {
    case RaidPresetMode.Custom: return UIElements.RaidBoss.CustomSelect.value;
    case RaidPresetMode.FiveStar: return UIElements.RaidBoss.R5Select.value;
    case RaidPresetMode.FiveStarEvent: return UIElements.RaidBoss.R5ESelect.value;
    case RaidPresetMode.SixStar: return UIElements.RaidBoss.R6Select.value;
    case RaidPresetMode.SevenStarEvent: return UIElements.RaidBoss.R7ESelect.value;
  }

  return "";
}

// #TODO: Implement in full
function readRaidBossParameters() {
  let ivs: StatsTable<number> = {
    hp: UIElements.RaidBoss.BossHPIV.valueAsNumber,
    atk: UIElements.RaidBoss.BossAtkIV.valueAsNumber,
    def: UIElements.RaidBoss.BossDefIV.valueAsNumber,
    spa: UIElements.RaidBoss.BossSpaIV.valueAsNumber,
    spd: UIElements.RaidBoss.BossSpdIV.valueAsNumber,
    spe: UIElements.RaidBoss.BossSpeIV.valueAsNumber
  };
  let evs: StatsTable<number> = {
    hp: UIElements.RaidBoss.BossHPEV.valueAsNumber,
    atk: UIElements.RaidBoss.BossAtkEV.valueAsNumber,
    def: UIElements.RaidBoss.BossDefEV.valueAsNumber,
    spa: UIElements.RaidBoss.BossSpaEV.valueAsNumber,
    spd: UIElements.RaidBoss.BossSpdEV.valueAsNumber,
    spe: UIElements.RaidBoss.BossSpeEV.valueAsNumber
  };
  let boosts = {
    atk: UIElements.RaidBoss.BossAtkStage.valueAsNumber,
    def: UIElements.RaidBoss.BossDefStage.valueAsNumber,
    spa: UIElements.RaidBoss.BossSpaStage.valueAsNumber,
    spd: UIElements.RaidBoss.BossSpdStage.valueAsNumber,
    spe: UIElements.RaidBoss.BossSpeStage.valueAsNumber
  };

  let status : undefined | 'brn' = ( UIElements.RaidBoss.BossStatus.value == "" ? undefined : 'brn' );

  return new Pokemon( gen, retrievePokemonSpecies(), {
    level: UIElements.RaidBoss.BossLevel.valueAsNumber,
    nature: UIElements.RaidBoss.BossNature.value,
    ivs: ivs,
    evs: evs,
    item: UIElements.RaidBoss.BossHeldItem.value,
    teraType: (UIElements.RaidBoss.BossTeraType.value as TypeName),
    ability: readBossSelectedAbility(),
    boosts: boosts,
    status: status,
    boostedStat: 'auto'
  });
}

function readBossMainMoveset(parameters: RankingParameters) {

  // Prevent dupes with set
  let inputValues : Set<string>= new Set<string>();

  inputValues.add( UIElements.RaidBoss.BossMove1.value );
  inputValues.add( UIElements.RaidBoss.BossMove2.value );
  inputValues.add( UIElements.RaidBoss.BossMove3.value );
  inputValues.add( UIElements.RaidBoss.BossMove4.value );

  // Remove "(No Move)" entry
  inputValues.delete("(No Move)");

  return analyzeMoveInputs(inputValues,false);
}
function readBossExtraMoves(parameters: RankingParameters) {

  // Prevent dupes with set
  let inputValues : Set<string>= new Set<string>();

  inputValues.add( UIElements.RaidBoss.BossAddMove1.value );
  inputValues.add( UIElements.RaidBoss.BossAddMove2.value );
  inputValues.add( UIElements.RaidBoss.BossAddMove3.value );
  inputValues.add( UIElements.RaidBoss.BossAddMove4.value );

  // Remove "(No Move)" entry
  inputValues.delete("(No Move)");

  return analyzeMoveInputs(inputValues, true);
}

function analyzeMoveInputs( inputMoves : Set<string>, useSpread : boolean ) {
  let moves : Move[] = [];
  for ( let value of inputMoves ) {
    // Special case for Shell Side Arm
    // Must be divided into physical and special only versions for the purposes of stat optimization
    if ( value == "Shell Side Arm") {
      let moveP = new Move(gen, value+"(P)");
      let moveS = new Move(gen, value+"(S)");
      moves.push(moveP);
      moves.push(moveS);
    }
    else {
      let move = new Move(gen, value );

      if ( useSpread ) {
        move.forceDamageSpread = true;
      }

      // Apply move settings
      if ( move.hits > 1 ) {
        let moveData =  gen.moves.get( toID(move.name) );
        if ( moveData ) {
          if ( Array.isArray(moveData.multihit) ) {
            // 2-to-5 moves
            if ( moveData.multihit[0]== 2 && moveData.multihit[1] == 5 ) {
              move.hits = Number.parseInt( UIElements.SearchParams.MoveMultiStrike2to5.value );
            }
          }
          else if ( move.name == 'Population Bomb') {
            move.hits = Number.parseInt( UIElements.SearchParams.MoveMultiStrikePopulationBomb.value );
          }
        }
        //if ( move.named( ''))
      }

      moves.push( move );
    }
  }
  return moves;
}

// TODO: Implement in full
function readFieldParameters() {

  let pTerrain: Terrain | undefined;
  switch( UIElements.SearchParams.FieldTerrainSelect.value ) {
    case 'Electric' : pTerrain = 'Electric'; break;
    case 'Psychic': pTerrain = 'Psychic'; break;
    case 'Misty': pTerrain = 'Misty'; break;
    case 'Grassy': pTerrain = 'Grassy'; break;
      default: pTerrain = undefined;
  }
  let pWeather: Weather | undefined;
  switch( UIElements.SearchParams.FieldWeatherSelect.value ) {
    case 'Sun' : pWeather = 'Sun'; break;
    case 'Rain': pWeather = 'Rain'; break;
    case 'Snow': pWeather = 'Snow'; break;
    case 'Sand': pWeather = 'Sand'; break;
      default: pWeather = undefined;
  }

  let gravity = UIElements.SearchParams.FieldGravity.checked;
  let wonderRoom = UIElements.SearchParams.FieldWonderRoom.checked;
  let magicRoom = UIElements.SearchParams.FieldMagicRoom.checked;
  //let trickRoom = parameterFieldTrickRoom.checked;

  let tabletsOfRuin = UIElements.SearchParams.FieldTabletsOfRuin.checked;
  let vesselOfRuin = UIElements.SearchParams.FieldVesselOfRuin.checked;
  let swordsOfRuin = UIElements.SearchParams.FieldSwordOfRuin.checked;
  let beadsOfRuin = UIElements.SearchParams.FieldBeadsOfRuin.checked;

  let newField = new Field( {
    terrain: pTerrain,
    weather: pWeather,
    isGravity: gravity,
    isWonderRoom: wonderRoom,
    isMagicRoom: magicRoom,
    isTabletsOfRuin: tabletsOfRuin,
    isVesselOfRuin: vesselOfRuin,
    isSwordOfRuin: swordsOfRuin,
    isBeadsOfRuin: beadsOfRuin
  } );

  // Attacker side (Raid Boss) parameters
  newField.attackerSide.isTailwind = UIElements.SearchParams.FieldBossTailwind.checked;
  newField.attackerSide.isFocusEnergy = UIElements.SearchParams.FieldBossFocusEnergy.checked;

  // Defender side (Raid Counters) parameters
  newField.defenderSide.isDefenseCheer = UIElements.SearchParams.FieldDefenderDefCheer.checked;
  newField.defenderSide.isReflect = UIElements.SearchParams.FieldDefenderReflect.checked;
  newField.defenderSide.isLightScreen = UIElements.SearchParams.FieldDefenderLightScreen.checked;
  newField.defenderSide.isAuroraVeil = UIElements.SearchParams.FieldDefenderAuroraVeil.checked;
  newField.defenderSide.isTailwind = UIElements.SearchParams.FieldDefenderTailwind.checked;

  newField.gameType = 'TeraRaid';

  return newField;
}


function readSearchParameters() {
  let parameters = new RankingParameters();

  parameters.hpMultiplier = Number.parseInt(UIElements.RaidBoss.BossHPMultiplier.value);

  // Read all inputs from the front end
  parameters.search.rankingType =
    SearchRankingType[ UIElements.MainParams.parameterSearchType.value as keyof typeof SearchRankingType ];
  parameters.search.isRankByCritical = UIElements.MainParams.parameterSearchDamageRank.value == 'C';
  parameters.search.defNaturePreferenceNonPQ =
    DefensiveNaturePreference[ UIElements.MainParams.parameterSearchDefNaturePref.value as keyof typeof DefensiveNaturePreference ];
  parameters.search.defNaturePreferencePQ =
    DefensiveNaturePreference[ UIElements.MainParams.parameterSearchDefNaturePrefPQ.value as keyof typeof DefensiveNaturePreference ];

  // Read filter parameters
  let evoFilter = UIElements.SearchParams.FilterNFE.value;
  switch ( evoFilter ) {
    case "NFE" : parameters.filters.skipFinalEvolutions = true; break;
    case "FE"  : parameters.filters.skipNonFinalEvolutions = true; break;
  }

  // If whitelist is populated
  if ( UIElements.SearchParams.FilterWhitelist.childElementCount > 0 ) {
    for ( let index = 0; index < UIElements.SearchParams.FilterWhitelist.childElementCount; ++index ) {
      parameters.filters.whiteListIDs.push( (UIElements.SearchParams.FilterWhitelist.children[index] as HTMLElement).dataset.originalValue! );
    } 
  }
  
  parameters.filters.checkOnlySTABDefenders = UIElements.SearchParams.FilterSTAB.checked;

  parameters.filters.showRegularPokemon = UIElements.SearchParams.FilterRarityRegular.checked;
  parameters.filters.showParadoxPokemon = UIElements.SearchParams.FilterRarityParadox.checked;
  parameters.filters.showLegendaryPokemon = UIElements.SearchParams.FilterRarityLegendary.checked;
  parameters.filters.showMythicalPokemon = UIElements.SearchParams.FilterRarityMythical.checked;
  parameters.filters.applyRarityFilter = !(( UIElements.SearchParams.FilterRarityRegular.checked == UIElements.SearchParams.FilterRarityParadox.checked )
    && ( UIElements.SearchParams.FilterRarityParadox.checked == UIElements.SearchParams.FilterRarityLegendary.checked )
    && ( UIElements.SearchParams.FilterRarityLegendary.checked == UIElements.SearchParams.FilterRarityMythical.checked ));

  parameters.filters.showPaldeaPokemon = UIElements.SearchParams.FilterDexPaldea.checked;
  parameters.filters.showTealMaskPokemon = UIElements.SearchParams.FilterDexTeal.checked;
  parameters.filters.showIndigoPokemon = UIElements.SearchParams.FilterDexIndigo.checked;
  parameters.filters.showHomePokemon = UIElements.SearchParams.FilterDexHOME.checked;
  parameters.filters.applyDexFilter = !(( UIElements.SearchParams.FilterDexPaldea.checked == UIElements.SearchParams.FilterDexTeal.checked )
    && ( UIElements.SearchParams.FilterDexTeal.checked == UIElements.SearchParams.FilterDexIndigo.checked )
    && ( UIElements.SearchParams.FilterDexIndigo.checked == UIElements.SearchParams.FilterDexHOME.checked ));

  // Ability parameters
  parameters.ability.disableAttackerAbility = UIElements.SearchParams.AbilityDisableBoss.checked;
  parameters.ability.disableDefenderAbility = UIElements.SearchParams.AbilityDisableDefender.checked;

  parameters.ability.activateTerrainSettingAbilities = UIElements.SearchParams.AbilityActivateTerrain.checked;
  parameters.ability.activateWeatherSettingAbilities = UIElements.SearchParams.AbilityActivateWeather.checked;
  //parameters.ability.forceTriggers = parameterAbilityForceTrigger.checked;

  parameters.ability.enableMultiscaleAndShadowShield = UIElements.SearchParams.AbilityMultiscale.checked;
  parameters.ability.enableTeraShell = UIElements.SearchParams.AbilityTeraShell.checked;
  parameters.ability.enableMarvelScale = UIElements.SearchParams.AbilityMarvelScale.checked;
  parameters.ability.enableGrassPelt = UIElements.SearchParams.AbilityGrassPelt.checked;
  parameters.ability.enableOpportunistStatCopy = UIElements.SearchParams.AbilityOpportunist.checked;
  parameters.ability.enableIntimidateStatDrop = UIElements.SearchParams.AbilityIntimidate.checked;
  parameters.ability.enableIntrepidSwordBoost = UIElements.SearchParams.AbilityIntrepidSword.checked;
  parameters.ability.enableDauntlessShieldBoost = UIElements.SearchParams.AbilityDauntlessShield.checked;
  parameters.ability.enableImposterTransform = UIElements.SearchParams.AbilityImposter.checked;
  parameters.ability.enableSlowStart = UIElements.SearchParams.AbilitySlowStart.checked;
  parameters.ability.enableNeutralizingGas = UIElements.SearchParams.AbilityNeutralizingGas.checked;
  parameters.ability.enableOrichalcumPulse = UIElements.SearchParams.AbilityOrichalcumPulse.checked;
  parameters.ability.enableDrought = UIElements.SearchParams.AbilityDrought.checked;
  parameters.ability.enableDrizzle = UIElements.SearchParams.AbilityDrizzle.checked;
  parameters.ability.enableSandStream = UIElements.SearchParams.AbilitySandStream.checked;
  parameters.ability.enableSnowWarning = UIElements.SearchParams.AbilitySnowWarning.checked;
  parameters.ability.enableHadronEngine = UIElements.SearchParams.AbilityHadronEngine.checked;
  parameters.ability.enableElectricSurge = UIElements.SearchParams.AbilityElectricSurge.checked;
  parameters.ability.enableGrassySurge = UIElements.SearchParams.AbilityGrassySurge.checked;
  parameters.ability.enablePsychicSurge = UIElements.SearchParams.AbilityPsychicSurge.checked;
  parameters.ability.enableMistySurge = UIElements.SearchParams.AbilityMistySurge.checked;
  parameters.ability.enableWaterAbsorb = UIElements.SearchParams.AbilityWaterAbsorb.checked;
  parameters.ability.enableDrySkin = UIElements.SearchParams.AbilityDrySkin.checked;
  parameters.ability.enableStormDrain = UIElements.SearchParams.AbilityStormDrain.checked;
  parameters.ability.enableVoltAbsorb = UIElements.SearchParams.AbilityVoltAbsorb.checked;
  parameters.ability.enableMotorDrive = UIElements.SearchParams.AbilityMotorDrive.checked;
  parameters.ability.enableLightningRod = UIElements.SearchParams.AbilityLightningRod.checked;
  parameters.ability.enableFlashFire = UIElements.SearchParams.AbilityFlashFire.checked;
  parameters.ability.enableSapSipper = UIElements.SearchParams.AbilitySapSipper.checked;
  parameters.ability.enableLevitate = UIElements.SearchParams.AbilityLevitate.checked;
  parameters.ability.enableQuarkDrive = UIElements.SearchParams.AbilityQuarkDrive.checked;
  parameters.ability.enableProtosynthesis = UIElements.SearchParams.AbilityProtosynthesis.checked;
  parameters.ability.enableAirLock = UIElements.SearchParams.AbilityAirLock.checked;


  parameters.ability.forceTriggerGrassPelt = UIElements.SearchParams.AbilityForceGrassPelt.checked;
  parameters.ability.forceTriggerMarvelScale = UIElements.SearchParams.AbilityForceMarvelScale.value;
  parameters.ability.forceTriggerQuarkDrive = UIElements.SearchParams.AbilityForceQuarkDrive.checked;
  parameters.ability.forceTriggerProtosynthesis = UIElements.SearchParams.AbilityForceProtosynthesis.checked;

  // Item Parameters
  parameters.items.disableBossItem = UIElements.SearchParams.ItemDisableBoss.checked;
  parameters.items.disableDefenderItem = UIElements.SearchParams.ItemDisableDefender.checked;
  parameters.items.giveEvioliteToNFE = UIElements.SearchParams.ItemEvioliteToNFE.checked;
  parameters.items.defaultAttackerItem = UIElements.SearchParams.ItemDefaultSelect.value;
  parameters.items.giveBoosterEnergytoPQ = UIElements.SearchParams.ItemBoosterEnergyToPQ.checked;

  // Advanced Parameters
  parameters.advanced.defenderTeraType = UIElements.MainParams.parameterDefenderTeraType.value;
  parameters.advanced.lockWeather = UIElements.SearchParams.FieldLockWeather.checked;
  parameters.advanced.lockTerrain = UIElements.SearchParams.FieldLockTerrain.checked;

  // Result Parameters
  let moveDamParam = Number.parseInt( UIElements.MainParams.parameterResultMoveDamage.value );
  let moveVisParam = Number.parseInt( UIElements.MainParams.parameterResultMoveVisibility.value );
  parameters.results.moveDamageVisibility = ( moveDamParam + moveVisParam );

  parameters.results.showSprites = UIElements.MainParams.parameterResultShowSprites.checked;
  parameters.results.showIfOutspeed = UIElements.MainParams.parameterResultShowOutspeed.checked;
  parameters.results.showLeftoverEVs = UIElements.MainParams.parameterResultShowLeftoverEV.checked;

  return parameters;
}

function readBossSelectedAbility() : string {
  return ( abilityMode == AbilitySelectionMode.NaturalAbilities ? UIElements.RaidBoss.BossNaturalAbilitySelect.value : UIElements.RaidBoss.BossAllAbilitiesSelect.value );
}

/**
 * Create a new header cell for the given header row.
 * @param headRow Header row to append new cell
 * @param content Text content given to the cell
 * @param colSpan Cell column span
 * @returns The newly created cell is returned.
 */
function createTableHeadCell( headRow: HTMLTableRowElement, content: string, colSpan: number = 1 ) {
  const newHeadCell = document.createElement('th');
  newHeadCell.colSpan = colSpan;
  newHeadCell.textContent = content;

  headRow.appendChild(newHeadCell);

  return newHeadCell;
}

/**
 * Create a new table cell for the given table body row.
 * @param bodyRow Body row to append new cell
 * @param content Text content given to the cell
 * @param colSpan Cell column span
 * @returns The newly created cell is returned.
 */
function createTableBodyCell( bodyRow: HTMLTableRowElement, content: string, colSpan: number = 1 ) {
  const newBodyCell = document.createElement('td');
  newBodyCell.colSpan = colSpan;
  newBodyCell.textContent = content;

  bodyRow.appendChild(newBodyCell);

  return newBodyCell;
}


function setUIHpBase( baseValue: number ) {
  UIElements.RaidBoss.BossHPBase.textContent = baseValue.toString();
}
function setUIHpIV( IV: number ) {
  UIElements.RaidBoss.BossHPIV.textContent = IV.toString();
}
function setUIHpEV( EV: number ) {
  UIElements.RaidBoss.BossHPEV.textContent = EV.toString();
}
function updateHPStat() {
  try {
    let hpStat = Stats.calcStatADV( gen.natures, 'hp',
      UIElements.RaidBoss.BossHPBase.valueAsNumber,
      UIElements.RaidBoss.BossHPIV.valueAsNumber,
      UIElements.RaidBoss.BossHPEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );
    hpStat *= Number.parseInt( UIElements.RaidBoss.BossHPMultiplier.value );
    UIElements.RaidBoss.BossHPCalc.textContent = hpStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossHPBase.addEventListener( 'change', () => { updateHPStat(); } );
UIElements.RaidBoss.BossHPIV.addEventListener( 'change', () => { updateHPStat(); } );
UIElements.RaidBoss.BossHPEV.addEventListener( 'change', () => { updateHPStat(); } );
UIElements.RaidBoss.BossHPMultiplier.addEventListener( 'change', () => {
  updateHPStat();
} );

function setUIAtkBase( baseValue: number ) {
  UIElements.RaidBoss.BossAtkBase.textContent = baseValue.toString();
}
function setUIAtkIV( IV: number ) {
  UIElements.RaidBoss.BossAtkIV.textContent = IV.toString();
}
function setUIAtkEV( EV: number ) {
  UIElements.RaidBoss.BossAtkEV.textContent = EV.toString();
}
function setUIAtkStage( stage: number ) {
  UIElements.RaidBoss.BossAtkStage.textContent = stage.toString();
}
function updateAtkStat() {
  try {
    let stat = Stats.calcStatADV( gen.natures, 'atk',
      UIElements.RaidBoss.BossAtkBase.valueAsNumber,
      UIElements.RaidBoss.BossAtkIV.valueAsNumber,
      UIElements.RaidBoss.BossAtkEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );

    let finalStat = getModifiedStat( stat, UIElements.RaidBoss.BossAtkStage.valueAsNumber, gen );

    UIElements.RaidBoss.BossAtkCalc.textContent = finalStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossAtkBase.addEventListener( 'change', () => { updateAtkStat(); } );
UIElements.RaidBoss.BossAtkIV.addEventListener( 'change', () => { updateAtkStat(); } );
UIElements.RaidBoss.BossAtkEV.addEventListener( 'change', () => { updateAtkStat(); } );
UIElements.RaidBoss.BossAtkStage.addEventListener( 'change', () => { updateAtkStat(); } );


function setUIDefBase( baseValue: number ) {
  UIElements.RaidBoss.BossDefBase.textContent = baseValue.toString();
}
function setUIDefIV( IV: number ) {
  UIElements.RaidBoss.BossDefIV.textContent = IV.toString();
}
function setUIDefEV( EV: number ) {
  UIElements.RaidBoss.BossDefEV.textContent = EV.toString();
}
function setUIDefStage( stage: number ) {
  UIElements.RaidBoss.BossDefStage.textContent = stage.toString();
}
function updateDefStat() {
  try {
    let stat = Stats.calcStatADV( gen.natures, 'def',
      UIElements.RaidBoss.BossDefBase.valueAsNumber,
      UIElements.RaidBoss.BossDefIV.valueAsNumber,
      UIElements.RaidBoss.BossDefEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );

    let finalStat = getModifiedStat( stat, UIElements.RaidBoss.BossDefStage.valueAsNumber, gen );

    UIElements.RaidBoss.BossDefCalc.textContent = finalStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossDefBase.addEventListener( 'change', () => { updateDefStat(); } );
UIElements.RaidBoss.BossDefIV.addEventListener( 'change', () => { updateDefStat(); } );
UIElements.RaidBoss.BossDefEV.addEventListener( 'change', () => { updateDefStat(); } );
UIElements.RaidBoss.BossDefStage.addEventListener( 'change', () => { updateDefStat(); } );


function setUISpaBase( baseValue: number ) {
  UIElements.RaidBoss.BossSpaBase.textContent = baseValue.toString();
}
function setUISpaIV( IV: number ) {
  UIElements.RaidBoss.BossSpaIV.textContent = IV.toString();
}
function setUISpaEV( EV: number ) {
  UIElements.RaidBoss.BossSpaEV.textContent = EV.toString();
}
function setUISpaStage( stage: number ) {
  UIElements.RaidBoss.BossSpaStage.textContent = stage.toString();
}
function updateSpaStat() {
  try {
    let stat = Stats.calcStatADV( gen.natures, 'spa',
      UIElements.RaidBoss.BossSpaBase.valueAsNumber,
      UIElements.RaidBoss.BossSpaIV.valueAsNumber,
      UIElements.RaidBoss.BossSpaEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );

    let finalStat = getModifiedStat( stat, UIElements.RaidBoss.BossSpaStage.valueAsNumber, gen );

    UIElements.RaidBoss.BossSpaCalc.textContent = finalStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossSpaBase.addEventListener( 'change', () => { updateSpaStat(); } );
UIElements.RaidBoss.BossSpaIV.addEventListener( 'change', () => { updateSpaStat(); } );
UIElements.RaidBoss.BossSpaEV.addEventListener( 'change', () => { updateSpaStat(); } );
UIElements.RaidBoss.BossSpaStage.addEventListener( 'change', () => { updateSpaStat(); } );

function setUISpdBase( baseValue: number ) {
  UIElements.RaidBoss.BossSpdBase.textContent = baseValue.toString();
}
function setUISpdIV( IV: number ) {
  UIElements.RaidBoss.BossSpdIV.textContent = IV.toString();
}
function setUISpdEV( EV: number ) {
  UIElements.RaidBoss.BossSpdEV.textContent = EV.toString();
}
function setUISpdStage( stage: number ) {
  UIElements.RaidBoss.BossSpdStage.textContent = stage.toString();
}
function updateSpdStat() {
  try {
    let stat = Stats.calcStatADV( gen.natures, 'spd',
      UIElements.RaidBoss.BossSpdBase.valueAsNumber,
      UIElements.RaidBoss.BossSpdIV.valueAsNumber,
      UIElements.RaidBoss.BossSpdEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );

    let finalStat = getModifiedStat( stat, UIElements.RaidBoss.BossSpdStage.valueAsNumber, gen );

    UIElements.RaidBoss.BossSpdCalc.textContent = finalStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossSpdBase.addEventListener( 'change', () => { updateSpdStat(); } );
UIElements.RaidBoss.BossSpdIV.addEventListener( 'change', () => { updateSpdStat(); } );
UIElements.RaidBoss.BossSpdEV.addEventListener( 'change', () => { updateSpdStat(); } );
UIElements.RaidBoss.BossSpdStage.addEventListener( 'change', () => { updateSpdStat(); } );



function setUISpeBase( baseValue: number ) {
  UIElements.RaidBoss.BossSpeBase.textContent = baseValue.toString();
}
function setUISpeIV( IV: number ) {
  UIElements.RaidBoss.BossSpeIV.textContent = IV.toString();
}
function setUISpeEV( EV: number ) {
  UIElements.RaidBoss.BossSpeEV.textContent = EV.toString();
}
function setUISpeStage( stage: number ) {
  UIElements.RaidBoss.BossSpeStage.textContent = stage.toString();
}
function updateSpeStat() {
  try {
    let stat = Stats.calcStatADV( gen.natures, 'spe',
      UIElements.RaidBoss.BossSpeBase.valueAsNumber,
      UIElements.RaidBoss.BossSpeIV.valueAsNumber,
      UIElements.RaidBoss.BossSpeEV.valueAsNumber,
      UIElements.RaidBoss.BossLevel.valueAsNumber,
      UIElements.RaidBoss.BossNature.value as NatureName
    );

    let finalStat = getModifiedStat( stat, UIElements.RaidBoss.BossSpeStage.valueAsNumber, gen );

    UIElements.RaidBoss.BossSpeCalc.textContent = finalStat.toString();
  }
  catch(e) {
    UIElements.debug.errorHeader.textContent = "Error";
  }
}
UIElements.RaidBoss.BossSpeBase.addEventListener( 'change', () => { updateSpeStat(); } );
UIElements.RaidBoss.BossSpeIV.addEventListener( 'change', () => { updateSpeStat(); } );
UIElements.RaidBoss.BossSpeEV.addEventListener( 'change', () => { updateSpeStat(); } );
UIElements.RaidBoss.BossSpeStage.addEventListener( 'change', () => { updateSpeStat(); } );

UIElements.RaidBoss.BossLevel.addEventListener( 'change', () => {
  updateHPStat();
  updateAtkStat();
  updateDefStat();
  updateSpaStat();
  updateSpdStat();
  updateSpeStat();
} );

UIElements.RaidBoss.BossNature.addEventListener( 'change', () => {
  updateAtkStat();
  updateDefStat();
  updateSpaStat();
  updateSpdStat();
  updateSpeStat();
} );

// Set UI initial state (see index.html also)
UIElements.RaidBoss.R7ESelect.value = "Blaziken";
onPresetChange( RaidPresetMode.SevenStarEvent );


/*function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}*/

UIElements.Header.ssTestButton.addEventListener('click', function() {
  let canMakeScreenshot = false;
  let errorMessage = "";

  // Only make a screenshot if
  if ( currentSearchResult != undefined ) {
    if ( UIElements.Results.ResultsTable.tBodies[0].rows.length > 0 ) {
      if ( UIElements.Results.ResultsTable.tBodies[0].rows.length <= 20 ) {
        canMakeScreenshot = true;
      }
      else {
        errorMessage = "Table must show at most 20 rows to be captured into a screenshot!";
      }
    } 
    else {
      errorMessage = "The table must have at least 1 valid row result, and at most 20!";
    }
  }
  else {
    errorMessage = "No search has been performed yet!";
  }

  // If the search result is elligible for a screenshot
  if ( canMakeScreenshot ) {
    // Show overlay element
    let overlay = document.getElementById('loadingOverlay') as HTMLDivElement;
    overlay.style.display = 'flex';

    // Temporarily hide pagination
    let pagination = document.getElementById('resultTablePagination') as HTMLDivElement;
    pagination.hidden = true;

    let timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Format: YYYYMMDDTHHMMSS
    let filename =  'TRB_vs_' + currentSearchResult?.rankingData.raidBoss.name + timestamp + '.png';

    // Capture all contents of the table
    let fullTable = document.getElementById('resultTableContents') as HTMLDivElement;

    setTimeout(function() {
      // Render simplified table
      html2canvas(fullTable).then(function(canvas) {

        // Render element into screenshot
        var link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = filename;

        // Download screenshot
        link.click();

        // Hide overlay
        overlay.style.display = 'none';
        // Show pagination again
        pagination.hidden = false;
      });
    }, 1 );
  }
  // Otherwise, show an alert popup
  else {
    alert(errorMessage)
  }

});


UIElements.Results.ResultPrevButton.addEventListener('click', function() {
  if ( currentSearchResult ) {

    if ( currentSearchResult.currentPage > 1 ) {
      // Change to previous page
      createResultTableEntries( currentSearchResult, currentSearchResult.currentPage-1);

      UIElements.Results.ResultPageSelect.value = currentSearchResult.currentPage.toString();
      // Disable prev or next if applicable
    }
  }
} );
UIElements.Results.ResultNextButton.addEventListener('click', function() {
  if ( currentSearchResult ) {
    let maxPage = currentSearchResult.filteredData.length / currentSearchResult.itemsPerPage;
    if ( currentSearchResult.currentPage < maxPage ) {
      // Change to previous page
      createResultTableEntries( currentSearchResult, currentSearchResult.currentPage+1);

      // Disable prev or next if applicable
      UIElements.Results.ResultPageSelect.value = currentSearchResult.currentPage.toString();
    }
  }
} );
UIElements.Results.ResultPageSelect.addEventListener( 'change', () => {
  if ( currentSearchResult ) {
    let page = Number.parseInt( UIElements.Results.ResultPageSelect.value );
    createResultTableEntries( currentSearchResult, page );
  }
} );
UIElements.Results.ResultItemsPerPageSelect.addEventListener( 'change', () => {
  if ( currentSearchResult ) {
    currentSearchResult.itemsPerPage = Number.parseInt( UIElements.Results.ResultItemsPerPageSelect.value );
    updatePaging( currentSearchResult );
    createResultTableEntries( currentSearchResult, 1 );
  }
} );



/**/
UIElements.Results.PSFLearnMoveAdd.addEventListener('click', () => {
  // Can't add more than 4 moves
  if ( UIElements.Results.PSFLearnMoveList.children.length == 4 ) {
    return;
  }
  const selectedEntry = UIElements.Results.PSFLearnMoveSelect.value;
  if (selectedEntry) {
    // Check if the selected entry already exists in the whitelist
    const isDuplicate = Array.from(UIElements.Results.PSFLearnMoveList.children).some((item) => {
        return (item as HTMLElement).dataset.originalValue == selectedEntry;
    });

    // If not duplicate then we add to the whitelist
    if ( !isDuplicate ) {
      const listItem = document.createElement('li');
      listItem.dataset.originalValue = selectedEntry;
      listItem.innerHTML = `${selectedEntry} <button class="llistRemoveButton">x</button>`;
      UIElements.Results.PSFLearnMoveList.appendChild(listItem);

      // Add click event listener to remove button
      const removeButton = listItem.querySelector('.llistRemoveButton') as HTMLButtonElement;
      removeButton.addEventListener('click', () => {
        UIElements.Results.PSFLearnMoveList.removeChild(listItem);
        if ( UIElements.Results.PSFFilterLearnMove.checked ) {
          applyPostSearchFilters();
        }
      });
    }
  }

  UIElements.Results.PSFLearnMoveSelect.focus();
});
UIElements.Results.PSFLearnMoveClear.addEventListener('click', () => {
  UIElements.Results.PSFLearnMoveList.innerHTML = "";
});






function applyPostSearchFilters() {
  if ( currentSearchResult ) {
    // Reset filtered data
    currentSearchResult.filteredData = currentSearchResult.rankingData.originalData;

    // Apply filters

    // Learnable move filter
    let infoLearnMoves : string[] = [];
    if ( UIElements.Results.PSFFilterLearnMove.checked) {
      // If whitelist is populated
      if ( UIElements.Results.PSFLearnMoveList.childElementCount > 0 ) {
        // Filter for each move selected
        for ( let index = 0; index < UIElements.Results.PSFLearnMoveList.childElementCount; ++index ) {
          // Get move name from chosen
          let moveName = (UIElements.Results.PSFLearnMoveList.children[index] as HTMLElement).dataset.originalValue!;
          let moveLearnset = moveLearnsetDictionary.get(moveName);

          infoLearnMoves.push( moveName );

          // If valid move learnset (should always be valid)
          if ( moveLearnset ) {
            // Filter out all entries which do not learn this move
            currentSearchResult.filteredData = currentSearchResult.filteredData.filter( (val) => {
              return moveLearnset!.includes( val.species );
            });
          } 
        } 
      }
    }

    // STAB filter
    let teraType = currentSearchResult?.rankingData.raidBoss.teraType;
    if ( UIElements.Results.PSFBaseSTAB.checked ) {
      currentSearchResult.filteredData = currentSearchResult.filteredData.filter( (val) => {

        let type1 = gen.types.get(toID(val.type1));
        let type2 = gen.types.get(toID(val.type2));

        let isStab1 = false;
        let isStab2 = false;
        if ( type1!.effectiveness[teraType!]! > 1 ) {
            isStab1 = true;
        }
        if ( type2!.effectiveness[teraType!]! > 1 ) {
            isStab2 = true;
        }

        // Check if immune via ability

        return isStab1 || isStab2;
      });
    }

    // Update table starting from page 1
    updatePaging( currentSearchResult );
    createResultTableEntries( currentSearchResult, 1 );

    /* Summarize PSF info */

    let counter = 0;
    UIElements.Results.InfoFilters.textContent = "[Active Filter]";
    if ( infoLearnMoves.length > 0 ) {
      UIElements.Results.InfoFilters.textContent += " <=> Can Learn: \"" + infoLearnMoves.join("\", \"") + "\"";
      counter++;
    }

    if ( UIElements.Results.PSFBaseSTAB.checked ) {
      UIElements.Results.InfoFilters.textContent += " <=> STAB Only"
      counter++;
    }

    if ( counter == 0 ) {
      hidePSFInfo();
    }
    else {
      showPSFInfo();
    }
  }
}



UIElements.Results.PSFLearnMoveAdd.addEventListener( 'click', () => {
  if ( UIElements.Results.PSFFilterLearnMove.checked ) {
    applyPostSearchFilters();
  }
});
UIElements.Results.PSFLearnMoveClear.addEventListener( 'click', () => {
  if ( UIElements.Results.PSFFilterLearnMove.checked ) {
    applyPostSearchFilters();
  }
});

UIElements.Results.PSFFilterLearnMove.addEventListener( 'change', () => {
  applyPostSearchFilters();
} );
UIElements.Results.PSFBaseSTAB.addEventListener( 'change', () => {
  applyPostSearchFilters();
} );

UIElements.Results.PSFApplyButton.addEventListener( 'click', () => {
  applyPostSearchFilters();
});


function clearPostSearchFilters() {
  if ( currentSearchResult ) {
    // Clear filtered data
    currentSearchResult.filteredData = currentSearchResult.rankingData.originalData;

    // Update table starting from page 1
    updatePaging( currentSearchResult );
    createResultTableEntries( currentSearchResult, 1 );

    hidePSFInfo();
  }
}
UIElements.Results.PSFClearButton.addEventListener( 'click', () => {
  clearPostSearchFilters();
});

// REFORMAT POKEMON NAMES IN TEXT
/*let tarea = document.createElement("textarea");
tarea.rows = 50;
tarea.cols = 100;
let sortedData = FilteringData.filteringData.sort( (a,b) => { 
  if ( a.name < b.name ) {
    return -1;
  }
  if ( a.name > b.name ) {
    return 1;
  }
  return 0;
});
for ( const entry in sortedData ) {
  let originalName = sortedData[entry].name;//.toLowerCase();
  let convName = originalName.toLowerCase();
  convName = convName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"");
  tarea.textContent += convName + ': \"' + originalName + '\",\n';
}
document.body.appendChild( tarea );*/

// REFORMAT POKEMON MOVES IN TEXT
/*let tarea = document.createElement("textarea");
tarea.rows = 50;
tarea.cols = 100;
let partialMoveFilter: string[] = [...gen.moves].map(
  move => move.name
);
let sortedMoves = partialMoveFilter.sort( (a,b) => { 
  if ( a < b ) {
    return -1;
  }
  if ( a > b ) {
    return 1;
  }
  return 0;
});
for ( const move in sortedMoves ) {
  let originalName = sortedMoves[move];//.toLowerCase();
  let convName = sortedMoves[move].toLowerCase();
  convName = convName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"");
  tarea.textContent += convName + ': \"' + originalName + '\",\n';
}
document.body.appendChild( tarea );*/

// REFORMAT RAID EXTRA ACTIONS IN TEXT
/*let tarea = document.createElement("textarea");
tarea.rows = 50;
tarea.cols = 100;
let partialMoveFilter: string[] = [...gen.moves].map(
  move => move.name
);
let sortedMoves = partialMoveFilter.sort( (a,b) => { 
  if ( a < b ) {
    return -1;
  }
  if ( a > b ) {
    return 1;
  }
  return 0;
});
for ( const move in sortedMoves ) {
  let originalName = sortedMoves[move];//.toLowerCase();
  let convName = sortedMoves[move].toLowerCase();
  convName = convName.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"");
  tarea.textContent += convName + ': \"' + originalName + '\",\n';
}
document.body.appendChild( tarea );*/