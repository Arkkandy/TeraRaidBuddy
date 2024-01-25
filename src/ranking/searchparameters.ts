import { StatID } from "../smogon-calc";
import { Ability, StatusName, TypeName } from "../smogon-calc/data/interface";


export enum DefensiveNaturePreference {
    HinderHighestStat,
    HinderHighestOfAtkSpa,
    HinderHighestOfAtkSpaSpe,
    HinderLowestOfAtkSpa,
    HinderLowestOfAtkSpaSpe,
    HinderOnlyAtk,
    HinderOnlyDefense,
    HinderOnlySpa,
    HinderOnlySpd,
    HinderOnlySpe
}

export enum SpeedNaturePreference {
    HinderOnlyAtk,
    HinderOnlyDef,
    HinderOnlySpa,
    HinderOnlySpd,
    HinderOnlySpe,
    HinderHighestStat,
    HinderHighestOffensive,
    HinderHighestDefensive,
    HinderLowestStat,
    HinderLowestOffensive,
    HinderLowestDefensive
}

export class RankingParameters {
    public filters: FilteringParameters = new FilteringParameters();
    public results: ResultPrintParameters = new ResultPrintParameters();
    public search: SearchParameters = new SearchParameters();
    public ability: AbilityParameters = new AbilityParameters();
    public items: ItemParameters = new ItemParameters();
    public advanced: AdvancedParameters = new AdvancedParameters();

    public hpMultiplier : number = 1;
}


export enum SearchRankingType {
    NoInvestment = "NoInvestment",
    FullDef = "FullDef",
    FullSpD = "FullSpD",
    SimpleOffense = "SimpleOffense",
    MixedDefSimple = "MixedDefSimple",
    MixedDefOptimal = "MixedDefOptimal",
    OutspeedIntoOptimalDef = "OutspeedIntoOptimalDef",
    AttackIntoOptimalDef = "AttackIntoOptimalDef",
    OutspeedIAttackIDefense = "OutspeedIAttackIDefense",
    BestDefenseThreshold = "BestDefenseThreshold",
    BestDefenseThresholdIntoAttack = "BestDefenseThresholdIntoAttack",
    OutspeedIntoBDT = "OutspeedIntoBDT",
    OutspeedIntoBDTIntoAttack = "OutspeedIntoBDTIntoAttack"
}

class SearchParameters {
    public rankingType: SearchRankingType = SearchRankingType.MixedDefOptimal;

    public isRankByCritical: boolean = false;

    public defNaturePreferenceNonPQ: DefensiveNaturePreference = DefensiveNaturePreference.HinderLowestOfAtkSpa;
    public defNaturePreferencePQ: DefensiveNaturePreference = DefensiveNaturePreference.HinderHighestStat;

    public speedNaturePreference: SpeedNaturePreference = SpeedNaturePreference.HinderLowestOffensive;
}

class FilteringParameters {
    public whiteListIDs: string[] = [];
    public blackListIDs: string[] = [];

    public byAbility: string = "";
    public byBaseType: string = "";

    public skipNonFinalEvolutions: boolean = false;
    public skipFinalEvolutions: boolean = false;
    public checkOnlySTABDefenders: boolean = false;
    
    public applyRarityFilter: boolean = false;
    public showRegularPokemon: boolean = false;
    public showParadoxPokemon: boolean = false;
    public showLegendaryPokemon: boolean = false;
    public showMythicalPokemon: boolean = false;

    public applyDexFilter: boolean = false;
    public showPaldeaPokemon: boolean = false;
    public showTealMaskPokemon: boolean = false;
    public showIndigoPokemon: boolean = false;
    public showHomePokemon: boolean = false;
}

/**
 * Determine which damage entries will be visible/calculated by the ranking function
*/
export enum PrintVisibleDamage {
    /** Show best move and main movepool. Show both normal and critical damage. */
    BothMoveBoth,
    /** Show best move and main movepool. Show normal or critical damage as selected by rank. */
    BothMoveSelect,
    /** Show only best move. Show both normal and critical damage. */
    BestMoveBoth,
    /** Show only best move. Show normal or critical damage as selected by rank. */
    BestMoveSelect,
    /** Show only main movepool. Show both normal and critical damage. */
    MainMoveBoth,
    /** Show only main movepool. Show normal or critical damage as selected by rank. */
    MainMoveSelect,
    /** Show best main move and the extra move pool. Show normal or critical damage as selected by rank. **/
    BestMainExtraPoolBoth,
    /** Show best main move and the extra move pool. Show both normal and critical damage. **/
    BestMainExtraPoolSelect,
}

export enum PrintResultNumber {
    Top30,
    Top50,
    Top100,
    Upto50Percent,
    AllResults
}

class ResultPrintParameters {
    public moveDamageVisibility: PrintVisibleDamage = PrintVisibleDamage.BothMoveBoth;
    public showSprites: boolean = false;
    public showIfOutspeed: boolean = true;
    public showLeftoverEVs: boolean = true;
    public resultFiltering: PrintResultNumber = PrintResultNumber.Top30;
}

class AbilityParameters {
    public disableAttackerAbility: boolean = false;
    public disableDefenderAbility: boolean = false;

    public overrideAttackPQBoostedStat: string = "";
    public overrideDefenderPQBoostedStat: string = "";

    public activateWeatherSettingAbilities: boolean = true;
    public activateTerrainSettingAbilities: boolean = true;

    public forceTriggers: boolean = true;

    public enableMultiscaleAndShadowShield: boolean = true;

    public enableTeraShell: boolean = true;

    public enableMarvelScale: boolean = true;
    public enableGrassPelt: boolean = true;
    //public enableFieldChangesForPQ: boolean = false;

    public enableOpportunistStatCopy: boolean = true;
    public enableDauntlessShieldBoost: boolean = true;
    public enableIntrepidSwordBoost: boolean = true;
    public enableIntimidateStatDrop: boolean = true;

    public enableNeutralizingGas: boolean = true;
    public enableImposterTransform: boolean = true;
    public enableSlowStart: boolean = true;

    public enableOrichalcumPulse: boolean = true;
    public enableDrought: boolean = true;
    public enableDrizzle: boolean = true;
    public enableSandStream: boolean = true;
    public enableSnowWarning: boolean = true;
    public enableHadronEngine: boolean = true;
    public enableElectricSurge: boolean = true;
    public enableGrassySurge: boolean = true;
    public enablePsychicSurge: boolean = true;
    public enableMistySurge: boolean = true;
    public enableWaterAbsorb: boolean = true;
    public enableDrySkin: boolean = true;
    public enableStormDrain: boolean = true;
    public enableVoltAbsorb: boolean = true;
    public enableMotorDrive: boolean = true;
    public enableLightningRod: boolean = true;
    public enableFlashFire: boolean = true;
    public enableSapSipper: boolean = true;
    public enableLevitate: boolean = true;
    public enableQuarkDrive: boolean = true;
    public enableProtosynthesis: boolean = true;
    public enableAirLock: boolean = true;

    public forceTriggerGrassPelt: boolean = false;
    public forceTriggerMarvelScale: string = "";
    public forceTriggerQuarkDrive: boolean = false;
    public forceTriggerProtosynthesis: boolean = false;
}

class ItemParameters {
    public disableBossItem = false;
    public disableDefenderItem = false;
    public defaultAttackerItem: string = "";
    public giveBoosterEnergytoPQ: boolean = false;
    public giveEvioliteToNFE: boolean = false;
    public enableMirrorHerbStatCopy: boolean = false;

}

class FieldParameters {


}

class AdvancedParameters {
    public lockTerrain: boolean = false;
    public lockWeather: boolean = false;
    public defenderTeraType: string = '';
}