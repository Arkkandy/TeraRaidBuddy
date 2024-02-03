/*import {calculate,Generations,Move, StatsTable, toID, Result, Field} from '@smogon/calc'
import {Pokemon} from '@smogon/calc/src'
import {Generation, NatureName } from '@smogon/calc/src/data/interface';
import {FilterDataEntry, filteringData} from './filteringdata.js'
import {RankingParameters, SearchRankingType } from './searchparameters.js';
import { customDamageFastRecalc } from './fastdamage.js';*/



/*import {calculate,Generations,Move,StatsTable,toID,Result,Field,
    Pokemon as APokemon} from '@smogon/calc'
import {Pokemon} from '@smogon/calc/src'
import {Generation, NatureName} from '@smogon/calc/src/data/interface'*/
import { StatsTable } from '../smogon-calc';
import * as Smogon from '../smogon-calc'
import {AbilityName, Generation, NatureName, Specie, StatusName, TypeName } from '../smogon-calc/data/interface';
import { getFinalSpeed, getMoveEffectiveness, isQPActive } from '../smogon-calc/mechanics/util';
import { recalculateFinalDamage } from './fastdamage';

import {FilterDataEntry, RarityFlag, filteringData} from './filteringdata'
import getOptimalDefensiveSpread from './optimalspreadcalc';
import getOptimalDefensiveSpread_PQ from './optimalspreadpqcalc';
import getOptimalDefensiveThresholdSpread from './optimalthresholdcalc';
import getOptimalDefensiveThreshold_PQ from './optimalthresholdpqcalc';
import {DefensiveNaturePreference, PrintVisibleDamage, RankingParameters, SearchRankingType } from './searchparameters';
import { DefenseStatOptimizer } from './statoptimization';
import { DefenseStatOptimizerPQ } from './statoptimizationpq';
import { BattlefieldSide, EVSpread, TypeMatchup, calcModifiedDefenseStat, calcModifiedSpDefenseStat, evsToStringShowAll, findDefEvPQThreshold, findSpdEvPQThreshold, getHighestStat_PQ, getMinimumOutspeedEV, getNatureFromStats, getTotalEVInvestment, selectDefensiveNaturePreference, selectSpeedNaturePreference, statToNatureIndex } from './util';
//import { recalculatableDamage } from './fastdamage.js';


export class DamagePair {
    public rawValue: number;
    public hpPercent: number;

    constructor( rawValue: number, hpPercent: number) {
        this.rawValue = rawValue;
        this.hpPercent = hpPercent;
    }
}

export class RankingResult {
    public originalData: RankingResultEntry[] = [];
    public originalParameters: RankingParameters;
    public originalField: Smogon.Field;
    public mainMoves: Smogon.Move[];
    public extraMoves: Smogon.Move[];
    public raidBoss: Smogon.Pokemon;
    public bossMatchup: TypeMatchup;

    // May delete these
    public entriesAnalyzed: number = 0;
    public entriesSkipped: number = 0;

    constructor( parameters: RankingParameters, mainMoves: Smogon.Move[], extraMoves: Smogon.Move[], raidBoss: Smogon.Pokemon, bossMatchup: TypeMatchup, originalField: Smogon.Field ) {
        this.originalParameters = parameters;
        this.mainMoves = mainMoves;
        this.extraMoves = extraMoves;
        this.raidBoss = raidBoss;
        this.bossMatchup = bossMatchup;
        this.originalField = originalField;
    }
}

export class RankingResultEntry {
    public species: string;
    public type1: TypeName;
    public type2: TypeName | undefined;
    public teraType?: string;
    
    public damage: DamagePair[] = [];
    public secondaryDamage: DamagePair[] = [];

    public extraDamage: DamagePair[] = [];
    public secondaryExtraDamage: DamagePair[] = [];

    public maxDamageIndex : number = 0;
    public nature: string = 'Bashful';
    public evSpread: Smogon.StatsTable<number>;
    public outspeed: boolean;
    public modifiers: string[] = [];

    public finalRank: number = 0;

    public originalAttacker?: Smogon.Pokemon;
    public originalDefender?: Smogon.Pokemon;
    public originalField?: Smogon.Field;

    constructor( species: NamedCurve, type1: TypeName, type2: TypeName | undefined, evSpread: Smogon.StatsTable<number>, outspeed: boolean ) {
        this.species = species;
        this.type1 = type1;
        this.type2= type2;
        //this.damage = damage;
        this.evSpread = evSpread;
        this.outspeed = outspeed;
    }

    public addModifier(mod: string ) {
        // Add modifier if it hasn't already been added
        if ( !this.modifiers.includes(mod)) {
            this.modifiers.push( mod );
        }
    }

    public getListOfModifiers() {
        if ( this.modifiers.length == 0 ) {
            return "";
        }
        
        return this.modifiers.join( ", ");
    }

    public calcMaxDamage() {
        let maxDamage = Number.NEGATIVE_INFINITY;
        for ( let m = 0; m < this.damage.length; ++m) {
            if ( this.damage[m].hpPercent > maxDamage ) {
                maxDamage = this.damage[m].hpPercent;
                this.maxDamageIndex = m;
            }
        }
    }

    public getMaxDamagePercent() : number {
        return this.damage[this.maxDamageIndex].hpPercent;
    }
    public getMaxDamageSecPercent() : number {
        return this.secondaryDamage[this.maxDamageIndex].hpPercent;
    }
    public getTotalDamagePercent() : number {
        let count = 0;
        this.damage.forEach( item => count += item.hpPercent );
        return count;
    }
}

export function raidDefenderRanking( gen:Generation, raidBoss: Smogon.Pokemon, mainMoves: Smogon.Move[], extraMoves: Smogon.Move[], field: Smogon.Field, parameters: RankingParameters = new RankingParameters() ) {

    /* SANITY CHECKS */
    console.log("-----------------------------")
    console.log("Boss: %s", raidBoss.name);
    console.log("Boss main moveset: ");
    mainMoves.forEach( move => {
        console.log("  -> %s",move.name);
    });
    console.log("Boss stats");
    console.log("  -> Nature: %s",raidBoss.nature);
    console.log("  -> Ability: %s",raidBoss.ability);
    console.log("  -> %s",evsToStringShowAll("IVs", raidBoss.ivs ));
    console.log("  -> %s",evsToStringShowAll("EVs", raidBoss.evs ));
    console.log(evsToStringShowAll("Stages", raidBoss.boosts ));
    console.log("Field data");
    console.log("  -> Terrain: %s", field.terrain);
    console.log("  -> Weather: %s", field.weather);
    /*-----------------------------*/ 

    /* Setup Main Moveset */
    let moves: Smogon.Move[]  = [];
    for ( let m = 0; m < mainMoves.length; ++m ) {
        let moveCopy = mainMoves[m].clone();
        // Set crit = true if we're ranking by critical damage
        if ( parameters.mainparams.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        moves.push( moveCopy );
    }
    let movesSecondaryDamage: Smogon.Move[]  = [];
    for ( let m = 0; m < mainMoves.length; ++m ) {
        let moveCopy = mainMoves[m].clone();
        // If ranking is not done by critical damage, secondary damage is critical
        if ( !parameters.mainparams.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        movesSecondaryDamage.push( moveCopy );
    }


    /* Setup Extra Moves */
    let eMoves: Smogon.Move[]  = [];
    for ( let m = 0; m < extraMoves.length; ++m ) {
        let moveCopy = extraMoves[m].clone();
        // Set crit = true if we're ranking by critical damage
        if ( parameters.mainparams.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        eMoves.push( moveCopy );
    }

    let eMovesSecondaryDamage: Smogon.Move[]  = [];
    for ( let m = 0; m < extraMoves.length; ++m ) {
        let moveCopy = extraMoves[m].clone();
        // If ranking is not done by critical damage, secondary damage is critical
        if ( !parameters.mainparams.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        eMovesSecondaryDamage.push( moveCopy );
    }
    let isCalculateSecondaryDamage =
        parameters.results.moveDamageVisibility == PrintVisibleDamage.BestMoveBoth || PrintVisibleDamage.BothMoveBoth || PrintVisibleDamage.MainMoveBoth || PrintVisibleDamage.BestMainExtraPoolBoth;

    if ( parameters.ability.disableAttackerAbility ) {
        raidBoss.ability = undefined;
    }
    if ( parameters.items.disableBossItem ) {
        raidBoss.item = undefined;
    }

    setAbilityTerrain( raidBoss.ability as string, field, parameters );
    setAbilityWeather( raidBoss.ability as string, field, parameters );

    // Determine boss defensive matchups in advance
    let raidBossTypeMatchup = new TypeMatchup( gen, raidBoss.types[0], raidBoss.types[1], raidBoss.teraType);

    let entriesAnalyzed = 0;
    let filtered = 0;

    let useDefenderTeraType = false;
    let defenderTeraType: TypeName | undefined = undefined;
    if ( parameters.mainparams.defenderTeraType != '' ) {
        defenderTeraType = parameters.mainparams.defenderTeraType as TypeName;
        useDefenderTeraType = true;
    }

    let localFilteringData = filteringData;
    // If the whitelist contains at least 1 element
    if ( parameters.filters.whiteListIDs.length > 0 ) {
        // We'll reduce the filtering data to only the entries whitelisted
        localFilteringData = localFilteringData.filter( (item) => parameters.filters.whiteListIDs.includes( item.name ) );
    }

    let finalResult: RankingResult = new RankingResult( parameters, moves, eMoves, raidBoss, raidBossTypeMatchup, field );

    // Perform damage checks against all filterable species
    for ( const data of localFilteringData ) {

        let speciesEntry = gen.species.get(Smogon.toID(data.name))!;
        //console.log('........................'); console.log('Analyzing: %s', data.name);

        // Apply damage calc filters
        if ( applySearchFilters( gen, raidBoss, raidBossTypeMatchup, speciesEntry, data, parameters ) ) {
            filtered++;
            continue;
        }

        // Ogerpon tera forms cannot be used if not terastalized
        if ( !useDefenderTeraType ) {
            if ( data.name == 'Ogerpon-Teal-Tera' || data.name == 'Ogerpon-Cornerstone-Tera' || data.name == 'Ogerpon-Hearthflame-Tera' || data.name == 'Ogerpon-Wellspring-Tera' ) {
                continue;
            }
        }
        // Ogerpon forms can only have the Tera type of their respective mask
        // Terapagos-Terastal is the unterastalized form
        if ( useDefenderTeraType ) {
            if ( data.name == 'Ogerpon' || data.name == 'Ogerpon-Cornerstone' || data.name == 'Ogerpon-Hearthflame' || data.name == 'Ogerpon-Wellspring' || data.name == 'Terapagos-Terastal' ) {
                continue;
            }

            // Ogerpon terastal forms are only available with their respective mask types
            if ( data.name == 'Ogerpon-Teal-Tera' && parameters.mainparams.defenderTeraType != 'Grass' ) {
                continue;
            }
            
            if ( data.name == 'Ogerpon-Cornerstone-Tera' && parameters.mainparams.defenderTeraType != 'Rock' ) {
                continue;
            }
            
            if ( data.name == 'Ogerpon-Hearthflame-Tera' && parameters.mainparams.defenderTeraType != 'Fire' ) {
                continue;
            }
            
            if ( data.name == 'Ogerpon-Wellspring-Tera' && parameters.mainparams.defenderTeraType != 'Water' ) {
                continue;
            }
        }
        // Terapagos-Stellar is only possible with Stellar terastalization
        if ( speciesEntry.name == "Terapagos-Stellar" && !(useDefenderTeraType && parameters.mainparams.defenderTeraType == 'Stellar')) {
            continue;
        }

        // Count entries
        entriesAnalyzed++;

        // Check against all abilities
        let abilities: string[] = [];
        if ( parameters.ability.disableDefenderAbility ) {
            abilities.push("");
        }
        else {
            // Slot 1 always exists
            abilities.push(data.abilities.slot1);
            // Add slot 2 and hidden abilities if they are different from slot 1
            if ( data.abilities.slot2 ) { abilities.push(data.abilities.slot2 as string); }
            if ( data.abilities.h     ) { abilities.push(data.abilities.h     as string); }

            // Filter abilities
            abilities = filterAbilities( abilities, BattlefieldSide.Defender, parameters );
        }

        // Assign held items
        let heldItem = parameters.items.defaultAttackerItem;
        
        // Give mandatory form items to respective pokemon (Arceus plates, Ogerpon masks, Gen4 Origin items, ..)
        // These should never be disabled or modified in any way
        let specialItem = checkSpecialItem( data.name );

        // If special item, dont do any more checks
        if ( specialItem != undefined ) {
            heldItem = specialItem;
        }
        // If no special item, check other parameters
        else {
            if ( parameters.items.disableDefenderItem ) {
                heldItem = "";
            }
            else {
                if ( data.rarity == RarityFlag.Paradox && parameters.items.giveBoosterEnergytoPQ ) {
                    heldItem = "Booster Energy";
                }
                else if ( speciesEntry.nfe && parameters.items.giveEvioliteToNFE ) {
                    heldItem = "Eviolite";
                }
            }
        }

        /* Results are stored for each:
         * - Ability
         * - EV Spread to be tested
        */
        let resultProspects: RankingResultEntry[] = [];

        abilities.forEach( prospectAbility => {
            // #DEBUG: console prints
            //console.log('Analyzing: %s', prospectAbility);

            let modifiedField = field.clone();
            let defaultStatus: '' | StatusName = '';
            let initialBoosts = {atk:0,def:0,spa:0,spd:0,spe:0};
            
            let usedMirrorHerb = false;
            let usedOpportunist = false;

            if ( heldItem == 'Mirror Herb' ) {
                if ( parameters.items.mirrorHerbBoosts[0] > 0 ) {usedMirrorHerb = true; initialBoosts.atk = Math.min(6,initialBoosts.atk + parameters.items.mirrorHerbBoosts[0]);}
                if ( parameters.items.mirrorHerbBoosts[1] > 0 ) {usedMirrorHerb = true; initialBoosts.def = Math.min(6,initialBoosts.def + parameters.items.mirrorHerbBoosts[1]);}
                if ( parameters.items.mirrorHerbBoosts[2] > 0 ) {usedMirrorHerb = true; initialBoosts.spa = Math.min(6,initialBoosts.spa + parameters.items.mirrorHerbBoosts[2]);}
                if ( parameters.items.mirrorHerbBoosts[3] > 0 ) {usedMirrorHerb = true; initialBoosts.spd = Math.min(6,initialBoosts.spd + parameters.items.mirrorHerbBoosts[3]);}
                if ( parameters.items.mirrorHerbBoosts[4] > 0 ) {usedMirrorHerb = true; initialBoosts.spe = Math.min(6,initialBoosts.spe + parameters.items.mirrorHerbBoosts[4]);}
            }
            if ( prospectAbility == 'Opportunist') {
                if ( parameters.ability.opportunistBoosts[0] > 0 ) {usedOpportunist = true; initialBoosts.atk = Math.min(6,initialBoosts.atk + parameters.ability.opportunistBoosts[0]);}
                if ( parameters.ability.opportunistBoosts[1] > 0 ) {usedOpportunist = true; initialBoosts.def = Math.min(6,initialBoosts.def + parameters.ability.opportunistBoosts[1]);}
                if ( parameters.ability.opportunistBoosts[2] > 0 ) {usedOpportunist = true; initialBoosts.spa = Math.min(6,initialBoosts.spa + parameters.ability.opportunistBoosts[2]);}
                if ( parameters.ability.opportunistBoosts[3] > 0 ) {usedOpportunist = true; initialBoosts.spd = Math.min(6,initialBoosts.spd + parameters.ability.opportunistBoosts[3]);}
                if ( parameters.ability.opportunistBoosts[4] > 0 ) {usedOpportunist = true; initialBoosts.spe = Math.min(6,initialBoosts.spe + parameters.ability.opportunistBoosts[4]);}
            }

            setAbilityTerrain( prospectAbility as string, modifiedField, parameters );
            setAbilityWeather( prospectAbility as string, modifiedField, parameters );
            checkGrassPeltTrigger( prospectAbility as string, modifiedField, parameters );
            checkQuarkDriveTrigger( prospectAbility as string, modifiedField, parameters );
            checkProtosynthesisTrigger( prospectAbility as string, modifiedField, parameters );
            defaultStatus = checkMarvelScaleTrigger( prospectAbility as string, defaultStatus, parameters );
            
            let evSpreadProspects : EVSpread[] = [];

            // With "Imposter" we do not require stat optimization
            if ( prospectAbility == "Imposter") {
                evSpreadProspects.push( new EVSpread('Timid', {hp:252,atk:0,def:0,spa:0,spd:0,spe:0}));
            }
            // Wonder Guard?
            else
            // For any other ability, proceed
            if ( parameters.mainparams.rankingType == SearchRankingType.NoInvestment ) {
                evSpreadProspects.push( new EVSpread( 'Bashful', {hp:0, atk:0, def:0, spa:0, spd:0, spe:0} ));
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.FullDef ) {
                let prefPhys = false;
                if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderLowestOfAtkSpa) {
                    prefPhys = speciesEntry.baseStats.atk > speciesEntry.baseStats.spa
                }
                else if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderOnlySpa ) {
                    prefPhys = true;
                }

                if ( prefPhys ) {
                    evSpreadProspects.push( new EVSpread( 'Impish', {hp:252, atk:0, def:252, spa:0, spd:0, spe:0} ));
                }
                else {
                    evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:252, spa:0, spd:0, spe:0} ));
                }               
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.FullSpD ) {
                let prefPhys = false;
                if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderLowestOfAtkSpa) {
                    prefPhys = speciesEntry.baseStats.atk > speciesEntry.baseStats.spa
                }
                else if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderOnlySpa ) {
                    prefPhys = true;
                }

                if ( prefPhys ) {
                    evSpreadProspects.push( new EVSpread( 'Careful', {hp:252, atk:0, def:0, spa:0, spd:252, spe:0} ));
                }
                else {
                    evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:0, spa:0, spd:252, spe:0} ));
                }
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.SimpleOffense ) {
                let prefPhys = false;
                if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderLowestOfAtkSpa) {
                    prefPhys = speciesEntry.baseStats.atk > speciesEntry.baseStats.spa
                }
                else if ( parameters.mainparams.defNaturePreferenceNonPQ == DefensiveNaturePreference.HinderOnlySpa ) {
                    prefPhys = true;
                }
                
                if ( prefPhys ) {
                    evSpreadProspects.push( new EVSpread( 'Adamant', {hp:252, atk:252, def:0, spa:0, spd:0, spe:0 }));
                }
                else {
                    evSpreadProspects.push( new EVSpread( 'Modest', {hp:252, atk:0, def:0, spa:252, spd:0, spe:0 }));
                }
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.MixedDefSimple ) {
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:252, spa:0, spd:4, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:4, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:4, atk:0, def:252, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:252, spa:0, spd:4, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:4, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:4, atk:0, def:252, spa:0, spd:252, spe:0} ));
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.MixedDefOptimal ) {
                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    boostedStat: 'auto'
                });

                let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), dummyDefender, modifiedField, moves, false, parameters );

                evSpreadProspects.push( bestSpread );
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.AttackIntoOptimalDef ) {
                let initialEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let initialSpread = allocateOffensiveSpread( initialEVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, false );

                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: initialSpread.nature,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    evs: initialSpread.EVs,
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    boostedStat: 'auto'
                });

                let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), dummyDefender, modifiedField, moves, true, parameters );

                evSpreadProspects.push( bestSpread );
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.OutspeedIntoOptimalDef ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let prefNature = selectSpeedNaturePreference( neutralDummy, parameters.mainparams.defNaturePreferenceNonPQ );
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: prefNature,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });

                let spreads = calcOptimalOutspeedInvestment( gen, raidBoss.clone(), neutralDummy.clone(), positiveDummy.clone(), modifiedField, moves );

                // Use neutral spread if it exists
                if ( spreads[0] != undefined ) {
                    // Re-enable PQ check (don't want PQ accounted for in speed check)
                    neutralDummy.boostedStat = 'auto';
                    //neutralDummy.nature = spreads[0].nature as NatureName;
                    neutralDummy.evs = spreads[0].EVs;

                    let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), neutralDummy, modifiedField, moves, false, parameters );
                    evSpreadProspects.push( bestSpread );
                }
                // Use positive spread if it exists
                if ( spreads[1] != undefined ) {
                    positiveDummy.boostedStat = 'auto';
                    //positiveDummy.nature = spreads[1].nature as NatureName;
                    positiveDummy.evs = spreads[1].EVs;

                    let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), positiveDummy, modifiedField, moves, true, parameters );
                    evSpreadProspects.push( bestSpread );
                }
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.OutspeedIAttackIDefense ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let prefNature = selectSpeedNaturePreference( neutralDummy, parameters.mainparams.defNaturePreferenceNonPQ );
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: prefNature,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });

                let spreads = calcOptimalOutspeedInvestment( gen, raidBoss.clone(), neutralDummy.clone(), positiveDummy.clone(), modifiedField, moves );

                // Use neutral spread if it exists
                if ( spreads[0] != undefined ) {
                    let newSpread = allocateOffensiveSpread( spreads[0].EVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, false );
                    neutralDummy.nature = newSpread.nature as NatureName;
                    neutralDummy.evs = newSpread.EVs;

                    //console.log('(N) %s', newSpread.toString() );

                    let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), neutralDummy.clone(), modifiedField, moves, true, parameters );
                    evSpreadProspects.push( bestSpread );
                }
                // Use positive spread if it exists
                if ( spreads[1] != undefined ) {
                    let newSpread = allocateOffensiveSpread( spreads[1].EVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, true );
                    positiveDummy.nature = newSpread.nature as NatureName;
                    positiveDummy.evs = newSpread.EVs;

                    //console.log('(P) %s', newSpread.toString() );

                    let bestSpread = calcOptimalDefensiveSpread( gen, raidBoss.clone(), positiveDummy.clone(), modifiedField, moves, true, parameters );
                    evSpreadProspects.push( bestSpread );
                }
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.BestDefenseThreshold ) {
                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    boostedStat: 'auto'
                });

                let bestSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), dummyDefender, modifiedField, moves, false, parameters );

                evSpreadProspects.push( bestSpread );
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.BestDefenseThresholdIntoAttack ) {
                let buildPhysical = speciesEntry.baseStats.atk > speciesEntry.baseStats.spa;

                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: "Hardy",
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    // boostedStat: 'auto' //DONT USE PQ
                });

                let bestSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), dummyDefender, modifiedField, moves, true, parameters );

                let finalSpread = allocateOffensiveSpread( bestSpread.EVs, buildPhysical, false );

                evSpreadProspects.push( finalSpread );
            }
            else if ( parameters.mainparams.rankingType == SearchRankingType.OutspeedIntoBDT ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let prefNature = selectSpeedNaturePreference( neutralDummy, parameters.mainparams.defNaturePreferenceNonPQ );
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: prefNature,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });

                let spreads = calcOptimalOutspeedInvestment( gen, raidBoss.clone(), neutralDummy.clone(), positiveDummy.clone(), modifiedField, moves );

                // Use neutral spread if it exists
                if ( spreads[0] != undefined ) {
                    // Re-enable PQ check (don't want PQ accounted for in speed check)
                    neutralDummy.boostedStat = 'auto';
                    //neutralDummy.nature = spreads[0].nature as NatureName;
                    neutralDummy.evs = spreads[0].EVs;

                    let bestSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), neutralDummy, modifiedField, moves, false, parameters );
                    evSpreadProspects.push( bestSpread );
                }
                // Use positive spread if it exists
                if ( spreads[1] != undefined ) {
                    positiveDummy.boostedStat = 'auto';
                    //positiveDummy.nature = spreads[1].nature as NatureName;
                    positiveDummy.evs = spreads[1].EVs;

                    let bestSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), positiveDummy, modifiedField, moves, true, parameters );
                    evSpreadProspects.push( bestSpread );
                }
            }

            else if ( parameters.mainparams.rankingType == SearchRankingType.OutspeedIntoBDTIntoAttack ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let prefNature = selectSpeedNaturePreference( neutralDummy, parameters.mainparams.defNaturePreferenceNonPQ );
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: prefNature,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });

                let spreads = calcOptimalOutspeedInvestment( gen, raidBoss.clone(), neutralDummy.clone(), positiveDummy.clone(), modifiedField, moves );

                // Use neutral spread if it exists
                if ( spreads[0] != undefined ) {
                    neutralDummy.evs = spreads[0].EVs;
                    let defSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), neutralDummy.clone(), modifiedField, moves, true, parameters );

                    // Put remaining EVs into attack
                    let bestSpread = allocateOffensiveSpread( defSpread.EVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, false );

                    //console.log('(N) %s', newSpread.toString() );

                    evSpreadProspects.push( bestSpread );
                }
                // Use positive spread if it exists
                if ( spreads[1] != undefined ) {
                    positiveDummy.evs = spreads[1].EVs;
                    let defSpread = calcOptimalDefensiveThreshold( gen, raidBoss.clone(), positiveDummy.clone(), modifiedField, moves, true, parameters );

                    // Put remaining EVs into attack
                    let bestSpread = allocateOffensiveSpread( defSpread.EVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, true );

                    //console.log('(N) %s', newSpread.toString() );

                    evSpreadProspects.push( bestSpread );
                }
            }
            else {
                evSpreadProspects.push( new EVSpread( 'Bashful', {hp:0, atk:0, def:0, spa:0, spd:0, spe:0} ));
            }           
            // Calculate damage results for each prospect EV spread
            evSpreadProspects.forEach( prospectSpread => {

                // Generate raid defender data for the current species
                let raidDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    boosts: initialBoosts,
                    nature: prospectSpread.nature,
                    evs: prospectSpread.EVs,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    boostedStat: 'auto'
                });

                let rankingResult = new RankingResultEntry( raidDefender.name, raidDefender.types[0], raidDefender.types[1], raidDefender.evs, false );

                // Take note of EV spread used in the calcs
                rankingResult.nature = prospectSpread.nature;
                rankingResult.evSpread = prospectSpread.EVs;

                // Calculate damage done for each move
                for ( let m = 0; m < moves.length; ++m ) {
                    const damageResult = Smogon.calculate(
                        gen,
                        raidBoss,
                        raidDefender,
                        moves[m],
                        modifiedField
                    );

                    // Add damage values to result
                    let rawValue = damageResult.range()[1];
                    let hpPercent = rawValue / damageResult.defender.stats.hp;
                    if ( damageResult.defender.hasItem('Leftovers')) {
                        // Deduce healing % from HP (unless hit is over 100%)
                        if ( hpPercent < 1 ) {
                            hpPercent -= ( Math.floor( 0.0625 * damageResult.defender.rawStats.hp ) / damageResult.defender.rawStats.hp );
                            rankingResult.addModifier('Leftovers');
                        }
                    }
                    rankingResult.damage.push( new DamagePair(rawValue,hpPercent) );

                    // Factor in abilities
                    if ( damageResult.rawDesc.defenderAbility ) {
                        rankingResult.addModifier( damageResult.rawDesc.defenderAbility );
                    }

                    // Fairly difficult ability to track in damage calc. #TODO: Think up a good way to account for it like the other abilties
                    else if ( prospectAbility == "Neutralizing Gas") {
                        rankingResult.addModifier( "Neutralizing Gas");
                    }
                    if ( damageResult.rawDesc.defenderItem )  {
                        rankingResult.addModifier( damageResult.rawDesc.defenderItem );
                    }

                    // Factor in terrain & weather
                    if ( damageResult.rawDesc.terrain ) {
                        rankingResult.addModifier( damageResult.rawDesc.terrain );
                    }
                    if ( damageResult.rawDesc.weather ) {
                        rankingResult.addModifier( damageResult.rawDesc.weather );
                    }
                    rankingResult.outspeed = damageResult.defender.stats.spe > damageResult.attacker.stats.spe;
                        //damageResult.rawDesc.defenderMovesFirst as boolean;

                    // Save original pokemon to calculate secondary damage later (if checked in parameters)
                    rankingResult.originalAttacker = raidBoss;
                    rankingResult.originalDefender = raidDefender;
                    rankingResult.originalField = modifiedField;

                    // #DEBUG: console prints
                    //console.log('%s: Damage: %d (%d\%)', moves[m].name, rawValue, hpPercent*100);
                    //console.log('%s', damageResult.damage.toString());

                    // #DEBUG: Verify that finalMod is being set
                    //rankingResult.evSpread.spe = damageResult.rawDesc.finalMod;

                    // #TODO: If ability, item, field or any other factor contributed to the final damage, put it in the effects / modifiers
                }

                // Verify damage
                rankingResult.calcMaxDamage();

                resultProspects.push( rankingResult );

            }); // Close EV spread loop
        
        }); // Close Abiltiy loop

        // Pick best result out of all damage checks done
        let bestResult : RankingResultEntry;

        // Sort result prospects if we have multiple. Best result will be the first index.
        if ( resultProspects.length > 1 ) {
            resultProspects.sort( (a,b) => {
                let percentA = a.getMaxDamagePercent();
                let percentB = b.getMaxDamagePercent();
                // If results have same max damage taken, check overall damage taken / additional immunities
                if ( percentA == percentB ) {
                    return a.getTotalDamagePercent() - b.getTotalDamagePercent();
                }
                return percentA - percentB;
            });
        }

        // Pick best result from the prospects
        bestResult = resultProspects[0];

        // Calculate critical hit damage for each move?
        if ( isCalculateSecondaryDamage ) {
            for ( let m = 0; m < movesSecondaryDamage.length; ++m ) {
                const damageResult = Smogon.calculate(
                    gen,
                    bestResult.originalAttacker!,
                    bestResult.originalDefender!,
                    movesSecondaryDamage[m],
                    bestResult.originalField
                );

                // Add damage values to result
                let rawValue = damageResult.range()[1];
                let hpPercent = rawValue / damageResult.defender.stats.hp;
                if ( damageResult.defender.hasItem('Leftovers')) {
                    // Deduce healing % from HP (unless hit is over 100%)
                    if ( hpPercent < 1 ) {
                        hpPercent -= ( Math.floor( 0.0625 * damageResult.defender.rawStats.hp ) / damageResult.defender.rawStats.hp );
                        bestResult.addModifier('Leftovers');
                    }
                }
                bestResult.secondaryDamage.push( new DamagePair(rawValue,hpPercent) );
            }
        }

        // Calculate additional damage?
        if ( parameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolBoth ||
            parameters.results.moveDamageVisibility == PrintVisibleDamage.BestMainExtraPoolSelect ) {
            for ( let m = 0; m < eMoves.length; ++m ) {
                const damageResult = Smogon.calculate(
                    gen,
                    bestResult.originalAttacker!,
                    bestResult.originalDefender!,
                    eMoves[m],
                    bestResult.originalField
                );

                // Add damage values to result
                let rawValue = damageResult.range()[1];
                let hpPercent = rawValue / damageResult.defender.stats.hp;
                /*if ( damageResult.defender.hasItem('Leftovers')) {
                    // Deduce healing % from HP (unless hit is over 100%)
                    if ( hpPercent < 1 ) {
                        hpPercent -= ( Math.floor( 0.0625 * damageResult.defender.rawStats.hp ) / damageResult.defender.rawStats.hp );
                        bestResult.addModifier('Leftovers');
                    }
                }*/
                bestResult.extraDamage.push( new DamagePair(rawValue,hpPercent) );
            }
            
            if ( isCalculateSecondaryDamage ) {
                for ( let m = 0; m < eMovesSecondaryDamage.length; ++m ) {
                    const damageResult = Smogon.calculate(
                        gen,
                        bestResult.originalAttacker!,
                        bestResult.originalDefender!,
                        eMovesSecondaryDamage[m],
                        bestResult.originalField
                    );

                    // Add damage values to result
                    let rawValue = damageResult.range()[1];
                    let hpPercent = rawValue / damageResult.defender.stats.hp;
                    /*if ( damageResult.defender.hasItem('Leftovers')) {
                        // Deduce healing % from HP (unless hit is over 100%)
                        if ( hpPercent < 1 ) {
                            hpPercent -= ( Math.floor( 0.0625 * damageResult.defender.rawStats.hp ) / damageResult.defender.rawStats.hp );
                            bestResult.addModifier('Leftovers');
                        }
                    }*/
                    bestResult.secondaryExtraDamage.push( new DamagePair(rawValue,hpPercent) );
                }
            }
        }

        // Original data not needed anymore
        bestResult.originalAttacker = undefined;
        bestResult.originalDefender = undefined;
        bestResult.originalField = undefined;

        // Add result to list
        finalResult.originalData.push( bestResult );
    }

    // Sort results by damage ranking
    // TODO: Parameters for sorting, highest to lowest, sort by pokedex number?
    finalResult.originalData.sort( (a,b) => {
        const aValue = a.getMaxDamagePercent();
        const bValue = b.getMaxDamagePercent();
        if ( aValue < bValue ) {
            return -1;
        }
        else if ( aValue > bValue ) {
            return 1;
        }
        else {
            return 0;
        }
    });

    let rankCounter = 1;
    finalResult.originalData.forEach( (val) => {
        val.finalRank = rankCounter++;
    });

    finalResult.entriesAnalyzed = entriesAnalyzed;
    finalResult.entriesSkipped = filtered;

    return finalResult;   
}

function filterAbilities( abilities: string[], side: BattlefieldSide, parameters: RankingParameters ) {
    let reviewedAbilities: string[] = [];

    // Check each ability given
    for ( let a = 0; a < abilities.length; ++a ) {
        let ability = abilities[a];

        if ( !parameters.ability.enableDauntlessShieldBoost && ( ability == "Dauntless Shield" ) ) {
            continue;
        }
        if ( !parameters.ability.enableImposterTransform && ability == "Imposter" ) {
            continue;
        }
        if ( !parameters.ability.enableMarvelScale && ability == "Marvel Scale") {
            continue;
        }
        if ( !parameters.ability.enableGrassPelt && ability == "Grass Pelt" ) {
            continue;
        }
        if ( !parameters.ability.enableIntimidateStatDrop && ( ability == "Intimidate" ) ) {
            continue;
        }
        if ( !parameters.ability.enableMultiscaleAndShadowShield && ( ability == "Multiscale" || ability == "Shadow Shield" ) ) {
            continue;
        }
        if ( !parameters.ability.enableTeraShell && ability == "Tera Shell" ) {
            continue;
        }
        if ( !parameters.ability.enableOpportunistStatCopy && ability == "Opportunist" ) {
            continue;
        }
        if ( !parameters.ability.enableSlowStart && ability == "Slow Start" ) {
            continue;
        }
        if ( !parameters.ability.enableNeutralizingGas && ability == "Neutralizing Gas") {
            continue;
        }
        if ( !parameters.ability.enableOrichalcumPulse && ability == "Orichalcum Pulse") {
            continue;
        }
        if ( !parameters.ability.enableDrought && ability == "Drought") {
            continue;
        }
        if ( !parameters.ability.enableDrizzle && ability == "Drizzle") {
            continue;
        }
        if ( !parameters.ability.enableSandStream && ability == "Sand Stream") {
            continue;
        }
        if ( !parameters.ability.enableSnowWarning && ability == "Snow Warning") {
            continue;
        }
        if ( !parameters.ability.enableHadronEngine && ability == "Hadron Engine") {
            continue;
        }
        if ( !parameters.ability.enableElectricSurge && ability == "Electric Surge") {
            continue;
        }
        if ( !parameters.ability.enableGrassySurge && ability == "Grassy Surge") {
            continue;
        }
        if ( !parameters.ability.enablePsychicSurge && ability == "Psychic Surge") {
            continue;
        }
        if ( !parameters.ability.enableMistySurge && ability == "Misty Surge") {
            continue;
        }
        if ( !parameters.ability.enableWaterAbsorb && ability == "Water Absorb") {
            continue;
        }
        if ( !parameters.ability.enableDrySkin && ability == "Dry Skin") {
            continue;
        }
        if ( !parameters.ability.enableStormDrain && ability == "Storm Drain") {
            continue;
        }
        if ( !parameters.ability.enableVoltAbsorb && ability == "Volt Absorb") {
            continue;
        }
        if ( !parameters.ability.enableMotorDrive && ability == "Motor Drive") {
            continue;
        }
        if ( !parameters.ability.enableLightningRod && ability == "Lightning Rod") {
            continue;
        }
        if ( !parameters.ability.enableFlashFire && ability == "Flash Fire") {
            continue;
        }
        if ( !parameters.ability.enableSapSipper && ability == "Sap Sipper") {
            continue;
        }
        if ( !parameters.ability.enableLevitate && ability == "Levitate") {
            continue;
        }
        if ( !parameters.ability.enableQuarkDrive && ability == "Quark Drive") {
            continue;
        }
        if ( !parameters.ability.enableProtosynthesis && ability == "Protosynthesis") {
            continue;
        }
        if ( !parameters.ability.enableAirLock && ability == "Air Lock") {
            continue;
        }
        
        reviewedAbilities.push(ability);
    }

    // Add "no ability" if everything was filtered
    if ( reviewedAbilities.length == 0 ) {
        reviewedAbilities.push("");
    }

    return reviewedAbilities;
}

function applySearchFilters( gen: Generation, raidBoss: Smogon.Pokemon, bossMatchup: TypeMatchup, speciesEntry: Specie, data: FilterDataEntry, parameters: RankingParameters ) {
    let skip = false;

    if ( !skip && parameters.filters.applyDexFilter ) {
        let dexSkip = true;
        if ( parameters.filters.showPaldeaPokemon && ( data.dex.paldea != undefined ) ) {
            dexSkip = false;
        }
        if ( parameters.filters.showTealMaskPokemon && ( data.dex.teal != undefined ) ) {
            dexSkip = false;
        }
        if ( parameters.filters.showIndigoPokemon && ( data.dex.indigo != undefined ) ) {
            dexSkip = false;
        }
        if ( parameters.filters.showHomePokemon && ( data.dex.paldea == undefined )
            && ( data.dex.teal == undefined ) && ( data.dex.indigo == undefined ) ) {
                dexSkip = false;
        }
        skip = skip || dexSkip;
    }

    if ( !skip && parameters.filters.applyRarityFilter ) {
        let raritySkip = true;
        if ( parameters.filters.showRegularPokemon && ( data.rarity == RarityFlag.Regular ) ) {
            raritySkip = false;
        }
        if ( parameters.filters.showParadoxPokemon && ( data.rarity == RarityFlag.Paradox ) ) {
            raritySkip = false;
        }
        if ( parameters.filters.showLegendaryPokemon && ( data.rarity == RarityFlag.Legendary ) ) {
            raritySkip = false;
        }
        if ( parameters.filters.showMythicalPokemon && ( data.rarity == RarityFlag.Mythical ) ) {
            raritySkip = false;
        }
        skip = skip || raritySkip;
    }

    if ( !skip && parameters.filters.skipNonFinalEvolutions && speciesEntry.nfe ) {
        skip = true;
    }
    if ( !skip && parameters.filters.skipFinalEvolutions && (speciesEntry.nfe == undefined) ) {
        skip = true;
    }
    

    // Check if at least one base type is super effective versus the raid boss tera type
    if ( !skip && parameters.filters.checkOnlySTABDefenders ) {
        if ( !bossMatchup.checkAtLeastOneSTAB( speciesEntry.types[0], speciesEntry.types[1] ) ) {
            skip = true;
        }
    }

    return skip;
}

/*function copyStatBoost(boostSource: Smogon.Pokemon, copyTo: StatsTable<number> ) {
    let contributed = false;
    if ( boostSource.boosts.atk > 0 ) {copyTo.atk = Math.max( -6, Math.min( 6, copyTo.atk + boostSource.boosts.atk)); contributed = true; }
    if ( boostSource.boosts.def > 0 ) {copyTo.def = Math.max( -6, Math.min( 6, copyTo.def + boostSource.boosts.def)); contributed = true; }
    if ( boostSource.boosts.spa > 0 ) {copyTo.spa = Math.max( -6, Math.min( 6, copyTo.spa + boostSource.boosts.spa)); contributed = true; }
    if ( boostSource.boosts.spd > 0 ) {copyTo.spd = Math.max( -6, Math.min( 6, copyTo.spd + boostSource.boosts.spd)); contributed = true; }
    if ( boostSource.boosts.spe > 0 ) {copyTo.spe = Math.max( -6, Math.min( 6, copyTo.spe + boostSource.boosts.spe)); contributed = true; }
}*/

function checkSpecialItem(species: string) {
    if ( species == 'Dialga-Origin' ) {
        return 'Adamant Crystal';
    }
    else if ( species == 'Palkia-Origin') {
        return 'Lustrous Globe';
    }
    else if ( species == 'Giratina-Origin') {
        return 'Griseous Core';
    }
    else if ( species == 'Arceus-Dragon') {
        return 'Draco Plate';
    }
    else if ( species == 'Arceus-Dark') {
        return 'Fist Plate';
    }
    else if ( species == 'Arceus-Ground') {
        return 'Earth Plate';
    }
    else if ( species == 'Arceus-Fighting') {
        return 'Fist Plate';
    }
    else if ( species == 'Arceus-Fire') {
        return 'Flame Plate';
    }
    else if ( species == 'Arceus-Ice') {
        return 'Icicle Plate';
    }
    else if ( species == 'Arceus-Bug') {
        return 'Insect Plate';
    }
    else if ( species == 'Arceus-Steel') {
        return 'Iron Plate';
    }
    else if ( species == 'Arceus-Grass') {
        return 'Meadow Plate';
    }
    else if ( species == 'Arceus-Psychic') {
        return 'Mind Plate';
    }
    else if ( species == 'Arceus-Fairy') {
        return 'Pixie Plate';
    }
    else if ( species == 'Arceus-Flying') {
        return 'Sky Plate';
    }
    else if ( species == 'Arceus-Water') {
        return 'Splash Plate';
    }
    else if ( species == 'Arceus-Ghost') {
        return 'Spooky Plate';
    }
    else if ( species == 'Arceus-Rock') {
        return 'Stone Plate';
    }
    else if ( species == 'Arceus-Poison') {
        return 'Toxic Plate';
    }
    else if ( species == 'Arceus-Electric') {
        return 'Zap Plate';
    }
    else if ( species == 'Zacian-Crowned') {
        return 'Rusted Sword';
    }
    else if ( species == 'Zamazenta-Crowned') {
        return 'Rusted Shield';
    }
    else if ( species == 'Ogerpon-Cornerstone') {
        return 'Cornerstone Mask';
    }
    else if ( species == 'Ogerpon-Hearthflame') {
        return 'Hearthflame Mask';
    }
    else if ( species == 'Ogerpon-Wellspring') {
        return 'Wellspring Mask';
    }
    return undefined;
}

function setAbilityTerrain(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    // Enable terrain according to parameters
    if ( !parameters.misc.lockTerrain ) {
        if ( parameters.ability.activateTerrainSettingAbilities && ( ability == 'Hadron Engine' || ability == 'Electric Surge') ) {
            field.terrain = 'Electric';
        }
        if ( parameters.ability.activateTerrainSettingAbilities && ( ability == 'Misty Surge')) {
            field.terrain = 'Misty';
        }
        if ( parameters.ability.activateTerrainSettingAbilities && ( ability == 'Grassy Surge')) {
            field.terrain = 'Grassy';
        }
        if ( parameters.ability.activateTerrainSettingAbilities && ( ability == 'Psychic Surge')) {
            field.terrain = 'Psychic';
        }
    }
}
function setAbilityWeather(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    // Enable weather according to parameters
    if ( !parameters.misc.lockWeather ) {
        if ( parameters.ability.activateWeatherSettingAbilities && ( ability == 'Orichalcum Pulse' || ability == 'Drought') ) {
            field.weather = 'Sun';
        }
        if ( parameters.ability.activateWeatherSettingAbilities && ( ability == 'Snow Warning')) {
            field.weather = 'Snow';
        }
        if ( parameters.ability.activateWeatherSettingAbilities && ( ability == 'Sandstorm')) {
            field.weather = 'Sand';
        }
        if ( parameters.ability.activateWeatherSettingAbilities && ( ability == 'Drizzle')) {
            field.weather = 'Rain';
        }
    }
}
function checkGrassPeltTrigger(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    if ( ability == 'Grass Pelt' && parameters.ability.forceTriggerGrassPelt && !parameters.misc.lockTerrain ) {
        field.terrain = 'Grassy';
    }
}
function checkQuarkDriveTrigger(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    if ( ability == 'Quark Drive' && parameters.ability.forceTriggerQuarkDrive && !parameters.misc.lockTerrain ) {
        field.terrain = 'Electric';
    }
}
function checkProtosynthesisTrigger(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    if ( ability == 'Protosynthesis' && parameters.ability.forceTriggerProtosynthesis && !parameters.misc.lockWeather ) {
        field.weather = 'Sun';
    }
}
function checkMarvelScaleTrigger(ability: string, defaultStatus: StatusName|'', parameters: RankingParameters ) {
    if ( ability == 'Marvel Scale' && ( parameters.ability.forceTriggerMarvelScale != '') ) {
        switch (parameters.ability.forceTriggerMarvelScale) {
            case 'brn': return 'brn';
            case 'par': return 'par';
            case 'frz': return 'frz';
            case 'psn': return 'psn';
            case 'tox': return 'tox';
            case 'slp': return 'slp';
        }
    }
    return defaultStatus;
}

function allocateOffensiveSpread(originalEVs: StatsTable<number>, physical: boolean, useSpeedNature: boolean) {
    let preAllocatedEVs = getTotalEVInvestment( originalEVs );
    let freeEVs = 510 - preAllocatedEVs;
    let nature = "";
    // #TODO: Find a better method or turn this into a parameter/preference
    // Decide what nature to use based on the highest offensive base stat
    if ( physical ) {
        originalEVs.atk = ( freeEVs >= (252 - originalEVs.atk) ?
            252 : // 252 EVs if able to max out
            originalEVs.atk + freeEVs // Otherwise, allocate as much as possible
        );
        // Normalize in the case that original EVs were not multiple of 4
        originalEVs.atk = originalEVs.atk - (originalEVs.atk%4);
        nature = ( useSpeedNature? "Jolly" : "Adamant" );
    }
    else {
        originalEVs.spa = ( freeEVs >= (252 - originalEVs.spa) ?
            252 : // 252 EVs if able to max out
            originalEVs.spa + freeEVs // Otherwise, allocate as much as possible
        );
        // Normalize in the case that original EVs were not multiple of 4
        originalEVs.spa = originalEVs.spa - (originalEVs.spa%4);
        nature = ( useSpeedNature? "Timid" : "Modest" );
    }

    return new EVSpread( nature, originalEVs );
}


function calcOptimalDefensiveSpread(gen:Generation, raidBoss: Smogon.Pokemon, defender: Smogon.Pokemon, field: Smogon.Field, moves: Smogon.Move[], useGivenNature: boolean, parameters: RankingParameters) {
    // #TODO: Perform a complete check (Need to factor things that prevent items being used? Maybe not?)
    let usePQ = false;
    if ( defender.hasAbility('Protosynthesis') || defender.hasAbility('Quark Drive')) {
        //console.log('PQ Ability detected');
        usePQ = isQPActive(defender,field);
    }

    let bestSpread;
    if ( usePQ ) {
        bestSpread = getOptimalDefensiveSpread_PQ( gen, raidBoss.clone(), defender, moves, field, useGivenNature, parameters );
    }
    else {
        bestSpread = getOptimalDefensiveSpread( gen, raidBoss.clone(), defender, moves, field, useGivenNature, parameters );
    }

    return bestSpread;
}

function calcOptimalDefensiveThreshold(gen:Generation, raidBoss: Smogon.Pokemon, defender: Smogon.Pokemon, field: Smogon.Field, moves: Smogon.Move[], useGivenNature: boolean, parameters: RankingParameters) {
    // #TODO: Perform a complete check (Need to factor things that prevent items being used? Maybe not?)
    let usePQ = false;
    if ( defender.hasAbility('Protosynthesis') || defender.hasAbility('Quark Drive')) {
        //console.log('PQ Ability detected');
        usePQ = isQPActive(defender,field);
    }

    //console.log('%s use PQ? %s', data.name, usePQ);

    let bestSpread;
    if ( usePQ ) {
        bestSpread = getOptimalDefensiveThreshold_PQ( gen, raidBoss.clone(), defender, moves, field, useGivenNature, parameters );
    }
    else {
        bestSpread = getOptimalDefensiveThresholdSpread( gen, raidBoss.clone(), defender, moves, field, useGivenNature, parameters );
    }

    return bestSpread;
}

/** Calculate the minimum investment to outspeed the raid boss
 * -
 * Always returns an array with 2 entries either an EVSpread or undefined.
 * The first index will be the EV spread for the neutral speed nature.
 * The second index will be the EV spread for the positive speed nature.
 * There are 3 possible return cases:
 * 
 * 1 - Return both spreads if both natures are able to outspeed.
 * 
 * 2 - Return only the positive spread if it outspeeds but the neutral nature can't.
 * 
 * 3 - Return only the neutral spread if outspeeding is not possible.
 * 
 * #TODO: Consider ev allocation limits?
 */
function calcOptimalOutspeedInvestment(gen: Generation, raidBoss: Smogon.Pokemon, neutralDummy: Smogon.Pokemon, positiveDummy: Smogon.Pokemon, field: Smogon.Field, moves: Smogon.Move[]) {
    let eligibleSpreads: (EVSpread|undefined)[] = [];

    //console.log('Boss target speed: %d', raidBoss.stats.spe);
    let neutralSpeEV = getMinimumOutspeedEV( raidBoss.stats.spe, gen, neutralDummy, field, field.defenderSide );
    let positiveSpeEV = getMinimumOutspeedEV( raidBoss.stats.spe, gen, positiveDummy, field, field.defenderSide );
    
    // If both natures had a match return both and test both for defensive stats
    if ( neutralSpeEV != undefined && positiveSpeEV != undefined ) {
        let neutralSpread = new EVSpread( neutralDummy.nature, neutralDummy.evs );
        neutralSpread.EVs.spe = neutralSpeEV!;
        eligibleSpreads.push( neutralSpread );

        let positiveSpread = new EVSpread( positiveDummy.nature, positiveDummy.evs );
        positiveSpread.EVs.spe = positiveSpeEV!;
        eligibleSpreads.push( positiveSpread );
    }
    // If neither had a match, return the neutral spread with minimum speed EVs
    else if ( neutralSpeEV == undefined && positiveSpeEV == undefined ) {
        let bestSpread = new EVSpread( neutralDummy.nature, neutralDummy.evs );
        eligibleSpreads.push( bestSpread );
        eligibleSpreads.push( undefined );
    }
    // If only the positive nature had a match
    else if ( positiveSpeEV != undefined ) {
        let positiveSpread = new EVSpread( positiveDummy.nature, positiveDummy.evs );
        positiveSpread.EVs.spe = positiveSpeEV;
        eligibleSpreads.push( undefined );
        eligibleSpreads.push( positiveSpread );
    }
    // If only the neutral nature had a match
    else if ( neutralSpeEV != undefined ) {
        console.log('This should never happen');
        /*let neutralSpread = new EVSpread( neutralDummy.nature, neutralDummy.evs );
        neutralSpread.EVs.spe = neutralSpeEV;
        eligibleSpreads.push( neutralSpread );
        eligibleSpreads.push( undefined );*/
    }

    return eligibleSpreads;
}