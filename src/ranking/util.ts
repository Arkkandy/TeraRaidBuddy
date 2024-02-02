import { Field, NATURES, Pokemon, Side, Stats, toID } from "../smogon-calc";
import { Generation, StatID, StatsTable, TypeName } from "../smogon-calc/data/interface";
import { getFinalSpeed, getModifiedStat } from "../smogon-calc/mechanics/util";
import { DefensiveNaturePreference } from "./searchparameters";

export enum BattlefieldSide {
    Attacker,
    Defender
}

export class EVSpread {
    public nature: string;
    public EVs: StatsTable<number>;

    constructor(nature: string, EVs: StatsTable<number>) {
        this.nature = nature;
        this.EVs = EVs;
    }

    public toString() {
        let spread: string = this.nature;

        if ( this.EVs.hp > 0 ) {
            spread += ', ' + this.EVs.hp.toString() + " HP";
        }
        if ( this.EVs.atk > 0 ) {
            spread += ', ' + this.EVs.atk.toString() + " Atk";
        }
        if ( this.EVs.def > 0 ) {
            spread += ', ' + this.EVs.def.toString() + " Def";
        }
        if ( this.EVs.spa > 0 ) {
            spread += ', ' + this.EVs.spa.toString() + " SpA";
        }
        if ( this.EVs.spd > 0 ) {
            spread += ', ' + this.EVs.spd.toString() + " SpD";
        }
        if ( this.EVs.spe > 0 ) {
            spread += ', ' + this.EVs.spe.toString() + " Spe";
        }
        return spread;
    }

    public getTotalEVInvestment() {
        return this.EVs.hp + this.EVs.atk + this.EVs.def + this.EVs.spa + this.EVs.spd + this.EVs.spe;
    }

    public getUnallocatedEVs() {
        return 510 - this.getTotalEVInvestment();
    }
}

export function getTotalEVInvestment(EVs:StatsTable<number>) {
    return EVs.hp + EVs.atk + EVs.def + EVs.spa + EVs.spd + EVs.spe;
}
export function evsToString(nature: string, EVs:StatsTable<number>) {
    let spread: string = nature;

    if ( EVs.hp > 0 ) {
        spread += ', ' + EVs.hp.toString() + " HP";
    }
    if ( EVs.atk > 0 ) {
        spread += ', ' + EVs.atk.toString() + " Atk";
    }
    if ( EVs.def > 0 ) {
        spread += ', ' + EVs.def.toString() + " Def";
    }
    if ( EVs.spa > 0 ) {
        spread += ', ' + EVs.spa.toString() + " SpA";
    }
    if ( EVs.spd > 0 ) {
        spread += ', ' + EVs.spd.toString() + " SpD";
    }
    if ( EVs.spe > 0 ) {
        spread += ', ' + EVs.spe.toString() + " Spe";
    }
    return spread;
}
export function evsToStringShowAll(text: string, EVs:StatsTable<number>) {
    let spread: string = text + ":";

    spread += ', ' + EVs.hp.toString() + " HP";
    spread += ', ' + EVs.atk.toString() + " Atk";
    spread += ', ' + EVs.def.toString() + " Def";
    spread += ', ' + EVs.spa.toString() + " SpA";
    spread += ', ' + EVs.spd.toString() + " SpD";
    spread += ', ' + EVs.spe.toString() + " Spe";

    return spread;
}

export interface BestStat {
    stat: string;
    val: number;
}


type EffectivenessArray = {
    [type in TypeName]: number;
}
export class TypeMatchup {
    multipliers: EffectivenessArray = {
        Normal: 1,
        Grass: 1,
        Fire: 1,
        Water: 1,
        Electric: 1,
        Ice: 1,
        Flying: 1,
        Bug: 1,
        Poison: 1,
        Ground: 1,
        Rock: 1,
        Fighting: 1,
        Psychic: 1,
        Ghost: 1,
        Dragon: 1,
        Steel: 1,
        Dark: 1,
        Fairy: 1,
        '???': 1,
        Stellar: 1
    };

    constructor( gen: Generation, defType1: TypeName, defType2?: TypeName, defTeraType?: TypeName ) {
        if ( defTeraType && defTeraType != 'Stellar' && defTeraType != '???' ) {
            this.multipliers.Normal = this.getMatchupMultiplier(gen, 'Normal', defTeraType );
            this.multipliers.Grass = this.getMatchupMultiplier(gen, 'Grass', defTeraType );
            this.multipliers.Fire = this.getMatchupMultiplier(gen, 'Fire', defTeraType );
            this.multipliers.Water= this.getMatchupMultiplier(gen, 'Water', defTeraType );
            this.multipliers.Electric = this.getMatchupMultiplier(gen, 'Electric', defTeraType );
            this.multipliers.Ice = this.getMatchupMultiplier(gen, 'Ice', defTeraType );
            this.multipliers.Flying = this.getMatchupMultiplier(gen, 'Flying', defTeraType );
            this.multipliers.Bug = this.getMatchupMultiplier(gen, 'Bug', defTeraType );
            this.multipliers.Poison = this.getMatchupMultiplier(gen, 'Poison', defTeraType );
            this.multipliers.Ground = this.getMatchupMultiplier(gen, 'Ground', defTeraType );
            this.multipliers.Rock = this.getMatchupMultiplier(gen, 'Rock', defTeraType );
            this.multipliers.Fighting = this.getMatchupMultiplier(gen, 'Fighting', defTeraType );
            this.multipliers.Psychic = this.getMatchupMultiplier(gen, 'Psychic', defTeraType );
            this.multipliers.Ghost = this.getMatchupMultiplier(gen, 'Ghost', defTeraType );
            this.multipliers.Dragon = this.getMatchupMultiplier(gen, 'Dragon', defTeraType );
            this.multipliers.Steel = this.getMatchupMultiplier(gen, 'Steel', defTeraType );
            this.multipliers.Dark = this.getMatchupMultiplier(gen, 'Dark', defTeraType );
            this.multipliers.Fairy = this.getMatchupMultiplier(gen, 'Fairy', defTeraType );
        }
        else {
            this.multipliers.Normal = this.getMatchupMultiplier(gen, 'Normal', defType1 );
            this.multipliers.Grass = this.getMatchupMultiplier(gen, 'Grass', defType1 );
            this.multipliers.Fire = this.getMatchupMultiplier(gen, 'Fire', defType1 );
            this.multipliers.Water= this.getMatchupMultiplier(gen, 'Water', defType1 );
            this.multipliers.Electric = this.getMatchupMultiplier(gen, 'Electric', defType1 );
            this.multipliers.Ice = this.getMatchupMultiplier(gen, 'Ice', defType1 );
            this.multipliers.Flying = this.getMatchupMultiplier(gen, 'Flying', defType1 );
            this.multipliers.Bug = this.getMatchupMultiplier(gen, 'Bug', defType1 );
            this.multipliers.Poison = this.getMatchupMultiplier(gen, 'Poison', defType1 );
            this.multipliers.Ground = this.getMatchupMultiplier(gen, 'Ground', defType1 );
            this.multipliers.Rock = this.getMatchupMultiplier(gen, 'Rock', defType1 );
            this.multipliers.Fighting = this.getMatchupMultiplier(gen, 'Fighting', defType1 );
            this.multipliers.Psychic = this.getMatchupMultiplier(gen, 'Psychic', defType1 );
            this.multipliers.Ghost = this.getMatchupMultiplier(gen, 'Ghost', defType1 );
            this.multipliers.Dragon = this.getMatchupMultiplier(gen, 'Dragon', defType1 );
            this.multipliers.Steel = this.getMatchupMultiplier(gen, 'Steel', defType1 );
            this.multipliers.Dark = this.getMatchupMultiplier(gen, 'Dark', defType1 );
            this.multipliers.Fairy = this.getMatchupMultiplier(gen, 'Fairy', defType1 );

            if ( defType2 ) {
                this.multipliers.Normal *= this.getMatchupMultiplier(gen, 'Normal', defType2 );
                this.multipliers.Grass *= this.getMatchupMultiplier(gen, 'Grass', defType2 );
                this.multipliers.Fire *= this.getMatchupMultiplier(gen, 'Fire', defType2 );
                this.multipliers.Water *= this.getMatchupMultiplier(gen, 'Water', defType2 );
                this.multipliers.Electric *= this.getMatchupMultiplier(gen, 'Electric', defType2 );
                this.multipliers.Ice *= this.getMatchupMultiplier(gen, 'Ice', defType2 );
                this.multipliers.Flying *= this.getMatchupMultiplier(gen, 'Flying', defType2 );
                this.multipliers.Bug *= this.getMatchupMultiplier(gen, 'Bug', defType2 );
                this.multipliers.Poison *= this.getMatchupMultiplier(gen, 'Poison', defType2 );
                this.multipliers.Ground *= this.getMatchupMultiplier(gen, 'Ground', defType2 );
                this.multipliers.Rock *= this.getMatchupMultiplier(gen, 'Rock', defType2 );
                this.multipliers.Fighting *= this.getMatchupMultiplier(gen, 'Fighting', defType2 );
                this.multipliers.Psychic *= this.getMatchupMultiplier(gen, 'Psychic', defType2 );
                this.multipliers.Ghost *= this.getMatchupMultiplier(gen, 'Ghost', defType2 );
                this.multipliers.Dragon *= this.getMatchupMultiplier(gen, 'Dragon', defType2 );
                this.multipliers.Steel *= this.getMatchupMultiplier(gen, 'Steel', defType2 );
                this.multipliers.Dark *= this.getMatchupMultiplier(gen, 'Dark', defType2 );
                this.multipliers.Fairy *= this.getMatchupMultiplier(gen, 'Fairy', defType2 );
            }
        }
    }

    /* Smogon stores offensive multipliers in the Type Charts */
    /* This class stores defensive multipliers */
    getMatchupMultiplier( gen: Generation, attackType: TypeName, defendType: TypeName ) {
        let multiplier = gen.types.get(toID(attackType))?.effectiveness[defendType];
        return ( multiplier ? multiplier : 1 );
    }



    getTypeOffensiveMultiplier(type1 : TypeName ) : number {
        return this.multipliers[type1];
    }

    checkAtLeastOneSTAB(type1 : TypeName, type2 : TypeName | undefined ) {
        let isStab1 = this.getTypeOffensiveMultiplier(type1) > 1;
        let isStab2 = ( type2 ? this.getTypeOffensiveMultiplier(type2) > 1 : false );

        return isStab1 || isStab2;
    }
}




/**
    1 - Find first HP value that's above the threshold

    2 - Keep the ev value for that stat

    3 - Return HP value that's ON the threshold if above is not possible
*/
export function findBestHPEV_Threshold( baseHP: number, HPIV: number, minEV: number, maxEV: number, targetHP: number, level: number ) {
  let currentEV = maxEV;
  do {
      let currentHP = ( baseHP === 1 ? 
          baseHP :
          Math.floor(((baseHP * 2 + HPIV + Math.floor(currentEV / 4)) * level) / 100) + level + 10);
      
      // We found the lowest HP value immediately above the threshold
      /*if ( currentHP === (targetHP + 1) ) {
          return currentEV;
      }*/
      // We've gone below or into the threshold
      if ( currentHP === targetHP || currentHP < targetHP ) {
          // Return the hp EV from the previous HP value
          // #TODO: For levels lower than 100 it may not be +4
          return Math.min(currentEV+4,252);
      }
      currentEV -= 4;
  // This function is called on the condition that max and min threshold are different
  // Therefore one of the above conditions should always be met
  } while ( currentEV >= minEV );
  return currentEV+4;
}

/**
 * Lookup by numerical index => [RaisedStat][LoweredStat]
 */
const NATURE_LOOKUP_TABLE : string[][] = [
    ['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty'],
    ['Bold', 'Docile', 'Relaxed', 'Impish', 'Lax'],
    ['Timid', 'Hasty', 'Serious', 'Jolly', 'Naive'],
    ['Modest', 'Mild', 'Quiet', 'Bashful', 'Rash'],
    ['Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky']
];

export function statToNatureIndex( stat: string ) {
    switch ( stat ) {
        case 'atk' : return 0;
        case 'def' : return 1;
        case 'spe' : return 2;
        case 'spa' : return 3;
        case 'spd' : return 4;
    }
    return -1;
}

export function getNatureFromStats( plusStat: string, minusStat: string ) {
    let plusIndex = statToNatureIndex( plusStat );
    let minusIndex = statToNatureIndex( minusStat );

    return NATURE_LOOKUP_TABLE[plusIndex][minusIndex];
}

// Pokemon, 
export function getHighestStat_PQ( gen: Generation, pokemon: Pokemon ) : BestStat {
    // Calculate raw stats (except HP)
    
    let atkRaw = Stats.calcStatADV( gen.natures, 'atk', pokemon.species.baseStats.atk, pokemon.ivs.atk, pokemon.evs.atk, pokemon.level, pokemon.nature);
    let defRaw = Stats.calcStatADV( gen.natures, 'def', pokemon.species.baseStats.def, pokemon.ivs.def, pokemon.evs.def, pokemon.level, pokemon.nature);
    let spaRaw = Stats.calcStatADV( gen.natures, 'spa', pokemon.species.baseStats.spa, pokemon.ivs.spa, pokemon.evs.spa, pokemon.level, pokemon.nature);
    let spdRaw = Stats.calcStatADV( gen.natures, 'spd', pokemon.species.baseStats.spd, pokemon.ivs.spd, pokemon.evs.spd, pokemon.level, pokemon.nature);
    let speRaw = Stats.calcStatADV( gen.natures, 'spe', pokemon.species.baseStats.spe, pokemon.ivs.spe, pokemon.evs.spe, pokemon.level, pokemon.nature);

    // Calculate final stats applying stat stages
    let finalStats = [
        {stat:'atk', val:getModifiedStat( atkRaw, pokemon.boosts.atk, gen )},
        {stat:'def', val:getModifiedStat( defRaw, pokemon.boosts.def, gen )},
        {stat:'spa', val:getModifiedStat( spaRaw, pokemon.boosts.spa, gen )},
        {stat:'spd', val:getModifiedStat( spdRaw, pokemon.boosts.spd, gen )},
        {stat:'spe', val:getModifiedStat( speRaw, pokemon.boosts.spe, gen )}
    ];

    // Find the eligible stat
    // In case of a tie stats take priority in the given order:
    // -- Atk > Def > Spa > Spd > Spe
    let best = finalStats[0];
    for ( let stat = 1; stat < finalStats.length; ++stat ) {
        if ( finalStats[stat].val > best.val ) {
            best = finalStats[stat];
        }
    }

    return best;
}

export function calcModifiedDefenseStat( gen: Generation, pokemon: Pokemon, defEV: number) {
    return getModifiedStat(
        Stats.calcStatADV( gen.natures, 'def', pokemon.species.baseStats.def, pokemon.ivs.def, defEV, pokemon.level, pokemon.nature),
        pokemon.boosts.def,
        gen );
}
export function calcModifiedSpDefenseStat( gen: Generation, pokemon: Pokemon, spdEV: number) {
    return getModifiedStat(
        Stats.calcStatADV( gen.natures, 'spd', pokemon.species.baseStats.spd, pokemon.ivs.spd, spdEV, pokemon.level, pokemon.nature),
        pokemon.boosts.spd,
        gen );
}

export function findDefEvPQThreshold( gen: Generation, pokemon: Pokemon, bestStat : BestStat ) {
    // If the best stat is defense, it was calculated with the initial EV - return that
    if ( bestStat.stat == 'def' ) {
        return {statEV: pokemon.evs.def, statVal: bestStat.val };
    }
    // Now calculate every step of defense EVs until we find the first stat value that would become PQ boosted
    // If none is found, there is no Def PQ threshold
    else {
        // If the best stat is 'atk' then defense must be strictly higher
        if ( bestStat.stat == 'atk') {
            
            for ( let defEV = pokemon.evs.def; defEV <= 252; defEV = defEV - (defEV%4) + 4 ) {
                let defStat = getModifiedStat(
                    Stats.calcStatADV( gen.natures, 'def', pokemon.species.baseStats.def, pokemon.ivs.def, defEV, pokemon.level, pokemon.nature),
                    pokemon.boosts.def,
                    gen );
                if ( defStat > bestStat.val ) {
                    return {statEV:defEV,statVal:defStat};
                }
            }
        }
        // If the best stat is any other stat, then defense must be higher or equal to the best stat
        else {
            for ( let defEV = pokemon.evs.def; defEV <= 252; defEV = defEV - (defEV%4) + 4 ) {
                let defStat = getModifiedStat(
                    Stats.calcStatADV( gen.natures, 'def', pokemon.species.baseStats.def, pokemon.ivs.def, defEV, pokemon.level, pokemon.nature),
                    pokemon.boosts.def,
                    gen );
                if ( defStat >= bestStat.val ) {
                    return {statEV:defEV,statVal:defStat};
                }
            }
        }
    }
    return undefined;
}

export function findSpdEvPQThreshold( gen: Generation, pokemon: Pokemon, bestStat : BestStat ) {
    // If the best stat is defense, it was calculated with the initial EV - return that
    if ( bestStat.stat == 'spd' ) {
        return {statEV: pokemon.evs.spd, statVal: bestStat.val };
    }
    // Now calculate every step of defense EVs until we find the first stat value that would become PQ boosted
    // If none is found, there is no SpD PQ threshold
    else {
        // If the best stat is 'spe' then spdef must be higher or equal
        if ( bestStat.stat == 'spe') {
            
            for ( let spdEV = pokemon.evs.spd; spdEV <= 252; spdEV = spdEV - (spdEV%4) + 4 ) {
                let spdStat = getModifiedStat(
                    Stats.calcStatADV( gen.natures, 'spd', pokemon.species.baseStats.spd, pokemon.ivs.spd, spdEV, pokemon.level, pokemon.nature),
                    pokemon.boosts.spd,
                    gen );
                if ( spdStat >= bestStat.val ) {
                    return {statEV:spdEV,statVal:spdStat};
                }
            }
        }
        // If the best stat is any other stat, then spdef must be strictly higher than the best stat
        else {
            for ( let spdEV = pokemon.evs.spd; spdEV <= 252; spdEV = spdEV - (spdEV%4) + 4 ) {
                let spdStat = getModifiedStat(
                    Stats.calcStatADV( gen.natures, 'spd', pokemon.species.baseStats.spd, pokemon.ivs.spd, spdEV, pokemon.level, pokemon.nature),
                    pokemon.boosts.spd,
                    gen );
                if ( spdStat > bestStat.val ) {
                    return {statEV:spdEV,statVal:spdStat};
                }
            }
        }
    }
    return undefined;
}

export function getMinimumOutspeedEV(targetSpeed: number, gen: Generation, pokemon: Pokemon, field: Field, side: Side ) {
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
export function recalcRawStat(gen: Generation, pokemon: Pokemon, stat: StatID ) {
    pokemon.rawStats[stat] = pokemon.stats[stat] = Stats.calcStatADV(gen.natures, stat, pokemon.species.baseStats[stat], pokemon.ivs[stat], pokemon.evs[stat], pokemon.level, pokemon.nature);
}

/**
 * Get the highest base stat out of the subset of stats desired. Do not set all stats to false!
 * @param baseStats Base stats of the pokemon
 * @param hp Include HP in the comparison?
 * @param atk Include Atk in the comparison?
 * @param def Include Def in the comparison?
 * @param spa Include SpA in the comparison?
 * @param spd Include SpD in the comparison?
 * @param spe Include Spe in the comparison?
 * @returns The highest base stat from the group.
 */
export function getHighestBaseStat( baseStats: StatsTable<number>, hp: boolean, atk: boolean, def: boolean, spa: boolean, spd: boolean, spe: boolean ) {
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

/**
 * Get the lowest base stat out of the subset of stats desired. Do not set all stats to false!
 * @param baseStats Base stats of the pokemon
 * @param hp Include HP in the comparison?
 * @param atk Include Atk in the comparison?
 * @param def Include Def in the comparison?
 * @param spa Include SpA in the comparison?
 * @param spd Include SpD in the comparison?
 * @param spe Include Spe in the comparison?
 * @returns The lowest base stat from the group.
 */
export function getLowestBaseStat( baseStats: StatsTable<number>, hp: boolean, atk: boolean, def: boolean, spa: boolean, spd: boolean, spe: boolean ) {
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

export function selectDefensiveNaturePreference( pokemon: Pokemon, isHighestHitPhysical: boolean, hasPhysicalDamage: boolean, hasSpecialDamage: boolean, pref: DefensiveNaturePreference) {
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

export function selectSpeedNaturePreference( pokemon: Pokemon, pref: DefensiveNaturePreference) {
    let raisedStat = 'spe';
    let loweredStat = '';
    switch (pref) {
        case DefensiveNaturePreference.HinderLowestOfAtkSpa:
            loweredStat = getLowestBaseStat( pokemon.species.baseStats, false, true, false, true, false, false );
            break;
        case DefensiveNaturePreference.HinderOnlyAtk:
            loweredStat = 'atk';
            break;
        case DefensiveNaturePreference.HinderOnlySpa:
            loweredStat = 'spa';
            break;
        default: loweredStat = 'atk';
    }

    return getNatureFromStats( raisedStat, loweredStat );
}

//function calcStatValue( base: number, iv: number, ev: number,  )


/*
      let mods: [StatID?, StatID?] = [undefined, undefined];
      if (nature) {
        const nat = natures.get(toID(nature));
        mods = [nat?.plus, nat?.minus];
      }
      const n =
        mods[0] === stat && mods[1] === stat
          ? 1
          : mods[0] === stat
            ? 1.1
            : mods[1] === stat
              ? 0.9
              : 1;
*/