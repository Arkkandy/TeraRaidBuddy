import { RaidBossPreset } from "../presets/raidpreset";
import { moveLearnsetDictionary } from "../ranking/movelearnset";
import { PrintVisibleDamage, getReadableRankingString } from "../ranking/searchparameters";
import { EVSpread } from "../ranking/util";
import { toID } from "../smogon-calc";
import { Generation } from "../smogon-calc/data/interface";
import { showExtraActions } from "./extractiontable";
import { PostSearchFilter } from "./postsearchfilter";
import { SearchResult } from "./searchresult";
import UIElements from "./uielements";
import { clearTypeBackground, clearTypeColoring, colorBossInfoMove, createTableBodyCell, createTableHeadCell, getImagePath, setDamageBackgroundColor, setTypeBackgroundColor, setTypeColor, setValidBackgroundColor, stringFromEVSpread } from "./util";



export function createResultTableHead( search: SearchResult ) {
    // Retrieve and clear the table head
    const thead = UIElements.Results.ResultsTable.getElementsByTagName('thead')[0];
    thead.innerHTML = '';
  
    // 1st head row (parameter sets)
    const hrow1 = thead.insertRow();
    // 2nd head row (specific data)
    const hrow2 = thead.insertRow();
  
    // Create 'Raid Counter' group
    createTableHeadCell(hrow2,'Rank');
    createTableHeadCell(hrow2,'Pokemon');
  
    // Shortcut variables to the original data
    let rankingParameters = search.rankingData.originalParameters;
    let useExtraMoves = rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ||
    rankingParameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolSelect;
    let movepool = (useExtraMoves ? search.rankingData.extraMoves : search.rankingData.mainMoves );
  
    let raidCounterColspan = 1;
    if ( rankingParameters.mainparams.defenderTeraType != '' ) {
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




export function createResultTableEntries( search: SearchResult, page: number ) {
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
        if ( rankingParameters.mainparams.defenderTeraType == '' ) {
          const cellType1 = row.insertCell(); // Type 1
          const cellType2 = row.insertCell(); // Type 2
          cellType1.textContent = result.type1;
          setTypeColor( cellType1, result.type1 );
          if ( result.type2 ) {
            cellType2.textContent = result.type2;
            setTypeColor( cellType2, result.type2 );
          }
          cellType2.classList.add('Limiter');
        }
        else {
          const cellTeraType = row.insertCell(); // Type Tera
          cellTeraType.classList.add('Limiter');
          cellTeraType.textContent = rankingParameters.mainparams.defenderTeraType;
          setTypeColor( cellTeraType, rankingParameters.mainparams.defenderTeraType );
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
          cellSpecies.innerHTML = `<div class=\"table-sprite-div\"><img src=\"${path}\" loading="lazy" width=\"32\" height=\"32\">${result.species}</div>`
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



  export function createBossInfoSummary( gen: Generation, search: SearchResult, preset: string, bossPreset?: RaidBossPreset )  {
    UIElements.Results.BossInfoContainer.classList.remove('collapsed');
  
    UIElements.Results.BossInfoPreset.textContent = preset;
    UIElements.Results.BossInfoSpecies.textContent = search.rankingData.raidBoss.name;
    UIElements.Results.BossInfoSprite.src = getImagePath( search.rankingData.raidBoss.name );
  
    // Remove any previous type coloring
    clearTypeBackground( UIElements.Results.BossInfoContainer );
    clearTypeColoring( UIElements.Results.BossInfoTeraType );
    if ( search.rankingData.raidBoss.teraType ) {
      UIElements.Results.BossInfoBaseTypes.classList.add('collapsed');
      UIElements.Results.BossInfoTeraType.classList.remove('collapsed');
      UIElements.Results.bossInfoTeraSprite.classList.remove('collapsed');

      UIElements.Results.BossInfoTeraType.textContent = "Tera " + search.rankingData.raidBoss.teraType;
      setTypeColor( UIElements.Results.BossInfoTeraType, search.rankingData.raidBoss.teraType);
      setTypeBackgroundColor( UIElements.Results.BossInfoContainer, search.rankingData.raidBoss.teraType);

      UIElements.Results.bossInfoTeraSprite.src = "assets/tera/" + search.rankingData.raidBoss.teraType.toLowerCase() + ".png";
    }
    else {
      UIElements.Results.BossInfoTeraType.classList.add('collapsed');
      UIElements.Results.bossInfoTeraSprite.classList.add('collapsed');
      UIElements.Results.BossInfoBaseTypes.classList.remove('collapsed');

      // Delete any previous types
      UIElements.Results.BossInfoBaseTypes.innerHTML = "";

      // Type 1
      let elementType1 = document.createElement('div');
      elementType1.classList.add('boss-info-basetype');
      elementType1.textContent = search.rankingData.raidBoss.types[0];
      setTypeColor(elementType1, search.rankingData.raidBoss.types[0]);
      UIElements.Results.BossInfoBaseTypes.appendChild(elementType1);

      // Type 2 if it exists
      if ( search.rankingData.raidBoss.types[1] ) {
        let elementType2 = document.createElement('div');
        elementType2.classList.add('boss-info-basetype');
        elementType2.textContent = search.rankingData.raidBoss.types[1];
        setTypeColor(elementType2, search.rankingData.raidBoss.types[1]);
        UIElements.Results.BossInfoBaseTypes.appendChild(elementType2);
      }

    }
  
    UIElements.Results.BossInfoLevel.textContent = search.rankingData.raidBoss.level.toString();
    UIElements.Results.BossInfoItem.textContent = ( search.rankingData.raidBoss.item ? search.rankingData.raidBoss.item : "-None" );
    UIElements.Results.BossInfoNature.textContent = search.rankingData.raidBoss.nature;
    UIElements.Results.BossInfoAbility.textContent = ( search.rankingData.raidBoss.ability ? search.rankingData.raidBoss.ability : "-None" );
    
    UIElements.Results.BossInfoHPValue.textContent = ( search.rankingData.raidBoss.stats.hp * search.rankingData.originalParameters.hpMultiplier ).toString();
    UIElements.Results.BossInfoAtkValue.textContent = search.rankingData.raidBoss.stats.atk.toString();
    UIElements.Results.BossInfoDefValue.textContent = search.rankingData.raidBoss.stats.def.toString();
    UIElements.Results.BossInfoSpaValue.textContent = search.rankingData.raidBoss.stats.spa.toString();
    UIElements.Results.BossInfoSpdValue.textContent = search.rankingData.raidBoss.stats.spd.toString();
    UIElements.Results.BossInfoSpeValue.textContent = search.rankingData.raidBoss.stats.spe.toString();
  
    /* MAIN MOVESET */
    clearTypeColoring(UIElements.Results.BossInfoMain1);
    clearTypeColoring(UIElements.Results.BossInfoMain2);
    clearTypeColoring(UIElements.Results.BossInfoMain3);
    clearTypeColoring(UIElements.Results.BossInfoMain4);
  
    UIElements.Results.BossInfoMain1.textContent = search.rankingData.mainMoves[0].name;
    colorBossInfoMove(UIElements.Results.BossInfoMain1, search.rankingData.mainMoves[0], search.rankingData.raidBoss );
    if ( search.rankingData.mainMoves.length >= 2 ) {
      UIElements.Results.BossInfoMain2.textContent = search.rankingData.mainMoves[1].name;
      colorBossInfoMove(UIElements.Results.BossInfoMain2, search.rankingData.mainMoves[1], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoMain2.textContent = '\u00A0';
    }
    if ( search.rankingData.mainMoves.length >= 3 ) {
      UIElements.Results.BossInfoMain3.textContent = search.rankingData.mainMoves[2].name;
      colorBossInfoMove(UIElements.Results.BossInfoMain3, search.rankingData.mainMoves[2], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoMain3.textContent = '\u00A0';
    }
    if ( search.rankingData.mainMoves.length >= 4 ) {
      UIElements.Results.BossInfoMain4.textContent = search.rankingData.mainMoves[3].name;
      colorBossInfoMove(UIElements.Results.BossInfoMain4, search.rankingData.mainMoves[3], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoMain4.textContent = '\u00A0';
    }
  
    /* EXTRA MOVES */
    clearTypeColoring(UIElements.Results.BossInfoExtra1);
    clearTypeColoring(UIElements.Results.BossInfoExtra2);
    clearTypeColoring(UIElements.Results.BossInfoExtra3);
    clearTypeColoring(UIElements.Results.BossInfoExtra4);
  
    if ( search.rankingData.extraMoves.length >= 1 ) {
      UIElements.Results.BossInfoExtra1.textContent = search.rankingData.extraMoves[0].name;
      colorBossInfoMove(UIElements.Results.BossInfoExtra1, search.rankingData.extraMoves[0], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoExtra1.textContent = '\u00A0';
    }
    if ( search.rankingData.extraMoves.length >= 2 ) {
      UIElements.Results.BossInfoExtra2.textContent = search.rankingData.extraMoves[1].name;
      colorBossInfoMove(UIElements.Results.BossInfoExtra2, search.rankingData.extraMoves[1], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoExtra2.textContent = '\u00A0';
    }
    if ( search.rankingData.extraMoves.length >= 3 ) {
      UIElements.Results.BossInfoExtra3.textContent = search.rankingData.extraMoves[2].name;
      colorBossInfoMove(UIElements.Results.BossInfoExtra3, search.rankingData.extraMoves[2], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoExtra3.textContent = '\u00A0';
    }
    if ( search.rankingData.extraMoves.length >= 4 ) {
      UIElements.Results.BossInfoExtra4.textContent = search.rankingData.extraMoves[3].name;
      colorBossInfoMove(UIElements.Results.BossInfoExtra4, search.rankingData.extraMoves[3], search.rankingData.raidBoss );
    }
    else {
      UIElements.Results.BossInfoExtra4.textContent = '\u00A0';
    }
  
    /* Show if boss is burned */
    if ( search.rankingData.raidBoss.status == 'brn') {
      UIElements.Results.BossInfoBurned.classList.remove('collapsed');
    }
    else {
      UIElements.Results.BossInfoBurned.classList.add('collapsed');
    }
  
    /* Show action table */
    if ( bossPreset ) {
      showExtraActions( gen, bossPreset.extraActions, UIElements.Results.BossInfoExtraTable, search.rankingData.raidBoss );
      UIElements.Results.BossInfoExtraSection.classList.remove('collapsed');
    }
    else {
      UIElements.Results.BossInfoExtraSection.classList.add('collapsed');
    }
  }


  export function updateEffectsInfo( search: SearchResult ) {
    let infoPanel = UIElements.Results.InfoEffectsAndSettings;
    infoPanel.textContent = "EV Method: " + getReadableRankingString(search.rankingData.originalParameters.mainparams.rankingType);
    
    let allField: string[] = [];
    if ( search.rankingData.originalField.terrain ) {
      let terrainString = "";
      if ( search.rankingData.originalParameters.misc.lockTerrain ) {
         terrainString = "🔒";
      }
      terrainString += search.rankingData.originalField.terrain.toString();
      allField.push(terrainString);
    }
    if ( search.rankingData.originalField.weather ) {
      let weatherString = "";
      if ( search.rankingData.originalParameters.misc.lockWeather ) {
         weatherString = "🔒";
      }
      weatherString += search.rankingData.originalField.weather.toString();
      allField.push(weatherString);
    }
    if ( search.rankingData.originalField.isVesselOfRuin ) {
      allField.push('Vessel of Ruin');
    }
    if ( search.rankingData.originalField.isTabletsOfRuin ) {
      allField.push('Tablets of Ruin');
    }
    if ( search.rankingData.originalField.isSwordOfRuin ) {
      allField.push('Sword of Ruin');
    }
    if ( search.rankingData.originalField.isBeadsOfRuin ) {
      allField.push('Beads of Ruin');
    }
    if ( search.rankingData.originalField.isGravity ) {
      allField.push('Gravity');
    }
    if ( search.rankingData.originalField.isWonderRoom ) {
      allField.push('Wonder Room');
    }

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
    if ( allField.length > 0 ) {
      infoPanel.textContent += " | Field: " + allField.join(", ");
    }
    if ( bossSide.length > 0 ) {
      infoPanel.textContent += " | Boss: " + bossSide.join(", ");
    }
    if ( defenderSide.length > 0 ) {
      infoPanel.textContent += " | Defender: " + defenderSide.join(", ");
    }

    if ( search.rankingData.originalField.defenderSide.numFriendGuard > 0 ) {
      infoPanel.textContent += ` | Friend Guard: x${search.rankingData.originalField.defenderSide.numFriendGuard}`;
    }
    UIElements.Results.InfoEffectsAndSettings.classList.remove('collapsed');
  }



  export function updatePaging( search: SearchResult ) {
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


  export function readPSFData() {
    let newPSFProfile : PostSearchFilter = new PostSearchFilter();

    // Read selected moves
    if ( UIElements.Results.PSFFilterLearnMove.checked) {
        // If whitelist is populated
        if ( UIElements.Results.PSFLearnMoveList.childElementCount > 0 ) {
            // Filter for each move selected
            for ( let index = 0; index < UIElements.Results.PSFLearnMoveList.childElementCount; ++index ) {
                // Get move name from chosen
                let moveName = (UIElements.Results.PSFLearnMoveList.children[index] as HTMLElement).dataset.originalValue!;
                newPSFProfile.learnMoveList.push( moveName );
            }
        }
    }

    // Read STAB check
    newPSFProfile.checkStab = UIElements.Results.PSFBaseSTAB.checked;

    return newPSFProfile;
}

  export function hidePSFInfo() {
    UIElements.Results.InfoFilters.classList.add('collapsed');
  }
  export function showPSFInfo() {
    UIElements.Results.InfoFilters.classList.remove('collapsed');
  }

  export function summarizePSF( gen: Generation, psf: PostSearchFilter ) {
    // If PSF contains default values, then there is no active filter
    if ( psf.isDefault() ) {
      hidePSFInfo();
    }
    else {
      UIElements.Results.InfoFilters.innerHTML = "";

      let contents = "[Active Filter]";
      if ( psf.learnMoveList.length > 0 ) {
        contents += " ⬤ Can Learn:";
        for ( let m = 0; m < psf.learnMoveList.length; ++m ) {
          let moveData = gen.moves.get(toID(psf.learnMoveList[m]));
          if ( moveData ) {
            contents += ` <span class=\"${moveData.type.toLowerCase()}-type\">${psf.learnMoveList[m]}</span>`;
          }
        }
        //contents += " <=> Can Learn: \"<span class=\"stellar-type\">" + psf.learnMoveList.join("\", \"") + "\"</span>";
      }

      if ( psf.checkStab ) {
        contents += " ⬤ STAB Only"
      }

      UIElements.Results.InfoFilters.innerHTML = contents;
      showPSFInfo();
    }
  }
  
export function applyPostSearchFilters( gen: Generation, search : SearchResult ) {
  let psf = readPSFData();

  // Reset filtered data
  search.filteredData = search.rankingData.originalData;

  // Filter for each move selected
  psf.learnMoveList.forEach(moveName => {
    let moveLearnset = moveLearnsetDictionary.get(moveName);
    
    // If valid move learnset (should always be valid)
    if ( moveLearnset ) {
      // Filter out all entries which do not learn this move
      search.filteredData = search.filteredData.filter( (val) => {
        return moveLearnset!.includes( val.species );
      });
    }
  });

    // STAB filter
    let teraType = search.rankingData.raidBoss.teraType!;
    if ( UIElements.Results.PSFBaseSTAB.checked ) {
      search.filteredData = search.filteredData.filter( (val) => {
        return search.rankingData.bossMatchup.checkAtLeastOneSTAB( val.type1, val.type2); 
      });
    }

    summarizePSF( gen, psf );

    // Update table starting from page 1
    updatePaging( search );
    createResultTableEntries( search, 1 );
}

