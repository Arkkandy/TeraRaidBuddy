import UIElements from "./uielements";
import { AbilitySelectionMode, RaidPresetMode } from "./uilogic";
import { SearchDataModule } from '../data/filteringdata'
import { RaidBossPreset, tier5EventRaidBossPresets, tier5RaidBossPresets, tier6RaidBossPresets, tier7EventRaidBossPresets } from "../presets/raidpreset";
import { RankingParameters } from "../ranking/searchparameters";
import { Generation, NatureName, StatsTable, TypeName } from "../smogon-calc/data/interface";
import { getImagePath } from "./util";
import { showExtraActions } from "./extractiontable";
import { Move, Pokemon, Stats, toID } from "../smogon-calc";
import { getModifiedStat } from "../smogon-calc/mechanics/util";



let debounceTimer : NodeJS.Timeout;
// Defer image loading until a few moments after the user decides
function lazyBossPresentationImageLoader( newImgURL : string ) {
  
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      UIElements.RaidBoss.BossSprite.src = newImgURL;
    }, 300);
}

export function updateBossImage(presetMode: RaidPresetMode) {
    let bossName : string = "_unknown";
  
    switch ( presetMode ) {
      case RaidPresetMode.Custom: bossName = UIElements.RaidBoss.CustomSelect.value; break;
      case RaidPresetMode.FiveStar: bossName = UIElements.RaidBoss.R5Select.value; break;
      case RaidPresetMode.FiveStarEvent: bossName = UIElements.RaidBoss.R5ESelect.value; break;
      case RaidPresetMode.SixStar: bossName = UIElements.RaidBoss.R6Select.value; break;
      case RaidPresetMode.SevenStarEvent: bossName = UIElements.RaidBoss.R7ESelect.value; break;
    }
  
    let fullPath = getImagePath( bossName );
    //UIElements.RaidBoss.BossSprite.src = fullPath;
    lazyBossPresentationImageLoader( fullPath );
}

export async function reselectAbility( currentPresetMode: RaidPresetMode) {
    let activeSelect : HTMLSelectElement | undefined = undefined;
  
    switch ( currentPresetMode ) {
      case RaidPresetMode.Custom: activeSelect = UIElements.RaidBoss.CustomSelect; break;
      case RaidPresetMode.FiveStar: activeSelect = UIElements.RaidBoss.R5Select; break;
      case RaidPresetMode.FiveStarEvent: activeSelect = UIElements.RaidBoss.R5ESelect; break;
      case RaidPresetMode.SixStar: activeSelect = UIElements.RaidBoss.R6Select; break;
      case RaidPresetMode.SevenStarEvent: activeSelect = UIElements.RaidBoss.R7ESelect; break;
    }
  

    let filteringData = await SearchDataModule.GetData();
    let pokeIndex = filteringData.findIndex( item => item.name == ( activeSelect as HTMLSelectElement ).value );
  
    /* Remake the natural ability select */ 
    // Remove children
    UIElements.RaidBoss.BossNaturalAbilitySelect.innerHTML = "";
  
    // Add ability slot 1 (Always exists)
    const newOption1 = document.createElement('option');
    newOption1.value = filteringData[pokeIndex].abilities.slot1;
    newOption1.text = "1:" + filteringData[pokeIndex].abilities.slot1;
    UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOption1);
  
    // Add ability 2 if applicable
    if ( filteringData[pokeIndex].abilities.slot2 ) {
      const newOption2 = document.createElement('option');
      newOption2.value = filteringData[pokeIndex].abilities.slot2 as string;
      newOption2.text = "2:" + filteringData[pokeIndex].abilities.slot2 as string;
      UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOption2);
    }
    // Add hidden ability if applicable
    if ( filteringData[pokeIndex].abilities.h ) {
      const newOptionH = document.createElement('option');
      newOptionH.value = filteringData[pokeIndex].abilities.h as string;
      newOptionH.text = "H:" + filteringData[pokeIndex].abilities.h as string;
      UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionH);
    }
  
    /* Special ability checks:
    #TODO include this as part of the dataset and not hardcoded? */
    if ( filteringData[pokeIndex].name == "Greninja") {
      const newOptionS = document.createElement('option');
      newOptionS.value = "Battle Bond";
      newOptionS.text = "S:" + "Battle Bond";
      UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionS);
    }
    if ( filteringData[pokeIndex].name == "Rockruff") {
      const newOptionS = document.createElement('option');
      newOptionS.value = "Own Tempo";
      newOptionS.text = "S:" + "Own Tempo";
      UIElements.RaidBoss.BossNaturalAbilitySelect.add(newOptionS);
    }
  }

  export function getRaidPreset( presetList : RaidBossPreset[], id : string ) {
    return presetList.find( item => item.speciesName == id );
  }
  export function getSelectedBossPreset(currentPresetMode: RaidPresetMode) {
    let preset : RaidBossPreset | undefined;
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

  export function setBossPresetMoves( raidBoss: RaidBossPreset ) {
    setBossPresetMainMoves( raidBoss );
    setBossPresetAddMoves( raidBoss );
  }
  
  export function setBossPresetMainMoves( raidBoss: RaidBossPreset ) {
    // Assign main moveset - Only if the respective slot is valid in the preset
    UIElements.RaidBoss.BossMove1.value = ( raidBoss.mainMoves.length > 0 ? raidBoss.mainMoves[0] : "(No Move)");
    UIElements.RaidBoss.BossMove2.value = ( raidBoss.mainMoves.length > 1 ? raidBoss.mainMoves[1] : "(No Move)");
    UIElements.RaidBoss.BossMove3.value = ( raidBoss.mainMoves.length > 2 ? raidBoss.mainMoves[2] : "(No Move)");
    UIElements.RaidBoss.BossMove4.value = ( raidBoss.mainMoves.length > 3 ? raidBoss.mainMoves[3] : "(No Move)");
}

export function setBossPresetAddMoves( raidBoss: RaidBossPreset ) {
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



export function reselectPresetDefaults( gen: Generation, currentPresetMode: RaidPresetMode) {
    let preset : RaidBossPreset | undefined = getSelectedBossPreset(currentPresetMode);
  
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
  
    // Set HP multiplier
    if ( preset.hpMultiplier != undefined ) {
      UIElements.RaidBoss.BossHPMultiplier.value = preset.hpMultiplier.toString();
    }
    else {
      UIElements.RaidBoss.BossHPMultiplier.value = "1";
    }

    // Set held item
    if ( preset.item != undefined ) {
      UIElements.RaidBoss.BossHeldItem.value = raidBoss.item!;
    }
    else {
      UIElements.RaidBoss.BossHeldItem.value = "";
    }
  
    // Set Extra Actions
    showExtraActions( gen, preset.extraActions, UIElements.RaidBoss.BossActionTable );
}

export function retrieveSelectedBossSpecies( presetMode : RaidPresetMode ) : string {
    switch( presetMode ) {
      case RaidPresetMode.Custom: return UIElements.RaidBoss.CustomSelect.value;
      case RaidPresetMode.FiveStar: return UIElements.RaidBoss.R5Select.value;
      case RaidPresetMode.FiveStarEvent: return UIElements.RaidBoss.R5ESelect.value;
      case RaidPresetMode.SixStar: return UIElements.RaidBoss.R6Select.value;
      case RaidPresetMode.SevenStarEvent: return UIElements.RaidBoss.R7ESelect.value;
    }
  
    return "";
  }


export function readBossMainMoveset(gen: Generation, parameters: RankingParameters) {

    // Prevent dupes with set
    let inputValues : Set<string>= new Set<string>();
  
    inputValues.add( UIElements.RaidBoss.BossMove1.value );
    inputValues.add( UIElements.RaidBoss.BossMove2.value );
    inputValues.add( UIElements.RaidBoss.BossMove3.value );
    inputValues.add( UIElements.RaidBoss.BossMove4.value );
  
    // Remove "(No Move)" entry
    inputValues.delete("(No Move)");
  
    return analyzeMoveInputs(gen, inputValues, false);
  }
  export function readBossExtraMoves(gen: Generation, parameters: RankingParameters) {
  
    // Prevent dupes with set
    let inputValues : Set<string>= new Set<string>();
  
    inputValues.add( UIElements.RaidBoss.BossAddMove1.value );
    inputValues.add( UIElements.RaidBoss.BossAddMove2.value );
    inputValues.add( UIElements.RaidBoss.BossAddMove3.value );
    inputValues.add( UIElements.RaidBoss.BossAddMove4.value );
  
    // Remove "(No Move)" entry
    inputValues.delete("(No Move)");
  
    return analyzeMoveInputs(gen, inputValues, true);
  }
  
  export function analyzeMoveInputs( gen: Generation, inputMoves : Set<string>, useSpread : boolean ) {
    let moves : Move[] = [];
    for ( let value of inputMoves ) {
      // Special case for Shell Side Arm
      // Must be divided into physical and special only versions for the purposes of stat optimization
      if ( value == "Shell Side Arm") {
        let moveP = new Move(gen, value+"(P)");
        let moveS = new Move(gen, value+"(S)");

        moveP.isStellarFirstUse = true;
        moveS.isStellarFirstUse = true;

        moves.push(moveP);
        moves.push(moveS);
      }
      else {
        let move = new Move(gen, value );

        move.isStellarFirstUse = true;

        /* Only extra moves will use spread damage reduction */
        if ( useSpread ) {
          move.forceDamageSpread = true;
        }

        if ( value == 'Avalanche' && UIElements.SearchParams.MoveBoostAvalanche.checked ) {
          move.doubleAvalanche = true;
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


  export function updateHPStat( gen: Generation ) {
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
      
    }
  }

  export function updateAtkStat( gen: Generation ) {
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
      
    }
  }

  export function updateDefStat( gen: Generation ) {
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
      
    }
  }

  export function updateSpaStat( gen: Generation ) {
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
      
    }
  }

  export function updateSpdStat( gen: Generation ) {
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
      
    }
  }


  export function updateSpeStat( gen: Generation ) {
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
      
    }
  }


  export function overwriteStats( gen: Generation, currentPresetMode : RaidPresetMode ) {
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
  
    let selectedSpecies = gen.species.get( toID( raidBossName ) );
    
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
  
    updateHPStat(gen);
    updateAtkStat(gen);
    updateDefStat(gen);
    updateSpaStat(gen);
    updateSpdStat(gen);
    updateSpeStat(gen);
  }

  


















  export function setUIHpBase( baseValue: number ) {
    UIElements.RaidBoss.BossHPBase.textContent = baseValue.toString();
  }
  export function setUIHpIV( IV: number ) {
    UIElements.RaidBoss.BossHPIV.textContent = IV.toString();
  }
  export function setUIHpEV( EV: number ) {
    UIElements.RaidBoss.BossHPEV.textContent = EV.toString();
  }

  export function setUIAtkBase( baseValue: number ) {
    UIElements.RaidBoss.BossAtkBase.textContent = baseValue.toString();
  }
  export function setUIAtkIV( IV: number ) {
    UIElements.RaidBoss.BossAtkIV.textContent = IV.toString();
  }
  export function setUIAtkEV( EV: number ) {
    UIElements.RaidBoss.BossAtkEV.textContent = EV.toString();
  }
  export function setUIAtkStage( stage: number ) {
    UIElements.RaidBoss.BossAtkStage.textContent = stage.toString();
  }


  export function setUIDefBase( baseValue: number ) {
    UIElements.RaidBoss.BossDefBase.textContent = baseValue.toString();
  }
  export function setUIDefIV( IV: number ) {
    UIElements.RaidBoss.BossDefIV.textContent = IV.toString();
  }
  export function setUIDefEV( EV: number ) {
    UIElements.RaidBoss.BossDefEV.textContent = EV.toString();
  }
  export function setUIDefStage( stage: number ) {
    UIElements.RaidBoss.BossDefStage.textContent = stage.toString();
  }


  export function setUISpaBase( baseValue: number ) {
    UIElements.RaidBoss.BossSpaBase.textContent = baseValue.toString();
  }
  export function setUISpaIV( IV: number ) {
    UIElements.RaidBoss.BossSpaIV.textContent = IV.toString();
  }
  export function setUISpaEV( EV: number ) {
    UIElements.RaidBoss.BossSpaEV.textContent = EV.toString();
  }
  export function setUISpaStage( stage: number ) {
    UIElements.RaidBoss.BossSpaStage.textContent = stage.toString();
  }


  export function setUISpdBase( baseValue: number ) {
    UIElements.RaidBoss.BossSpdBase.textContent = baseValue.toString();
  }
  export function setUISpdIV( IV: number ) {
    UIElements.RaidBoss.BossSpdIV.textContent = IV.toString();
  }
  export function setUISpdEV( EV: number ) {
    UIElements.RaidBoss.BossSpdEV.textContent = EV.toString();
  }
  export function setUISpdStage( stage: number ) {
    UIElements.RaidBoss.BossSpdStage.textContent = stage.toString();
  }


  export function setUISpeBase( baseValue: number ) {
    UIElements.RaidBoss.BossSpeBase.textContent = baseValue.toString();
  }
  export function setUISpeIV( IV: number ) {
    UIElements.RaidBoss.BossSpeIV.textContent = IV.toString();
  }
  export function setUISpeEV( EV: number ) {
    UIElements.RaidBoss.BossSpeEV.textContent = EV.toString();
  }
  export function setUISpeStage( stage: number ) {
    UIElements.RaidBoss.BossSpeStage.textContent = stage.toString();
  }




  export function readBossSelectedAbility( selectionMode : AbilitySelectionMode ) : string {
    return ( selectionMode == AbilitySelectionMode.NaturalAbilities ? UIElements.RaidBoss.BossNaturalAbilitySelect.value : UIElements.RaidBoss.BossAllAbilitiesSelect.value );
  }

  // #TODO: Implement in full
export function readRaidBossParameters( gen: Generation, presetMode : RaidPresetMode, abilitySelectMode: AbilitySelectionMode ) {
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
  
    return new Pokemon( gen, retrieveSelectedBossSpecies(presetMode), {
      level: UIElements.RaidBoss.BossLevel.valueAsNumber,
      nature: UIElements.RaidBoss.BossNature.value,
      ivs: ivs,
      evs: evs,
      item: UIElements.RaidBoss.BossHeldItem.value,
      teraType: (UIElements.RaidBoss.BossTeraType.value as TypeName),
      ability: readBossSelectedAbility( abilitySelectMode ),
      boosts: boosts,
      status: status,
      boostedStat: 'auto'
    });
  }
