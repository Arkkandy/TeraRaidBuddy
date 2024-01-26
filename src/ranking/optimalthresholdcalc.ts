import { Generation, NatureName } from '../smogon-calc/data/interface';
import { StatsTable, Pokemon, Move, Field, Result, calculate } from '../smogon-calc';
import { RankingParameters } from './searchparameters';
import { EVSpread, selectDefensiveNaturePreference } from './util';
import { DefenseStatOptimizer } from './statoptimization';
import { recalculateFinalDamage } from './fastdamage';

/** Optimal Defensive Threshold
 * --------------------------
 * Find the best EV spread to meet the maximum defensive threshold the raid defender Pokemon can invest into.
 * This EV spread is the minimum defensive investment needed to reach the best defensive threshold,
 * where the threshold is directly given by the number of consecutive turns the Pokemon can survive
 * to the given set of moves if being consistently targeted by the hardest hitting move.
*/
export default function getOptimalDefensiveThresholdSpread( gen: Generation, raidBoss: Pokemon, raidDefender: Pokemon, moves: Move[], field: Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    if (!useGivenNature) {
        raidDefender.nature = "Hardy";
    }

    // Perform preliminary damage check for each move
    let preResults : Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = calculate(gen, raidBoss, raidDefender, move, field );
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
    let highestFixedMoveDamage: number = 0;
    let highestPhysHit : number = 0;
    let highestSpecHit : number = 0;
    let highestHit : number = 0;
    let isHighestHitPhysical : boolean = false;
    eligibleIndices.forEach( moveIndex => {
        const moveDamage = preResults[moveIndex].range()[1];
        if ( preResults[moveIndex].rawDesc.fixedDamageValue ) {
            if ( moveDamage > highestFixedMoveDamage ) {
                highestFixedMoveDamage = moveDamage;
            }
        }
        else {
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
        }
    });

    // Predict best defensive nature based on the hardest hitting move
    if ( !useGivenNature ) {
        raidDefender.nature = selectDefensiveNaturePreference( raidDefender, isHighestHitPhysical, physMoves.length>0, specMoves.length>0, parameters.search.defNaturePreferenceNonPQ ) as NatureName;
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
    let physResults : Result[] = [];
    let specResults : Result[] = [];
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
            physResults.push( calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( calculate(gen, raidBoss, raidDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizer = new DefenseStatOptimizer();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        optimizer.addDefNode( finalEVSpread.def, highestFixedMoveDamage );
    }
    else {
        let initialDefEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextDefEV = initialDefEV;
        do {
            let maxDamage = highestFixedMoveDamage;
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
        optimizer.addSpDNode( finalEVSpread.spd, highestFixedMoveDamage );
    }
    else {
        let initialSpdEV = finalEVSpread.def;

        let previousDamageTaken = Number.POSITIVE_INFINITY;
        // Do not assume what value DefEV might have.
        // We'll use the initial value as is, next value is the closest multiple of 4 and so on.
        let nextSpdEV = initialSpdEV;
        do {
            let maxDamage = highestFixedMoveDamage;
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