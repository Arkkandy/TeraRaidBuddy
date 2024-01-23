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
import {DefensiveNaturePreference, PrintVisibleDamage, RankingParameters, SearchRankingType } from './searchparameters';
import { DefenseStatOptimizer } from './statoptimization';
import { DefenseStatOptimizerPQ } from './statoptimizationpq';
import { BattlefieldSide, EVSpread, calcModifiedDefenseStat, calcModifiedSpDefenseStat, evsToStringShowAll, findDefEvPQThreshold, findSpdEvPQThreshold, getHighestStat_PQ, getNatureFromStats, getTotalEVInvestment, statToNatureIndex } from './util';
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
    public mainMoves: Smogon.Move[];
    public extraMoves: Smogon.Move[];
    public raidBoss: Smogon.Pokemon;

    // May delete these
    public entriesAnalyzed: number = 0;
    public filtered: number = 0;

    constructor( parameters: RankingParameters, mainMoves: Smogon.Move[], extraMoves: Smogon.Move[], raidBoss: Smogon.Pokemon ) {
        this.originalParameters = parameters;
        this.mainMoves = mainMoves;
        this.extraMoves = extraMoves;
        this.raidBoss = raidBoss;
    }
}

export class RankingResultEntry {
    public species: string;
    public type1: string;
    public type2: string;
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

    constructor( species: NamedCurve, type1: string, type2: string, evSpread: Smogon.StatsTable<number>, outspeed: boolean ) {
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
        if ( parameters.search.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        moves.push( moveCopy );
    }
    let movesSecondaryDamage: Smogon.Move[]  = [];
    for ( let m = 0; m < mainMoves.length; ++m ) {
        let moveCopy = mainMoves[m].clone();
        // If ranking is not done by critical damage, secondary damage is critical
        if ( !parameters.search.isRankByCritical ) {
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
        if ( parameters.search.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        eMoves.push( moveCopy );
    }

    let eMovesSecondaryDamage: Smogon.Move[]  = [];
    for ( let m = 0; m < extraMoves.length; ++m ) {
        let moveCopy = extraMoves[m].clone();
        // If ranking is not done by critical damage, secondary damage is critical
        if ( !parameters.search.isRankByCritical ) {
            moveCopy.isCrit = true;
        }
        // Otherwise critical is its default value, which could be true for guaranteed critical moves (Flower Trick, etc)
        eMovesSecondaryDamage.push( moveCopy );
    }

    let isCalculateSecondaryDamage =
        parameters.results.moveDamageVisibility == PrintVisibleDamage.BestMoveBoth || PrintVisibleDamage.BothMoveBoth || PrintVisibleDamage.MainMoveBoth;

    
    
    //let rankingResults: RankingResultEntry[] = [];
    
    // Get all species data for quick lookups ??
    //const speciesData = [...gen.species];

    if ( parameters.ability.disableAttackerAbility ) {
        raidBoss.ability = 'Honey Gather' as AbilityName;
    }

    if ( parameters.items.disableBossItem ) {
        raidBoss.item = undefined;
    }

    setAbilityTerrain( raidBoss.ability as string, field, parameters );
    setAbilityWeather( raidBoss.ability as string, field, parameters );

    // Determine STAB types against boss while accounting for ability immunities
    let raidBossTypeData = gen.types.get(Smogon.toID(raidBoss.teraType));
    //let STABvsRaidBoss = 

    let entriesAnalyzed = 0;
    let filtered = 0;

    let useDefenderTeraType = false;
    let defenderTeraType: TypeName | undefined = undefined;
    if ( parameters.advanced.defenderTeraType != '' ) {
        defenderTeraType = parameters.advanced.defenderTeraType as TypeName;
        useDefenderTeraType = true;
    }

    let localFilteringData = filteringData;
    // If the whitelist contains at least 1 element
    if ( parameters.filters.whiteListIDs.length > 0 ) {
        // We'll reduce the filtering data to only the entries whitelisted
        localFilteringData = localFilteringData.filter( (item) => parameters.filters.whiteListIDs.includes( item.name ) );
    }

    // #TODO: Extra Moves
    let finalResult: RankingResult = new RankingResult( parameters, moves, eMoves, raidBoss );

    // Perform damage checks against all filterable species
    /*let subFilteringData: FilterDataEntry[] = [ filteringData.find( item => item.name == 'Scream Tail' || item.name == 'Flutter Mane') as FilterDataEntry];
    for ( const data of subFilteringData ) {*/
    for ( const data of localFilteringData ) {

        let speciesEntry = gen.species.get(Smogon.toID(data.name))!;
        //console.log('........................'); console.log('Analyzing: %s', data.name);

        // Apply damage calc filters
        if ( applySearchFilters( gen, raidBoss, speciesEntry, data, parameters ) ) {
            filtered++;
            continue;
        }
        // Ogerpon forms can only have the Tera type of their respective mask
        if ( useDefenderTeraType ) {
            if ( data.name == 'Ogerpon' && defenderTeraType != 'Grass') {
                continue;
            }
            if ( data.name == 'Ogerpon-Cornerstone' && defenderTeraType != 'Rock') {
                continue;
            }
            if ( data.name == 'Ogerpon-Hearthflame' && defenderTeraType != 'Fire') {
                continue;
            }
            if ( data.name == 'Ogerpon-Wellspring' && defenderTeraType != 'Water') {
                continue;
            }
            // Terapagos changes form when terastalizing, skip entry
            if ( data.name == 'Terapagos-Terastal' ) {
                continue;
            }
        }
        // If Terapagos-Stellar is only possible with Stellar terastalization
        if ( speciesEntry.name == "Terapagos-Stellar" && !(useDefenderTeraType && parameters.advanced.defenderTeraType == 'Stellar')) {
            continue;
        }
        if ( speciesEntry)
        // Count entries
        entriesAnalyzed++;

        // Check against all abilities
        let abilities: string[] = [];
        if ( parameters.ability.disableDefenderAbility ) {
            // #TODO: Better solution? This ability doesn't do anything so effectively nullifies the ability slot
            abilities.push("Honey Gather");
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

        // #TODO: Give mandatory form items to respective pokemon (Arceus plates, Ogerpon masks, Gen4 Origin items)
        // These should never be disabled or modified in any way

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
            let statStages = {atk:0,def:0,spa:0,spd:0,spe:0};
            if ( heldItem == 'Mirror Herb' ) {
                if ( raidBoss.boosts.atk > 0 ) {statStages.atk = statStages.atk + raidBoss.boosts.atk;}
                if ( raidBoss.boosts.def > 0 ) {statStages.def = statStages.def + raidBoss.boosts.def;}
                if ( raidBoss.boosts.spa > 0 ) {statStages.spa = statStages.spa + raidBoss.boosts.spa;}
                if ( raidBoss.boosts.spd > 0 ) {statStages.spd = statStages.spd + raidBoss.boosts.spd;}
                if ( raidBoss.boosts.spe > 0 ) {statStages.spe = statStages.spe + raidBoss.boosts.spe;}
            }
            if ( prospectAbility == 'Opportunist') {
                if ( raidBoss.boosts.atk > 0 ) {statStages.atk = statStages.atk + raidBoss.boosts.atk;}
                if ( raidBoss.boosts.def > 0 ) {statStages.def = statStages.def + raidBoss.boosts.def;}
                if ( raidBoss.boosts.spa > 0 ) {statStages.spa = statStages.spa + raidBoss.boosts.spa;}
                if ( raidBoss.boosts.spd > 0 ) {statStages.spd = statStages.spd + raidBoss.boosts.spd;}
                if ( raidBoss.boosts.spe > 0 ) {statStages.spe = statStages.spe + raidBoss.boosts.spe;}
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
            if ( parameters.search.rankingType == SearchRankingType.NoInvestment ) {
                evSpreadProspects.push( new EVSpread( 'Bashful', {hp:0, atk:0, def:0, spa:0, spd:0, spe:0} ));
            }
            else if ( parameters.search.rankingType == SearchRankingType.FullDef ) {
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:252, spa:0, spd:0, spe:0} ));
            }
            else if ( parameters.search.rankingType == SearchRankingType.FullSpD ) {
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:0, spa:0, spd:252, spe:0} ));
            }
            else if ( parameters.search.rankingType == SearchRankingType.SimpleOffense ) {
                if ( speciesEntry.baseStats.atk > speciesEntry.baseStats.spa ) {
                    evSpreadProspects.push( new EVSpread( 'Adamant', {hp:252, atk:252, def:0, spa:0, spd:0, spe:0 }));
                }
                else {
                    evSpreadProspects.push( new EVSpread( 'Modest', {hp:252, atk:0, def:0, spa:252, spd:0, spe:0 }));
                }
            }
            else if ( parameters.search.rankingType == SearchRankingType.MixedDefSimple ) {
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:252, spa:0, spd:4, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:252, atk:0, def:4, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Bold', {hp:4, atk:0, def:252, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:252, spa:0, spd:4, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:252, atk:0, def:4, spa:0, spd:252, spe:0} ));
                evSpreadProspects.push( new EVSpread( 'Calm', {hp:4, atk:0, def:252, spa:0, spd:252, spe:0} ));
            }
            else if ( parameters.search.rankingType == SearchRankingType.MixedDefOptimal ) {
                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
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
            else if ( parameters.search.rankingType == SearchRankingType.AttackIntoOptimalDef ) {
                let initialEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let initialSpread = allocateOffensiveSpread( initialEVs, speciesEntry.baseStats.atk > speciesEntry.baseStats.spa, false );

                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
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
            else if ( parameters.search.rankingType == SearchRankingType.OutspeedIntoOptimalDef ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Timid', // <--- preference
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
            else if ( parameters.search.rankingType == SearchRankingType.OutspeedIAttackIDefense ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Timid', // <--- preference
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
            else if ( parameters.search.rankingType == SearchRankingType.BestDefenseThreshold ) {
                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
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
            else if ( parameters.search.rankingType == SearchRankingType.BestDefenseThresholdIntoAttack ) {
                let buildPhysical = speciesEntry.baseStats.atk > speciesEntry.baseStats.spa;

                //defenderEVs = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
                let dummyDefender = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
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
            else if ( parameters.search.rankingType == SearchRankingType.OutspeedIntoBDT ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Timid', // <--- preference
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

            else if ( parameters.search.rankingType == SearchRankingType.OutspeedIntoBDTIntoAttack ) {
                let neutralDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Hardy',
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                });
                let positiveDummy = new Smogon.Pokemon( gen, data.name, {
                    teraType: defenderTeraType,
                    nature: 'Timid', // <--- preference
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
                    nature: prospectSpread.nature,
                    evs: prospectSpread.EVs,
                    item: heldItem,
                    ivs: {hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
                    ability: prospectAbility,
                    abilityOn: true,
                    status: defaultStatus,
                    boostedStat: 'auto'
                });

                let rankingResult = new RankingResultEntry( raidDefender.name, raidDefender.types[0], raidDefender.types[1] ? raidDefender.types[1] : "", raidDefender.evs, false );

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
    finalResult.filtered = filtered;

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
        reviewedAbilities.push("Honey Gather");
    }

    return reviewedAbilities;
}

function applySearchFilters( gen: Generation, raidBoss: Smogon.Pokemon, speciesEntry: Specie, data: FilterDataEntry, parameters: RankingParameters ) {
    let skip = false;

    if ( parameters.filters.applyDexFilter ) {
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

    if ( parameters.filters.applyRarityFilter ) {
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

    if ( parameters.filters.skipNonFinalEvolutions && speciesEntry.nfe ) {
        skip = true;
    }
    if ( parameters.filters.skipFinalEvolutions && (speciesEntry.nfe == undefined) ) {
        skip = true;
    }
    

    // Check if at least one base type is super effective versus the raid boss tera type
    if ( parameters.filters.checkOnlySTABDefenders ) {
        let type1 = gen.types.get(Smogon.toID(speciesEntry.types[0]));
        let type2 = gen.types.get(Smogon.toID(speciesEntry.types[1]));

        let isStab1 = false;
        let isStab2 = false;
        if ( type1?.effectiveness[raidBoss.teraType!]! > 1 ) {
            isStab1 = true;
        }
        if ( type2?.effectiveness[raidBoss.teraType!]! > 1 ) {
            isStab2 = true;
        }
        if ( !(isStab1 || isStab2) ) {
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
    if ( !parameters.advanced.lockTerrain ) {
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
    if ( !parameters.advanced.lockWeather ) {
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
    if ( ability == 'Grass Pelt' && parameters.ability.forceTriggerGrassPelt && !parameters.advanced.lockTerrain ) {
        field.terrain = 'Grassy';
    }
}
function checkQuarkDriveTrigger(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    if ( ability == 'Quark Drive' && parameters.ability.forceTriggerQuarkDrive && !parameters.advanced.lockTerrain ) {
        field.terrain = 'Electric';
    }
}
function checkProtosynthesisTrigger(ability: string, field: Smogon.Field, parameters: RankingParameters ) {
    if ( ability == 'Protosynthesis' && parameters.ability.forceTriggerProtosynthesis && !parameters.advanced.lockWeather ) {
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


/** Optimal Defensive Spread
 * --------------------------
 * Find the most efficient EV spread to meet the most balanced defensive investment for the defender.
 * Against Pokemon with only one category of moves (physical or special) this will calculate the lowest investment
 * for the minimum amount of damage taken, where often the defensive stat can be several EVs below 252 while providing
 * the same effect.
 * For mixed damage the algorithm will find the EV spread that minimizes overall damage the best, which typically
 * results in equalizing highest damage taken from physical and special moves.
*/
function getOptimalDefensiveSpread( gen: Generation, raidBoss: Smogon.Pokemon, raidDefender: Smogon.Pokemon,
    moves: Smogon.Move[], field: Smogon.Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: Smogon.StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    if (!useGivenNature) {
        raidDefender.nature = "Hardy";
    }

    // Perform preliminary damage check for each move
    let preResults : Smogon.Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = Smogon.calculate(gen, raidBoss, raidDefender, move, field );
        if (result.range()[1] > 0 ) {
            eligibleIndices.push(i);
        }
        preResults.push(result);
    }

    // Check if all moves deal damage, if not the defender is immune and needs no defensive investment
    if ( eligibleIndices.length == 0 ) {
        return new EVSpread( raidDefender.nature, finalEVSpread );
    }    

    // Separate physical moves from special moves (Keep track of initial indices?)
    let physMoves : number[] = [];
    let specMoves : number[] = [];
    let highestPhysHit : number = 0;
    let highestSpecHit : number = 0;
    let highestHit : number = 0;
    let isHighestHitPhysical : boolean = false;
    eligibleIndices.forEach( moveIndex => {
        const moveDamage = preResults[moveIndex].range()[1];
        if ( preResults[moveIndex].rawDesc.hitsPhysical ) {
            physMoves.push( moveIndex );
            highestPhysHit = Math.max( moveDamage, highestPhysHit );
        }
        else {
            specMoves.push( moveIndex );
            highestSpecHit = Math.max( moveDamage, highestSpecHit );
        }
        if ( moveDamage > highestHit ) {
            highestHit = moveDamage;
            isHighestHitPhysical = preResults[moveIndex].rawDesc.hitsPhysical!;
        }
    });

    // Predict best defensive nature based on the hardest hitting move
    if ( !useGivenNature ) {
        if ( isHighestHitPhysical ) {
            // Suggest defensive nature
            raidDefender.nature = "Bold";
        }
        else {
            // Suggest specially defensive nature
            raidDefender.nature = "Calm";
        }
    }

    // Discard low hitting physical moves
    if ( physMoves.length > 1 ) {
        let newPhysMoves : number[] = [];
        physMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestPhysHit - moveDamage ) < 0.01 ) {
                newPhysMoves.push( moveIndex );
            }
        });
        physMoves = newPhysMoves;
    }
    // Discard low hitting special moves
    if ( specMoves.length > 1 ) {
        let newSpecMoves : number[] = [];
        specMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestSpecHit - moveDamage ) < 0.01 ) {
                newSpecMoves.push( moveIndex );
            }
        });
        specMoves = newSpecMoves;
    }

    // Recalculate damage for the relevant moves with the updated defensive nature
    let physResults : Smogon.Result[] = [];
    let specResults : Smogon.Result[] = [];
    if ( useGivenNature ) {
        // Reuse previous results if must use given nature
        physMoves.forEach( moveIndex => 
            physResults.push( preResults[moveIndex])
        );
        specMoves.forEach( moveIndex => 
            specResults.push( preResults[moveIndex])
        );
    }
    else {
        // Recalculate results for updated nature
        physMoves.forEach( moveIndex => 
            physResults.push( Smogon.calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( Smogon.calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizer = new DefenseStatOptimizer();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        optimizer.addDefNode( finalEVSpread.def, 0 );
    }
    else {
        let initialDefEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextDefEV = initialDefEV;
        do {
            let maxDamage = 0;
            physResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextDefEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                optimizer.addDefNode( nextDefEV, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextDefEV = ( nextDefEV - (nextDefEV % 4) ) + 4;
        } while ( nextDefEV <= 252 );
    }

    // Setup SpD nodes
    if ( specResults.length == 0 ) {
        optimizer.addSpDNode( finalEVSpread.spd, 0 );
    }
    else {
        let initialSpdEV = finalEVSpread.spd;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextSpdEV = initialSpdEV;
        do {
            let maxDamage = 0;
            specResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextSpdEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                optimizer.addSpDNode( nextSpdEV, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextSpdEV = ( nextSpdEV - (nextSpdEV % 4) ) + 4;
        } while ( nextSpdEV <= 252 );
    }

    // #DEBUG
    /*console.log('Def Nodes');
    optimizer.defNodes.forEach( item => {
        console.log('EV: %d',item.ev);
    });
    console.log('------------------------')
    console.log('SpD Nodes');
    optimizer.spdNodes.forEach( item => {
        console.log('EV: %d',item.ev);
    });*/

    // Check pairs for all combinations of Def and SpD nodes
    // Find pairs that have matching damage values
    // Try all combinations by test-allocating as much HP as possible
    // -- think of ways to cull obvious bad nodes in this step?
    // ---- look ahead to the next node
    // ---- if allocating next node would leave 252+ remaining EVs
    // ---- then we haven't exhausted all EVs in Defenses yet



    // Select the combination with the lowest max percent
    let bestCombo = optimizer.findBestCombination(
        raidDefender.species.baseStats.hp,
        raidDefender.ivs.hp,
        finalEVSpread.hp, // Initial HP investment, if any
        510 - (finalEVSpread.hp + finalEVSpread.atk + finalEVSpread.def + finalEVSpread.spa + finalEVSpread.spd + finalEVSpread.spe),
        raidDefender.level);

    finalEVSpread.hp = bestCombo.hpEV;
    finalEVSpread.def = bestCombo.defEV;
    finalEVSpread.spd = bestCombo.spdEV;

    // NOTE: MUST TAKE INTO ACCOUNT ANY PRE-EXISTING EVS
    // 1 - Def/SpD nodes must start at the EV given in the defender's spread
    // 2 - Cull Def/SpD pairs that would on their own exceed the EV limit
    // 3 - 

    // #DEBUG CHECK IF VALUES ARE OK
    /*let damageMinEV = recalculateFinalDamage( results[0], 0 );
    let damageMaxEV = recalculateFinalDamage( results[0], 252 );

    let damageRange : number[] = [damageMinEV[15], damageMaxEV[15]]; 

    finalEVSpread.atk = damageRange[0];
    finalEVSpread.spa = damageRange[1];*/

    return new EVSpread( raidDefender.nature, finalEVSpread );
}



/** Optimal Defensive Spread (Proto/Quark)
 * --------------------------
 * Find the most efficient EV spread to meet the most balanced defensive investment for defenders with enabled Protoynthesis / Quark Drive.
 * Against Pokemon with only one category of moves (physical or special) this will calculate the lowest investment
 * for the minimum amount of damage taken, where often the defensive stat can be several EVs below 252 while providing
 * the same effect.
 * For mixed damage the algorithm will find the EV spread that minimizes overall damage the best, which typically
 * results in equalizing highest damage taken from physical and special moves.
*/
function getOptimalDefensiveSpread_PQ( gen: Generation, raidBoss: Smogon.Pokemon, raidDefender: Smogon.Pokemon,
    moves: Smogon.Move[], field: Smogon.Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: Smogon.StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    let noAbilityDefender = raidDefender.clone();
    if ( !useGivenNature ) {
        noAbilityDefender.nature = "Hardy";
    }
    noAbilityDefender.ability = undefined;

    // Perform preliminary damage check for each move
    let preResults : Smogon.Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = Smogon.calculate(gen, raidBoss, noAbilityDefender, move, field );
        if (result.range()[1] > 0 ) {
            eligibleIndices.push(i);
        }
        preResults.push(result);
    }

    // Check if all moves deal damage, if not the defender is immune and needs no defensive investment
    if ( eligibleIndices.length == 0 ) {
        return new EVSpread( raidDefender.nature, finalEVSpread );
    }    

    // Separate physical moves from special moves (Keep track of initial indices?)
    let physMoves : number[] = [];
    let specMoves : number[] = [];
    let highestPhysHit : number = 0;
    let highestSpecHit : number = 0;
    let highestHit : number = 0;
    let isHighestHitPhysical : boolean = false;
    eligibleIndices.forEach( moveIndex => {
        const moveDamage = preResults[moveIndex].range()[1];
        if ( preResults[moveIndex].rawDesc.hitsPhysical ) {
            physMoves.push( moveIndex );
            highestPhysHit = Math.max( moveDamage, highestPhysHit );
        }
        else {
            specMoves.push( moveIndex );
            highestSpecHit = Math.max( moveDamage, highestSpecHit );
        }
        if ( moveDamage > highestHit ) {
            highestHit = moveDamage;
            isHighestHitPhysical = preResults[moveIndex].rawDesc.hitsPhysical!;
        }
    });

    // Discard low hitting physical moves
    if ( physMoves.length > 1 ) {
        let newPhysMoves : number[] = [];
        physMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestPhysHit - moveDamage ) < 0.01 ) {
                newPhysMoves.push( moveIndex );
            }
        });
        physMoves = newPhysMoves;
    }
    // Discard low hitting special moves
    if ( specMoves.length > 1 ) {
        let newSpecMoves : number[] = [];
        specMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestSpecHit - moveDamage ) < 0.01 ) {
                newSpecMoves.push( moveIndex );
            }
        });
        specMoves = newSpecMoves;
    }

    // Predict best defensive nature based on the hardest hitting move
    // #TODO: Apply PQ nature preference
    if (!useGivenNature ) {
        noAbilityDefender.nature = selectDefensiveNaturePreference( noAbilityDefender, isHighestHitPhysical, physMoves.length>0, specMoves.length>0, parameters.search.defNaturePreferencePQ ) as NatureName;
        /*if ( isHighestHitPhysical ) {
            // Suggest defensive nature
            noAbilityDefender.nature = "Bold";
        }
        else {
            // Suggest specially defensive nature
            noAbilityDefender.nature = "Calm";
        }*/
    }
    // Update stats, ugly
    noAbilityDefender = noAbilityDefender.clone();

    let physResults : Smogon.Result[] = [];
    let specResults : Smogon.Result[] = [];
    // Reuse previous results if must use given nature
    if ( useGivenNature ) {
        physMoves.forEach( moveIndex => 
            physResults.push( preResults[moveIndex])
        );
        specMoves.forEach( moveIndex => 
            specResults.push( preResults[moveIndex])
        );
    }
    // Recalculate damage for the relevant moves with the updated defensive nature
    else {
        physMoves.forEach( moveIndex => 
            physResults.push( Smogon.calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( Smogon.calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizerPQ = new DefenseStatOptimizerPQ();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        let defStat = calcModifiedDefenseStat(gen, noAbilityDefender, noAbilityDefender.evs.def );
        optimizer.addDefNode( finalEVSpread.def, defStat, 0 );
        //console.log('Adding default defense node -> EV:%d  Stat:%d', finalEVSpread.def, defStat ); // #TODO: Delete this line
    }
    else {
        let initialDefEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextDefEV = initialDefEV;
        do {
            let maxDamage = 0;
            physResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextDefEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                let defStat = calcModifiedDefenseStat(gen, noAbilityDefender, nextDefEV);
                optimizer.addDefNode( nextDefEV, defStat, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextDefEV = ( nextDefEV - (nextDefEV % 4) ) + 4;
        } while ( nextDefEV <= 252 );
    }

    // Setup SpD nodes
    if ( specResults.length == 0 ) {
        let spdStat = calcModifiedSpDefenseStat(gen, noAbilityDefender, noAbilityDefender.evs.spd );
        optimizer.addSpDNode( finalEVSpread.spd, spdStat, 0 );
    }
    else {
        let initialSpdEV = finalEVSpread.spd;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value SpDEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextSpdEV = initialSpdEV;
        do {
            let maxDamage = 0;
            specResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextSpdEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                let spdStat = calcModifiedSpDefenseStat(gen, noAbilityDefender, nextSpdEV);
                optimizer.addSpDNode( nextSpdEV, spdStat, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextSpdEV = ( nextSpdEV - (nextSpdEV % 4) ) + 4;
        } while ( nextSpdEV <= 252 );
    }

    // #DEBUG
    /*console.log('Def Nodes');
    optimizer.defNodes.forEach( item => {
        console.log('EV: %d, Stat: %d, Dmg: %d', item.ev, item.stat, item.damage );
    });
    console.log('------------------------')
    console.log('SpD Nodes');
    optimizer.spdNodes.forEach( item => {
        console.log('EV: %d, Stat: %d, Dmg: %d', item.ev, item.stat, item.damage );
    });*/

    // Re-enable Quark Drive / Protosynthesis - UGLY
    noAbilityDefender.ability = raidDefender.ability;
    let abilityDefender = noAbilityDefender.clone();

    // Find best stat for both PQ Def and SpD thresholds
    let bestStat = getHighestStat_PQ(gen, abilityDefender);

    // #DEBUG
    //console.log('PQ Threshold Stat: %s - %d', bestStat.stat, bestStat.val);

    // Setup nodes for Defense PQ damage calculations
    // -- First find the lowest stat/ev value where defense becomes the elected QP stat
    //   >> If such a value is found, we enable Quark Drive
    //   >> Otherwise defense is never chosen, skip calcs

    let defThresholdEV = findDefEvPQThreshold( gen, abilityDefender, bestStat );
    if ( defThresholdEV != undefined ) {
        if ( physMoves.length > 0 ) {
            // Precalc phys damage
            let physResultsPQ : Smogon.Result[] = [];
            abilityDefender.evs.def = defThresholdEV.statEV;
            physMoves.forEach( moveIndex => 
                physResultsPQ.push( Smogon.calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let defEV = defThresholdEV.statEV; defEV <= 252; defEV = defEV - (defEV%4)+4 ) {
                let maxDamage = 0;
                physResultsPQ.forEach( result => {
                    let damage = recalculateFinalDamage( result, defEV );
                    maxDamage = Math.max( damage[15], maxDamage );
                });

                // Calculate defense stat
                let defStat = calcModifiedDefenseStat(gen, abilityDefender, defEV);
                // Create new node if we reached a new damage value
                if ( maxDamage < previousDamageTaken ) {
                    optimizer.addDefNodePQ( defEV, defStat, maxDamage );
                    previousDamageTaken = maxDamage;
                }
                // Increase node range if we got the same damage value
                else {
                    optimizer.increaseDefNodePQRange(defEV, defStat );
                }
            }
        }
    }

    // Setup nodes for Special Defense PQ damage calculations
    // -- First find the lowest stat/ev value where defense becomes the elected QP stat
    //   >> If such a value is found, we enable Quark Drive
    //   >> Otherwise defense is never chosen, skip calcs

    let spdThresholdEV = findSpdEvPQThreshold( gen, abilityDefender, bestStat );
    if ( spdThresholdEV != undefined ) {
        if ( specMoves.length > 0 ) {
            // Precalc spec damage
            let specResultsPQ : Smogon.Result[] = [];
            abilityDefender.evs.spd = spdThresholdEV.statEV;
            specMoves.forEach( moveIndex => 
                specResultsPQ.push( Smogon.calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let spdEV = spdThresholdEV.statEV; spdEV <= 252; spdEV = spdEV - (spdEV%4)+4 ) {
                let maxDamage = 0;
                specResultsPQ.forEach( result => {
                    let damage = recalculateFinalDamage( result, spdEV );
                    maxDamage = Math.max( damage[15], maxDamage );
                });

                // Calculate defense stat
                let spdStat = calcModifiedSpDefenseStat(gen, abilityDefender, spdEV);
                // Create new node if we reached a new damage value
                if ( maxDamage < previousDamageTaken ) {
                    optimizer.addSpDNodePQ( spdEV, spdStat, maxDamage );
                    previousDamageTaken = maxDamage;
                }
                // Increase node range if we got the same damage value
                else {
                    optimizer.increaseSpDNodePQRange(spdEV, spdStat );
                }
            }
        }
    }

    // #DEBUG
    /*console.log('Def PQ Nodes');
    optimizer.defNodesPQ.forEach( item => {
        console.log('Min EV: %d, Stat: %d, Dmg: %d', item.getMinimumEV(), item.getMinimumStat(), item.damageValue );
    });
    console.log('------------------------')
    console.log('SpD PQ Nodes');
    optimizer.spdNodesPQ.forEach( item => {
        console.log('Min EV: %d, Stat: %d, Dmg: %d', item.getMinimumEV(), item.getMinimumStat(), item.damageValue );
    });*/

    // Check pairs for all combinations of Def and SpD nodes
    // Find pairs that have matching damage values
    // Try all combinations by test-allocating as much HP as possible

    // Select the combination with the lowest max percent
    let bestCombo = optimizer.findBestSpread(
        abilityDefender.species.baseStats.hp,
        abilityDefender.ivs.hp,
        finalEVSpread.hp, // Initial HP investment, if any
        510 - (finalEVSpread.hp + finalEVSpread.atk + finalEVSpread.def + finalEVSpread.spa + finalEVSpread.spd + finalEVSpread.spe),
        abilityDefender.level);

    finalEVSpread.hp = bestCombo.hpEV;
    finalEVSpread.def = bestCombo.defEV;
    finalEVSpread.spd = bestCombo.spdEV;

    // #DEBUG
    //console.log('Best Spread(HP:%d, Def:%d , Spd:%d)', finalEVSpread.hp, finalEVSpread.def, finalEVSpread.spd );

    return new EVSpread( abilityDefender.nature, finalEVSpread );
}






/** Optimal Defensive Threshold
 * --------------------------
 * Find the best EV spread to meet the maximum defensive threshold the raid defender Pokemon can invest into.
 * This EV spread is the minimum defensive investment needed to reach the best defensive threshold,
 * where the threshold is directly given by the number of consecutive turns the Pokemon can survive
 * to the given set of moves if being consistently targeted by the hardest hitting move.
*/
function getOptimalDefensiveThresholdSpread( gen: Generation, raidBoss: Smogon.Pokemon, raidDefender: Smogon.Pokemon, moves: Smogon.Move[], field: Smogon.Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: Smogon.StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    if (!useGivenNature) {
        raidDefender.nature = "Hardy";
    }

    // Perform preliminary damage check for each move
    let preResults : Smogon.Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = Smogon.calculate(gen, raidBoss, raidDefender, move, field );
        if (result.range()[1] > 0 ) {
            eligibleIndices.push(i);
        }
        preResults.push(result);
    }

    // Check if all moves deal damage, if not the defender is immune and needs no defensive investment
    if ( eligibleIndices.length == 0 ) {
        return new EVSpread( raidDefender.nature, finalEVSpread );
    }    

    // Separate physical moves from special moves (Keep track of initial indices?)
    let physMoves : number[] = [];
    let specMoves : number[] = [];
    let highestPhysHit : number = 0;
    let highestSpecHit : number = 0;
    let highestHit : number = 0;
    let isHighestHitPhysical : boolean = false;
    eligibleIndices.forEach( moveIndex => {
        const moveDamage = preResults[moveIndex].range()[1];
        if ( preResults[moveIndex].rawDesc.hitsPhysical ) {
            physMoves.push( moveIndex );
            highestPhysHit = Math.max( moveDamage, highestPhysHit );
        }
        else {
            specMoves.push( moveIndex );
            highestSpecHit = Math.max( moveDamage, highestSpecHit );
        }
        if ( moveDamage > highestHit ) {
            highestHit = moveDamage;
            isHighestHitPhysical = preResults[moveIndex].rawDesc.hitsPhysical!;
        }
    });

    // Predict best defensive nature based on the hardest hitting move
    if ( !useGivenNature ) {
        if ( isHighestHitPhysical ) {
            // Suggest defensive nature
            raidDefender.nature = "Bold";
        }
        else {
            // Suggest specially defensive nature
            raidDefender.nature = "Calm";
        }
    }

    // Discard low hitting physical moves
    if ( physMoves.length > 1 ) {
        let newPhysMoves : number[] = [];
        physMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestPhysHit - moveDamage ) < 0.01 ) {
                newPhysMoves.push( moveIndex );
            }
        });
        physMoves = newPhysMoves;
    }
    // Discard low hitting special moves
    if ( specMoves.length > 1 ) {
        let newSpecMoves : number[] = [];
        specMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestSpecHit - moveDamage ) < 0.01 ) {
                newSpecMoves.push( moveIndex );
            }
        });
        specMoves = newSpecMoves;
    }

    // Recalculate damage for the relevant moves with the updated defensive nature
    let physResults : Smogon.Result[] = [];
    let specResults : Smogon.Result[] = [];
    if ( useGivenNature ) {
        // Reuse previous results if must use given nature
        physMoves.forEach( moveIndex => 
            physResults.push( preResults[moveIndex])
        );
        specMoves.forEach( moveIndex => 
            specResults.push( preResults[moveIndex])
        );
    }
    else {
        // Recalculate results for updated nature
        physMoves.forEach( moveIndex => 
            physResults.push( Smogon.calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( Smogon.calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizer = new DefenseStatOptimizer();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        optimizer.addDefNode( finalEVSpread.def, 0 );
    }
    else {
        let initialDefEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextDefEV = initialDefEV;
        do {
            let maxDamage = 0;
            physResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextDefEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                optimizer.addDefNode( nextDefEV, maxDamage );
            }

            nextDefEV = ( nextDefEV - (nextDefEV % 4) ) + 4;
        } while ( nextDefEV <= 252 );
    }

    // Setup SpD nodes
    if ( specResults.length == 0 ) {
        optimizer.addSpDNode( finalEVSpread.spd, 0 );
    }
    else {
        let initialSpdEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextSpdEV = initialSpdEV;
        do {
            let maxDamage = 0;
            specResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextSpdEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                optimizer.addSpDNode( nextSpdEV, maxDamage );
            }

            nextSpdEV = ( nextSpdEV - (nextSpdEV % 4) ) + 4;
        } while ( nextSpdEV <= 252 );
    }

    // #DEBUG: Print all nodes

    // Check pairs for all combinations of Def and SpD nodes
    // Find pairs that have matching damage values
    // Try all combinations by test-allocating as much HP as possible
    // -- think of ways to cull obvious bad nodes in this step?
    // ---- look ahead to the next node
    // ---- if allocating next node would leave 252+ remaining EVs
    // ---- then we haven't exhausted all EVs in Defenses yet



    // Select the combination with the lowest max percent
    let bestCombo = optimizer.findBestThresholdCombination(
        raidDefender.species.baseStats.hp,
        raidDefender.ivs.hp,
        finalEVSpread.hp, // Initial HP investment, if any
        510 - (finalEVSpread.hp + finalEVSpread.atk + finalEVSpread.def + finalEVSpread.spa + finalEVSpread.spd + finalEVSpread.spe),
        raidDefender.level);

    finalEVSpread.hp = bestCombo.hpEV;
    finalEVSpread.def = bestCombo.defEV;
    finalEVSpread.spd = bestCombo.spdEV;

    // NOTE: MUST TAKE INTO ACCOUNT ANY PRE-EXISTING EVS
    // 1 - Def/SpD nodes must start at the EV given in the defender's spread
    // 2 - Cull Def/SpD pairs that would on their own exceed the EV limit
    // 3 - 

    // #DEBUG CHECK IF VALUES ARE OK
    /*let damageMinEV = recalculateFinalDamage( results[0], 0 );
    let damageMaxEV = recalculateFinalDamage( results[0], 252 );

    let damageRange : number[] = [damageMinEV[15], damageMaxEV[15]]; 

    finalEVSpread.atk = damageRange[0];
    finalEVSpread.spa = damageRange[1];*/

    return new EVSpread( raidDefender.nature, finalEVSpread );
}




/** Optimal Defensive Threshold (Proto/Quark)
 * --------------------------
 * Find the most efficient EV spread to meet maximum defensive threshold for defenders with enabled Protoynthesis / Quark Drive.
 * This EV spread is the minimum defensive investment needed to reach the best defensive threshold,
 * where the threshold is directly given by the number of consecutive turns the Pokemon can survive
 * to the given set of moves if being consistently targeted by the hardest hitting move.
*/
function getOptimalDefensiveThreshold_PQ( gen: Generation, raidBoss: Smogon.Pokemon, raidDefender: Smogon.Pokemon, moves: Smogon.Move[], field: Smogon.Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: Smogon.StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    let noAbilityDefender = raidDefender.clone();
    if ( !useGivenNature ) {
        noAbilityDefender.nature = "Hardy";
    }
    noAbilityDefender.ability = undefined;

    // Perform preliminary damage check for each move
    let preResults : Smogon.Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = Smogon.calculate(gen, raidBoss, noAbilityDefender, move, field );
        if (result.range()[1] > 0 ) {
            eligibleIndices.push(i);
        }
        preResults.push(result);
    }

    // Check if all moves deal damage, if not the defender is immune and needs no defensive investment
    if ( eligibleIndices.length == 0 ) {
        return new EVSpread( raidDefender.nature, finalEVSpread );
    }    

    // Separate physical moves from special moves (Keep track of initial indices?)
    let physMoves : number[] = [];
    let specMoves : number[] = [];
    let highestPhysHit : number = 0;
    let highestSpecHit : number = 0;
    let highestHit : number = 0;
    let isHighestHitPhysical : boolean = false;
    eligibleIndices.forEach( moveIndex => {
        const moveDamage = preResults[moveIndex].range()[1];
        if ( preResults[moveIndex].rawDesc.hitsPhysical ) {
            physMoves.push( moveIndex );
            highestPhysHit = Math.max( moveDamage, highestPhysHit );
        }
        else {
            specMoves.push( moveIndex );
            highestSpecHit = Math.max( moveDamage, highestSpecHit );
        }
        if ( moveDamage > highestHit ) {
            highestHit = moveDamage;
            isHighestHitPhysical = preResults[moveIndex].rawDesc.hitsPhysical!;
        }
    });

    // Discard low hitting physical moves
    if ( physMoves.length > 1 ) {
        let newPhysMoves : number[] = [];
        physMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestPhysHit - moveDamage ) < 0.01 ) {
                newPhysMoves.push( moveIndex );
            }
        });
        physMoves = newPhysMoves;
    }
    // Discard low hitting special moves
    if ( specMoves.length > 1 ) {
        let newSpecMoves : number[] = [];
        specMoves.forEach( moveIndex => {
            const moveDamage = preResults[moveIndex].range()[1];
            // Include if damage is near the highest hit
            if ( (highestSpecHit - moveDamage ) < 0.01 ) {
                newSpecMoves.push( moveIndex );
            }
        });
        specMoves = newSpecMoves;
    }

    // Predict best defensive nature based on the hardest hitting move
    // #TODO: Apply PQ nature preference
    if (!useGivenNature ) {
        noAbilityDefender.nature = selectDefensiveNaturePreference( noAbilityDefender, isHighestHitPhysical, physMoves.length>0, specMoves.length>0, parameters.search.defNaturePreferencePQ ) as NatureName;
        /*if ( isHighestHitPhysical ) {
            // Suggest defensive nature
            noAbilityDefender.nature = "Bold";
        }
        else {
            // Suggest specially defensive nature
            noAbilityDefender.nature = "Calm";
        }*/
    }
    // Update stats, ugly
    noAbilityDefender = noAbilityDefender.clone();

    // Recalculate damage for the relevant moves with the updated defensive nature
    let physResults : Smogon.Result[] = [];
    let specResults : Smogon.Result[] = [];
    if ( useGivenNature ) {
        // Reuse previous results if must use given nature
        physMoves.forEach( moveIndex => 
            physResults.push( preResults[moveIndex])
        );
        specMoves.forEach( moveIndex => 
            specResults.push( preResults[moveIndex])
        );
    }
    else {
        physMoves.forEach( moveIndex => 
            physResults.push( Smogon.calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( Smogon.calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizerPQ = new DefenseStatOptimizerPQ();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        let defStat = calcModifiedDefenseStat(gen, noAbilityDefender, noAbilityDefender.evs.def );
        optimizer.addDefNode( finalEVSpread.def, defStat, 0 );
    }
    else {
        let initialDefEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextDefEV = initialDefEV;
        do {
            let maxDamage = 0;
            physResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextDefEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                let defStat = calcModifiedDefenseStat(gen, noAbilityDefender, nextDefEV);
                optimizer.addDefNode( nextDefEV, defStat, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextDefEV = ( nextDefEV - (nextDefEV % 4) ) + 4;
        } while ( nextDefEV <= 252 );
    }

    // Setup SpD nodes
    if ( specResults.length == 0 ) {
        let spdStat = calcModifiedSpDefenseStat(gen, noAbilityDefender, noAbilityDefender.evs.spd );
        optimizer.addSpDNode( finalEVSpread.spd, spdStat, 0 );
    }
    else {
        let initialSpdEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextSpdEV = initialSpdEV;
        do {
            let maxDamage = 0;
            specResults.forEach( result => {
                let damage = recalculateFinalDamage( result, nextSpdEV );
                maxDamage = Math.max( damage[15], maxDamage );
            });

            if ( maxDamage < previousDamageTaken ) {
                let spdStat = calcModifiedSpDefenseStat(gen, noAbilityDefender, nextSpdEV);
                optimizer.addSpDNode( nextSpdEV, spdStat, maxDamage );
                previousDamageTaken = maxDamage;
            }

            nextSpdEV = ( nextSpdEV - (nextSpdEV % 4) ) + 4;
        } while ( nextSpdEV <= 252 );
    }

    // #DEBUG
    /*console.log('Def Nodes');
    optimizer.defNodes.forEach( item => {
        console.log('EV: %d, Stat: %d, Dmg: %d', item.ev, item.stat, item.damage );
    });
    console.log('------------------------')
    console.log('SpD Nodes');
    optimizer.spdNodes.forEach( item => {
        console.log('EV: %d, Stat: %d, Dmg: %d', item.ev, item.stat, item.damage );
    });*/

    // Re-enable Quark Drive / Protosynthesis - UGLY
    noAbilityDefender.ability = raidDefender.ability;
    let abilityDefender = noAbilityDefender.clone();

    // Find best stat for both PQ Def and SpD thresholds
    let bestStat = getHighestStat_PQ(gen, abilityDefender);

    // #DEBUG
    //console.log('PQ Threshold Stat: %s - %d', bestStat.stat, bestStat.val);

    // Setup nodes for Defense PQ damage calculations
    // -- First find the lowest stat/ev value where defense becomes the elected QP stat
    //   >> If such a value is found, we enable Quark Drive
    //   >> Otherwise defense is never chosen, skip calcs

    let defThresholdEV = findDefEvPQThreshold( gen, abilityDefender, bestStat );
    if ( defThresholdEV != undefined ) {
        if ( physMoves.length > 0 ) {
            // Precalc phys damage
            let physResultsPQ : Smogon.Result[] = [];
            abilityDefender.evs.def = defThresholdEV.statEV;
            physMoves.forEach( moveIndex => 
                physResultsPQ.push( Smogon.calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let defEV = defThresholdEV.statEV; defEV <= 252; defEV = defEV - (defEV%4)+4 ) {
                let maxDamage = 0;
                physResultsPQ.forEach( result => {
                    let damage = recalculateFinalDamage( result, defEV );
                    maxDamage = Math.max( damage[15], maxDamage );
                });

                // Calculate defense stat
                let defStat = calcModifiedDefenseStat(gen, abilityDefender, defEV);
                // Create new node if we reached a new damage value
                if ( maxDamage < previousDamageTaken ) {
                    optimizer.addDefNodePQ( defEV, defStat, maxDamage );
                    previousDamageTaken = maxDamage;
                }
                // Increase node range if we got the same damage value
                else {
                    optimizer.increaseDefNodePQRange(defEV, defStat );
                }
            }
        }
    }

    // Setup nodes for Special Defense PQ damage calculations
    // -- First find the lowest stat/ev value where defense becomes the elected QP stat
    //   >> If such a value is found, we enable Quark Drive
    //   >> Otherwise defense is never chosen, skip calcs

    let spdThresholdEV = findSpdEvPQThreshold( gen, abilityDefender, bestStat );
    if ( spdThresholdEV != undefined ) {
        if ( specMoves.length > 0 ) {
            // Precalc spec damage
            let specResultsPQ : Smogon.Result[] = [];
            abilityDefender.evs.spd = spdThresholdEV.statEV;
            specMoves.forEach( moveIndex => 
                specResultsPQ.push( Smogon.calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let spdEV = spdThresholdEV.statEV; spdEV <= 252; spdEV = spdEV - (spdEV%4)+4 ) {
                let maxDamage = 0;
                specResultsPQ.forEach( result => {
                    let damage = recalculateFinalDamage( result, spdEV );
                    maxDamage = Math.max( damage[15], maxDamage );
                });

                // Calculate defense stat
                let spdStat = calcModifiedSpDefenseStat(gen, abilityDefender, spdEV);
                // Create new node if we reached a new damage value
                if ( maxDamage < previousDamageTaken ) {
                    optimizer.addSpDNodePQ( spdEV, spdStat, maxDamage );
                    previousDamageTaken = maxDamage;
                }
                // Increase node range if we got the same damage value
                else {
                    optimizer.increaseSpDNodePQRange(spdEV, spdStat );
                }
            }
        }
    }

    // #DEBUG
    /*console.log('Def PQ Nodes');
    optimizer.defNodesPQ.forEach( item => {
        console.log('Min EV: %d, Stat: %d, Dmg: %d', item.getMinimumEV(), item.getMinimumStat(), item.damageValue );
    });
    console.log('------------------------')
    console.log('SpD PQ Nodes');
    optimizer.spdNodesPQ.forEach( item => {
        console.log('Min EV: %d, Stat: %d, Dmg: %d', item.getMinimumEV(), item.getMinimumStat(), item.damageValue );
    });*/

    // Check pairs for all combinations of Def and SpD nodes
    // Find pairs that have matching damage values
    // Try all combinations by test-allocating as much HP as possible

    // Select the combination with the lowest max percent
    let bestCombo = optimizer.findBestThreshold(
        abilityDefender.species.baseStats.hp,
        abilityDefender.ivs.hp,
        finalEVSpread.hp, // Initial HP investment, if any
        510 - (finalEVSpread.hp + finalEVSpread.atk + finalEVSpread.def + finalEVSpread.spa + finalEVSpread.spd + finalEVSpread.spe),
        abilityDefender.level);

    finalEVSpread.hp = bestCombo.hpEV;
    finalEVSpread.def = bestCombo.defEV;
    finalEVSpread.spd = bestCombo.spdEV;

    // #DEBUG
    //console.log('Best Spread(HP:%d, Def:%d , Spd:%d)', finalEVSpread.hp, finalEVSpread.def, finalEVSpread.spd );

    return new EVSpread( abilityDefender.nature, finalEVSpread );
}


function getMinimumOutspeedEV(targetSpeed: number, gen: Generation, pokemon: Smogon.Pokemon, field: Smogon.Field, side: Smogon.Side ) {
    let minEV = pokemon.evs.spe;
    let initialCheck = getFinalSpeed(gen, pokemon, field, side );
    if ( initialCheck > targetSpeed ) {
        return minEV;
    }
    pokemon.evs.spe = 252;
    recalcRawStat(gen, pokemon, 'spe');
    let endCheck = getFinalSpeed(gen,pokemon,field,side);
    //console.log('End check: %d | Target Speed: %d', endCheck, targetSpeed );
    if ( endCheck > targetSpeed ) {
        //console.log('How did we get here?');
        for ( let speEV = minEV-(minEV%4)+4; speEV <= 252; speEV +=4 ) {
            pokemon.evs.spe = speEV;
            recalcRawStat(gen, pokemon, 'spe');
            let finalSpeed = getFinalSpeed(gen,pokemon,field,side);
            if ( finalSpeed > targetSpeed ) {
                return speEV;
            }
        }
    }
    pokemon.evs.spe = minEV;
    return undefined;
}
function recalcRawStat(gen: Generation, pokemon: Smogon.Pokemon, stat: Smogon.StatID ) {
    pokemon.rawStats[stat] = pokemon.stats[stat] = Smogon.Stats.calcStatADV(gen.natures, stat, pokemon.species.baseStats[stat], pokemon.ivs[stat], pokemon.evs[stat], pokemon.level, pokemon.nature);
}

function selectDefensiveNaturePreference( pokemon: Smogon.Pokemon, isHighestHitPhysical: boolean, hasPhysicalDamage: boolean, hasSpecialDamage: boolean, pref: DefensiveNaturePreference) {
    let raisedStat = ( isHighestHitPhysical ? 'def' : 'spd' );
    let loweredStat = '';
    switch (pref) {
        case DefensiveNaturePreference.HinderHighestStat:
            // Def is the raised stat, don't lower it
            // Only lower SpDef if there is no special damage
            if ( isHighestHitPhysical ) {
                loweredStat = getHighestBaseStat( pokemon.species.baseStats, false, true, false, true, !hasSpecialDamage, true );
            }
            // Spd is the raised stat, don't lower it
            // Only lower Def if there is no physical damage
            else {
                loweredStat = getHighestBaseStat( pokemon.species.baseStats, false, true, !hasPhysicalDamage, true, false, true );
            }
            break;
        case DefensiveNaturePreference.HinderHighestOfAtkSpa:
            loweredStat = getHighestBaseStat( pokemon.species.baseStats, false, true, false, true, false, false );
            break;
        case DefensiveNaturePreference.HinderHighestOfAtkSpaSpe:
            loweredStat = getHighestBaseStat( pokemon.species.baseStats, false, true, false, true, false, true );
            break;
        case DefensiveNaturePreference.HinderLowestOfAtkSpa:
            loweredStat = getLowestBaseStat( pokemon.species.baseStats, false, true, false, true, false, false );
            break;
        case DefensiveNaturePreference.HinderLowestOfAtkSpaSpe:
            loweredStat = getLowestBaseStat( pokemon.species.baseStats, false, true, false, true, false, true );
            break;
        case DefensiveNaturePreference.HinderOnlyAtk:
            loweredStat = 'atk';
            break;
        case DefensiveNaturePreference.HinderOnlyDefense:
            loweredStat = 'def';
            break;
        case DefensiveNaturePreference.HinderOnlySpa:
            loweredStat = 'spa';
            break;
        case DefensiveNaturePreference.HinderOnlySpd:
            loweredStat = 'spd';
            break;
        case DefensiveNaturePreference.HinderOnlySpe:
            loweredStat = 'spe';
            break;
    }

    return getNatureFromStats( raisedStat, loweredStat );
}

function getHighestBaseStat( baseStats: StatsTable<number>, hp: boolean, atk: boolean, def: boolean, spa: boolean, spd: boolean, spe: boolean ) {
    let highestStat = '';
    let highest = 0;
    if ( hp ) { 
        highestStat = 'hp';
        highest = baseStats.hp;
    }
    if ( atk && ( baseStats.atk > highest ) ) {
        highestStat = 'atk';
        highest = baseStats.atk;
    }
    if ( def && ( baseStats.def > highest ) ) {
        highestStat = 'def';
        highest = baseStats.def;
    }
    if ( spa && ( baseStats.spa > highest ) ) {
        highestStat = 'spa';
        highest = baseStats.spa;
    }
    if ( spd && ( baseStats.spd > highest ) ) {
        highestStat = 'spd';
        highest = baseStats.spd;
    }
    if ( spe && ( baseStats.spe > highest ) ) {
        highestStat = 'spe';
        highest = baseStats.spe;
    }

    return highestStat;
}

function getLowestBaseStat( baseStats: StatsTable<number>, hp: boolean, atk: boolean, def: boolean, spa: boolean, spd: boolean, spe: boolean ) {
    let lowestStat = '';
    let lowest = 256;
    if ( hp ) { 
        lowestStat = 'hp';
        lowest = baseStats.hp;
    }
    if ( atk && ( baseStats.atk < lowest ) ) {
        lowestStat = 'atk';
        lowest = baseStats.atk;
    }
    if ( def && ( baseStats.def < lowest ) ) {
        lowestStat = 'def';
        lowest = baseStats.def;
    }
    if ( spa && ( baseStats.spa < lowest ) ) {
        lowestStat = 'spa';
        lowest = baseStats.spa;
    }
    if ( spd && ( baseStats.spd < lowest ) ) {
        lowestStat = 'spd';
        lowest = baseStats.spd;
    }
    if ( spe && ( baseStats.spe < lowest ) ) {
        lowestStat = 'spe';
        lowest = baseStats.spe;
    }

    return lowestStat;
}