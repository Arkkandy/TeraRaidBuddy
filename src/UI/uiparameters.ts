
import UIElements from "./uielements";

import { DefensiveNaturePreference, RankingParameters, SearchRankingType } from "../ranking/searchparameters";
import { Terrain, Weather } from "../smogon-calc/data/interface";
import { Field } from "../smogon-calc";





export function readSearchParameters() {
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

  // TODO: Implement in full
export function readFieldParameters() {

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


export function updateDexFilterDescription() {
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
  
export function updateRarityFilterDescription() {
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
