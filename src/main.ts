import '../styles/main.css'

import UIElements from './UI/uielements';

import './UI/uiparameters';

import { SearchResult } from './UI/searchresult';
import {RaidPresetMode, AbilitySelectionMode, getPresetModeString} from './UI/uilogic'
import {populateDropdown } from './UI/util';

import {Generations,Move } from './smogon-calc'

import * as Ranking from './ranking/ranking'

import {SearchDataModule} from './data/filteringdata'

import { ExtraAction, RaidBossPreset,
        T5Raids_IndigoDisk, T5Raids_Paldea, T5Raids_TealMask,
        T6Raids_IndigoDisk, T6Raids_Paldea, T6Raids_TealMask,
        tier5EventRaidBossPresets, tier7EventRaidBossPresets } from './presets/raidpreset';
import LearnsetModule from './data/movelearnset';

import * as UIParameters from './UI/uiparameters';
import * as UIResults from './UI/uiresults';

import * as UIRaidBoss from './UI/uiraidboss';
import * as PokeImport from './UI/pokeimport';


// ========================================================================
// ========================================================================
// APPLICATION STATE VARIABLES

// Tera Raids only in Gen 9
const gen = Generations.get(9);

// Raid boss preset mode (Custom, 5/6 star raid, 5/7 star event)
let currentPresetMode :RaidPresetMode = RaidPresetMode.Custom;

// Raid boss ability selection mode (All abilities, Natural ability)
let abilityMode : AbilitySelectionMode = AbilitySelectionMode.NaturalAbilities;

// Search Result Cache (Stores the results from the last search which is currently shown in the table)
let currentSearchResult: SearchResult | undefined = undefined;

let isFirstSearch = true;

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// FUNCTIONS

async function performRaidSearch() {
  // Time elapsed profiling
  const startTime = new Date().getTime();

  // Read all search parameters
  const rankingParameters = UIParameters.readSearchParameters();

  // Verify if moves are valid
  const mainMoves : Move[] = UIRaidBoss.readBossMainMoveset(gen, rankingParameters);

  // Quit if no moves are selected
  if ( mainMoves.length == 0 ) {
    alert('Must select at least one move in the main moveset!');
    return;
  }
  // If selected moves are valid then we can proceed

  // Read the extra moves
  const extraMoves : Move[] = UIRaidBoss.readBossExtraMoves( gen, rankingParameters );

  UIElements.Results.SearchSummary.innerHTML = "";

  // Prepare data
  const raidBoss = UIRaidBoss.readRaidBossParameters(gen,currentPresetMode,abilityMode);
  let field = UIParameters.readFieldParameters();

  // Send data into the raid ranking function
  const rankResultData = await Ranking.raidDefenderRanking( gen, raidBoss, mainMoves, extraMoves, field, rankingParameters);

  currentSearchResult = new SearchResult( rankResultData );
  currentSearchResult.filteredData = currentSearchResult.rankingData.originalData;

  currentSearchResult.itemsPerPage = Number.parseInt( UIElements.Results.ResultItemsPerPageSelect.value );
  currentSearchResult.currentPage = 1;
  UIResults.updatePaging( currentSearchResult );
  
  // ======= BUILD TABLE AND RESULTS =======
  // Create table head with info
  UIResults.createResultTableHead( currentSearchResult );

  // Show notable settings and effects
  UIResults.updateEffectsInfo( currentSearchResult );

  // Boss Summary
  UIResults.createBossInfoSummary( gen, currentSearchResult, getPresetModeString( currentPresetMode ), UIRaidBoss.getSelectedBossPreset( currentPresetMode ) );

  // Determine time elapsed since beginning of ranking operation
  const elapsed = ( (new Date().getTime())-startTime ) / 1000;
  currentSearchResult.execTime = elapsed;

  UIElements.Results.SearchSummary.innerHTML = currentSearchResult.getExecSummary();

  if ( isFirstSearch ) {
    await initializePSFSelect();

    // Unhide PSF Container (Hidden when the website first opens)
    UIElements.Results.PSFContainer.classList.remove('collapsed');

      // Reveal results section
    UIElements.Results.SearchResultSection.classList.remove('collapsed');

    isFirstSearch = false;
  }

  // Create table head with currently viewable entries & automatically apply post search filters if any were selected previously
  await applyPostSearchFilters();

  // Automatically scroll to the table
  if ( UIElements.Results.FullTable ) {
    UIElements.Results.FullTable.scrollIntoView({ behavior: 'smooth' });
  }
}


function clearPostSearchFilters() {
  if ( currentSearchResult ) {
    // Clear filtered data
    currentSearchResult.filteredData = currentSearchResult.rankingData.originalData;

    // Update table starting from page 1
    UIResults.updatePaging( currentSearchResult );
    UIResults.createResultTableEntries( currentSearchResult, 1 );

    UIResults.hidePSFInfo();

    UIElements.Results.SearchSummary.innerHTML = currentSearchResult.getExecSummary();
  }
}

async function applyPostSearchFilters() {
  if ( currentSearchResult ) {

    await UIResults.applyPostSearchFilters( gen, currentSearchResult );

    UIElements.Results.SearchSummary.innerHTML = currentSearchResult.getExecSummary();
  }
}



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
  updateBossSelection( currentPresetMode );
}

async function updateBossSelection( presetMode: RaidPresetMode ) {
  UIRaidBoss.updateBossImage( presetMode );
  await UIRaidBoss.reselectAbility( presetMode );
  UIRaidBoss.reselectPresetDefaults( gen, presetMode );
  UIRaidBoss.overwriteStats( gen, presetMode );
}

function createScreenshotOverlay() {
  let overlay = document.createElement('div');
  overlay.classList.add('backgroundOverlay');

  overlay.innerHTML = `<div id="loadingSymbol">... Please wait while your screenshot is generated ...<div id="loadingAnimation"></div></div>`;

  document.body.appendChild( overlay );

  return overlay;
 /* <div id="loadingOverlay">
            <div id="loadingSymbol">
                ... Please wait while your screenshot is generated ...
                <div id="loadingAnimation"></div>
            </div>
        </div>*/
}

function changeAbilityMode( mode : AbilitySelectionMode ) {
  if ( mode == AbilitySelectionMode.AnyAbilities ) {
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
}

function updateAllStats() {
  UIRaidBoss.updateHPStat(gen);
  UIRaidBoss.updateAtkStat(gen);
  UIRaidBoss.updateDefStat(gen);
  UIRaidBoss.updateSpaStat(gen);
  UIRaidBoss.updateSpdStat(gen);
  UIRaidBoss.updateSpeStat(gen);
}

/* Hide unnecessary elements, show transparent overlay */
function enableScreenshotMode() {
    // Show overlay element
    let temporaryOverlay = createScreenshotOverlay();

    // Temporarily hide pagination
    let pagination = document.getElementById('resultTablePagination') as HTMLDivElement;
    pagination.hidden = true;

    // Temporarily unsticky thead
    let thead = UIElements.Results.ResultsTable.tHead;
    thead?.classList.remove('Sticky');
}

/* Hide overlay, unhide elements */
function disableScreenshotMode() {

}

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// POPULATE INTERFACE ELEMENTS WITH DATA

async function intializeInterfaceElements() {
  // Populate the custom preset select & whitelist select with all available Pokemon in Gen 9
  if ( UIElements.RaidBoss.CustomSelect && UIElements.SearchParams.FilterWhitelistSelect ) {
    // Obtain species names from data
    let partialSpeciesFilter: string[] = (await SearchDataModule.GetData()).map(
      item => item.name
    );
    partialSpeciesFilter.sort( (a,b) => {
      return a < b ? -1 : 1;
    });

    populateDropdown( UIElements.RaidBoss.CustomSelect, partialSpeciesFilter );
    populateDropdown( UIElements.SearchParams.FilterWhitelistSelect, partialSpeciesFilter );
  }
}
intializeInterfaceElements();

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

// Populate raid boss move pool and extra move dropdowns
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

// Populate move select for Post Search Filters
async function initializePSFSelect() {
  let fullLearnset = await LearnsetModule.GetData();

  let partialMoveData : string[] = [];

  // Add all keys to an array
  for ( let key of fullLearnset.keys() ) {
    partialMoveData.push( key );
  }

  // Sort keys
  partialMoveData.sort( (a,b) => {
    return a < b ? -1 : 1;
  });

  // Populate select with options
  populateDropdown( UIElements.Results.PSFLearnMoveSelect, partialMoveData );
}

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ADD EVENT HANDLERS



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
    if ( !UIElements.SearchParams.SearchParamContainer.classList.contains('collapsed') ) {
      UIElements.SearchParams.SearchParamContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

UIElements.HelpSection.UserGuideToggle.addEventListener('click', () => {
  UIElements.HelpSection.UserGuidePopup.classList.toggle('collapsed');
  if ( !UIElements.HelpSection.UserGuidePopup.classList.contains('collapsed') ) {
    UIElements.HelpSection.UserGuidePopup.scrollIntoView({ behavior: 'smooth' });
  }
});

/*Perform search and apply results*/
UIElements.Header.calculateButton.addEventListener('click', async function handleClick(event) {
  const cooldownEffect = document.getElementById('searchCooldownEffect') as HTMLDivElement;

  UIElements.Header.calculateButton.disabled = true;
  cooldownEffect.style.display = 'block';

  await performRaidSearch();

  setTimeout(() => {
    UIElements.Header.calculateButton.disabled = false;
    cooldownEffect.style.display = 'none';
  }, 3000 );
});


UIElements.RaidBoss.BossAbilityLabel.addEventListener('click', () => {
  if ( abilityMode == AbilitySelectionMode.NaturalAbilities ) {
    changeAbilityMode( AbilitySelectionMode.AnyAbilities);
  }
  else {
    changeAbilityMode( AbilitySelectionMode.NaturalAbilities);
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




UIElements.SearchParams.FilterDexPaldea.addEventListener( 'change', UIParameters.updateDexFilterDescription );
UIElements.SearchParams.FilterDexTeal.addEventListener( 'change', UIParameters.updateDexFilterDescription );
UIElements.SearchParams.FilterDexIndigo.addEventListener( 'change', UIParameters.updateDexFilterDescription );
UIElements.SearchParams.FilterDexHOME.addEventListener( 'change', UIParameters.updateDexFilterDescription );


UIElements.SearchParams.FilterRarityRegular.addEventListener( 'change', UIParameters.updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityParadox.addEventListener( 'change', UIParameters.updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityLegendary.addEventListener( 'change', UIParameters.updateRarityFilterDescription );
UIElements.SearchParams.FilterRarityMythical.addEventListener( 'change', UIParameters.updateRarityFilterDescription );



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


UIElements.RaidBoss.CustomSelect.addEventListener( 'change', async () => { await updateBossSelection(currentPresetMode); } );
UIElements.RaidBoss.R5Select.addEventListener( 'change', async () => { await updateBossSelection(currentPresetMode); } );
UIElements.RaidBoss.R5ESelect.addEventListener( 'change', async () => { await updateBossSelection(currentPresetMode); } );
UIElements.RaidBoss.R6Select.addEventListener( 'change', async () => { await updateBossSelection(currentPresetMode); } );
UIElements.RaidBoss.R7ESelect.addEventListener( 'change', async () => { await updateBossSelection(currentPresetMode); });


/*Refresh/Clear moves */
UIElements.RaidBoss.BossMoveDefaultButton.addEventListener('click', () => {
  let preset = UIRaidBoss.getSelectedBossPreset(currentPresetMode);
  if ( preset != undefined ) {
    UIRaidBoss.setBossPresetMainMoves( preset );
  }
  else {
    UIElements.RaidBoss.BossMove1.value = "(No Move)";
    UIElements.RaidBoss.BossMove2.value = "(No Move)";
    UIElements.RaidBoss.BossMove3.value = "(No Move)";
    UIElements.RaidBoss.BossMove4.value = "(No Move)";
  }
});
UIElements.RaidBoss.BossAddMoveDefaultButton.addEventListener('click', () => {
  let preset = UIRaidBoss.getSelectedBossPreset(currentPresetMode);
  if ( preset != undefined ) {
    UIRaidBoss.setBossPresetAddMoves( preset );
  }
  else {
    UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
    UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
  }
});
UIElements.RaidBoss.BossMoveClearButton.addEventListener('click', () => {

  UIElements.RaidBoss.BossMove1.value = "(No Move)";
  UIElements.RaidBoss.BossMove2.value = "(No Move)";
  UIElements.RaidBoss.BossMove3.value = "(No Move)";
  UIElements.RaidBoss.BossMove4.value = "(No Move)";

});
UIElements.RaidBoss.BossAddMoveClearButton.addEventListener('click', () => {

  UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
  UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
  UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
  UIElements.RaidBoss.BossAddMove4.value = "(No Move)";

});

/*UIElements.RaidBoss.BossTeraType.addEventListener( 'change', () => {
  UIElements.RaidBoss.BossTeraType.className = UIElements.RaidBoss.BossTeraType.selectedOptions[0].className;
} );*/


UIElements.RaidBoss.BossHPBase.addEventListener( 'change', () => { UIRaidBoss.updateHPStat(gen); } );
UIElements.RaidBoss.BossHPIV.addEventListener( 'change', () => { UIRaidBoss.updateHPStat(gen); } );
UIElements.RaidBoss.BossHPEV.addEventListener( 'change', () => { UIRaidBoss.updateHPStat(gen); } );
UIElements.RaidBoss.BossHPMultiplier.addEventListener( 'change', () => {
  UIRaidBoss.updateHPStat(gen);
} );

UIElements.RaidBoss.BossAtkBase.addEventListener( 'change', () => { UIRaidBoss.updateAtkStat(gen); } );
UIElements.RaidBoss.BossAtkIV.addEventListener( 'change', () => { UIRaidBoss.updateAtkStat(gen); } );
UIElements.RaidBoss.BossAtkEV.addEventListener( 'change', () => { UIRaidBoss.updateAtkStat(gen); } );
UIElements.RaidBoss.BossAtkStage.addEventListener( 'change', () => { UIRaidBoss.updateAtkStat(gen); } );

UIElements.RaidBoss.BossDefBase.addEventListener( 'change', () => { UIRaidBoss.updateDefStat(gen); } );
UIElements.RaidBoss.BossDefIV.addEventListener( 'change', () => { UIRaidBoss.updateDefStat(gen); } );
UIElements.RaidBoss.BossDefEV.addEventListener( 'change', () => { UIRaidBoss.updateDefStat(gen); } );
UIElements.RaidBoss.BossDefStage.addEventListener( 'change', () => { UIRaidBoss.updateDefStat(gen); } );

UIElements.RaidBoss.BossSpaBase.addEventListener( 'change', () => { UIRaidBoss.updateSpaStat(gen); } );
UIElements.RaidBoss.BossSpaIV.addEventListener( 'change', () => { UIRaidBoss.updateSpaStat(gen); } );
UIElements.RaidBoss.BossSpaEV.addEventListener( 'change', () => { UIRaidBoss.updateSpaStat(gen); } );
UIElements.RaidBoss.BossSpaStage.addEventListener( 'change', () => { UIRaidBoss.updateSpaStat(gen); } );

UIElements.RaidBoss.BossSpdBase.addEventListener( 'change', () => { UIRaidBoss.updateSpdStat(gen); } );
UIElements.RaidBoss.BossSpdIV.addEventListener( 'change', () => { UIRaidBoss.updateSpdStat(gen); } );
UIElements.RaidBoss.BossSpdEV.addEventListener( 'change', () => { UIRaidBoss.updateSpdStat(gen); } );
UIElements.RaidBoss.BossSpdStage.addEventListener( 'change', () => { UIRaidBoss.updateSpdStat(gen); } );

UIElements.RaidBoss.BossSpeBase.addEventListener( 'change', () => { UIRaidBoss.updateSpeStat(gen); } );
UIElements.RaidBoss.BossSpeIV.addEventListener( 'change', () => { UIRaidBoss.updateSpeStat(gen); } );
UIElements.RaidBoss.BossSpeEV.addEventListener( 'change', () => { UIRaidBoss.updateSpeStat(gen); } );
UIElements.RaidBoss.BossSpeStage.addEventListener( 'change', () => { UIRaidBoss.updateSpeStat(gen); } );

UIElements.RaidBoss.BossLevel.addEventListener( 'change', () => {
  updateAllStats();
} );

UIElements.RaidBoss.BossNature.addEventListener( 'change', () => {
  updateAllStats();
} );

/*function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}*/

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

UIElements.Header.ssTestButton.addEventListener('click', function() {
  let canMakeScreenshot = false;
  let errorMessage = "";

  // Only make a screenshot if
  if ( true) {//if (!isMobileDevice()) {
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
  }
  else {
    errorMessage = "This feature is currently disabled on mobile devices. Fix coming soon!"
  }

  // If the search result is elligible for a screenshot
  if ( canMakeScreenshot ) {
    // Show overlay element
    let temporaryOverlay = createScreenshotOverlay();

    // Temporarily hide pagination
    let pagination = document.getElementById('resultTablePagination') as HTMLDivElement;
    pagination.hidden = true;

    // Temporarily unsticky thead
    let thead = UIElements.Results.ResultsTable.tHead;
    thead?.classList.remove('Sticky');

    let timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Format: YYYYMMDDTHHMMSS
    let filename =  'TRB_vs_' + currentSearchResult?.rankingData.raidBoss.name + timestamp + '.png';

    // Capture all contents of the table
    let fullTable = document.getElementById('resultTableContents') as HTMLDivElement;

      setTimeout(async () => {
        try {
          const html2canvasModule = (await import('html2canvas')).default;

          const html2canvas: (element: HTMLElement) => Promise<HTMLCanvasElement> =
          (html2canvasModule as any).default || html2canvasModule;

          // Render simplified table
          html2canvas(fullTable).then( canvas => {

            try {
              // Render element into screenshot
              var link = document.createElement('a');
              link.href = canvas.toDataURL();
              link.download = filename;

              // Download screenshot
              link.click();
            }
            catch(error) {
              alert(error);
            }
            finally {
              // Remove overlay from the interface
              temporaryOverlay.remove();

              // Re-sticky thead
              thead?.classList.add('Sticky');

              // Show pagination again
              pagination.hidden = false;
            }
          });
        }
        catch(error) {
          alert(error);
          // Remove overlay from the interface
          temporaryOverlay.remove();

          // Re-sticky thead
          thead?.classList.add('Sticky');

          // Show pagination again
          pagination.hidden = false;
        }
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
      UIResults.createResultTableEntries( currentSearchResult, currentSearchResult.currentPage-1);

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
      UIResults.createResultTableEntries( currentSearchResult, currentSearchResult.currentPage+1);

      // Disable prev or next if applicable
      UIElements.Results.ResultPageSelect.value = currentSearchResult.currentPage.toString();
    }
  }
} );
UIElements.Results.ResultPageSelect.addEventListener( 'change', () => {
  if ( currentSearchResult ) {
    let page = Number.parseInt( UIElements.Results.ResultPageSelect.value );
    UIResults.createResultTableEntries( currentSearchResult, page );
  }
} );
UIElements.Results.ResultItemsPerPageSelect.addEventListener( 'change', () => {
  if ( currentSearchResult ) {
    currentSearchResult.itemsPerPage = Number.parseInt( UIElements.Results.ResultItemsPerPageSelect.value );
    UIResults.updatePaging( currentSearchResult );
    UIResults.createResultTableEntries( currentSearchResult, 1 );
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
      removeButton.addEventListener('click', async () => {
        UIElements.Results.PSFLearnMoveList.removeChild(listItem);
        if ( UIElements.Results.PSFFilterLearnMove.checked ) {
          await applyPostSearchFilters();
        }
      });
    }
  }

  UIElements.Results.PSFLearnMoveSelect.focus();
});
UIElements.Results.PSFLearnMoveClear.addEventListener('click', () => {
  UIElements.Results.PSFLearnMoveList.innerHTML = "";
});



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
  // Mutually exclusive with type filter
  if ( UIElements.Results.PSFBaseSTAB.checked ) {
    UIElements.Results.PSFTypeFilterCheck.checked = false;
  }
  
  applyPostSearchFilters();
} );
UIElements.Results.PSFTypeFilterCheck.addEventListener( 'change', () => {
  // Mutually exclusive with base stab filter
  if ( UIElements.Results.PSFTypeFilterCheck.checked ) {
    UIElements.Results.PSFBaseSTAB.checked = false;
  }
  applyPostSearchFilters();
});
UIElements.Results.PSFTypeFilterSelect.addEventListener( 'change', () => {
  if ( UIElements.Results.PSFTypeFilterCheck.checked ) {
    applyPostSearchFilters();
  }
});

UIElements.Results.PSFApplyButton.addEventListener( 'click', () => {
  applyPostSearchFilters();
});

UIElements.Results.PSFClearButton.addEventListener( 'click', () => {
  clearPostSearchFilters();
});


UIElements.RaidBoss.ExportPopupButton.addEventListener( 'click', () => {

  PokeImport.ExportBossData( currentPresetMode, abilityMode );

  UIElements.RaidBoss.ExportErrorMessage.textContent = "";
  UIElements.RaidBoss.ExportDataPrompt.classList.remove('collapsed');
});

UIElements.RaidBoss.ExportReturnButton.addEventListener( 'click', () => {
  UIElements.RaidBoss.ExportDataPrompt.classList.add('collapsed');
});

UIElements.RaidBoss.ExportImportButton.addEventListener( 'click', async () => {

  if ( UIElements.RaidBoss.ExportTextContent.value ) {
    let data = PokeImport.ReadBossData( UIElements.RaidBoss.ExportTextContent.value );

    try {
      await PokeImport.VerifyBossData( gen, data );
    }
    catch ( error: any ) {
      if ( error instanceof Error ) {
        console.log(error.message);
      }
      else if (typeof error === 'string' ) {
        UIElements.RaidBoss.ExportErrorMessage.style.color = 'red';
        UIElements.RaidBoss.ExportErrorMessage.textContent = error;
      }
      else {
        console.log('Unexpected error');
      }
      return;
    }

    // Set defaults
    UIElements.RaidBoss.CustomSelect.value = data.bossName!;
    onPresetChange(RaidPresetMode.Custom);

    changeAbilityMode(AbilitySelectionMode.AnyAbilities);

    // Read data proper
    await PokeImport.ImportBossData(gen, data );
    
    updateAllStats();

    UIElements.RaidBoss.ExportErrorMessage.style.color = 'green';
    UIElements.RaidBoss.ExportErrorMessage.textContent = "Successfully imported!";

    // Close window
    //UIElements.RaidBoss.ExportDataPrompt.classList.add('collapsed');
  }
});

// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// ========================================================================
// Set UI initial state (see index.html also)

UIElements.RaidBoss.R5ESelect.value = "Iron Thorns";
onPresetChange( RaidPresetMode.FiveStarEvent );


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
