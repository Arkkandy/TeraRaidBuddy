import { Generation, NatureName } from '../smogon-calc/data/interface';
import { StatsTable, Pokemon, Move, Field, Result, calculate } from '../smogon-calc';
import { RankingParameters } from './searchparameters';
import { EVSpread, calcModifiedDefenseStat, calcModifiedSpDefenseStat, findDefEvPQThreshold, findSpdEvPQThreshold, getHighestStat_PQ, selectDefensiveNaturePreference } from './util';
import { DefenseStatOptimizerPQ } from './statoptimizationpq';
import { recalculateFinalDamage } from './fastdamage';


/** Optimal Defensive Threshold (Proto/Quark)
 * --------------------------
 * Find the most efficient EV spread to meet maximum defensive threshold for defenders with enabled Protoynthesis / Quark Drive.
 * This EV spread is the minimum defensive investment needed to reach the best defensive threshold,
 * where the threshold is directly given by the number of consecutive turns the Pokemon can survive
 * to the given set of moves if being consistently targeted by the hardest hitting move.
*/
export default function getOptimalDefensiveThreshold_PQ( gen: Generation, raidBoss: Pokemon, raidDefender: Pokemon, moves: Move[], field: Field, useGivenNature: boolean, parameters: RankingParameters) : EVSpread {
    let finalEVSpread: StatsTable<number> = (raidDefender.evs ? raidDefender.evs : {hp:0,atk:0,def:0,spa:0,spd:0,spe:0});

    // Set neutral nature for most accurate predictions
    let noAbilityDefender = raidDefender.clone();
    if ( !useGivenNature ) {
        noAbilityDefender.nature = "Hardy";
    }
    noAbilityDefender.ability = undefined;

    // Perform preliminary damage check for each move
    let preResults : Result[] = [];
    let eligibleIndices : number[] = [];
    for ( let i = 0; i < moves.length; ++i ) {
        let move = moves[i];
        let result = calculate(gen, raidBoss, noAbilityDefender, move, field );
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
        // Fixed damage move
        if ( preResults[moveIndex].rawDesc.fixedDamageValue ) {
            if ( moveDamage > highestFixedMoveDamage ) {
                highestFixedMoveDamage = moveDamage;
            }
        }
        // Regular damaging move
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
        noAbilityDefender.nature = selectDefensiveNaturePreference( noAbilityDefender, isHighestHitPhysical, physMoves.length>0, specMoves.length>0, parameters.mainparams.defNaturePreferencePQ ) as NatureName;
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
        physMoves.forEach( moveIndex => 
            physResults.push( calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
        specMoves.forEach( moveIndex => 
            specResults.push( calculate(gen, raidBoss, noAbilityDefender, moves[moveIndex], field ))
        );
    }

    // Setup nodes with all possible EV values / damage for the top-hitting moves
    // -- Keep only nodes with new damage values, in the format (EV, Damage)
    // -- For categories with multiple moves: Damage = Max(Damage1,Damage2,..)
    let optimizer : DefenseStatOptimizerPQ = new DefenseStatOptimizerPQ();

    // Setup Def nodes
    if ( physResults.length == 0 ) {
        let defStat = calcModifiedDefenseStat(gen, noAbilityDefender, noAbilityDefender.evs.def );
        optimizer.addDefNode( finalEVSpread.def, defStat, highestFixedMoveDamage );
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
        optimizer.addSpDNode( finalEVSpread.spd, spdStat, highestFixedMoveDamage );
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
            let physResultsPQ : Result[] = [];
            abilityDefender.evs.def = defThresholdEV.statEV;
            physMoves.forEach( moveIndex => 
                physResultsPQ.push( calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let defEV = defThresholdEV.statEV; defEV <= 252; defEV = defEV - (defEV%4)+4 ) {
                let maxDamage = highestFixedMoveDamage;
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
            let specResultsPQ : Result[] = [];
            abilityDefender.evs.spd = spdThresholdEV.statEV;
            specMoves.forEach( moveIndex => 
                specResultsPQ.push( calculate(gen, raidBoss, abilityDefender, moves[moveIndex], field ))
            );

            let previousDamageTaken = Number.POSITIVE_INFINITY;
            for ( let spdEV = spdThresholdEV.statEV; spdEV <= 252; spdEV = spdEV - (spdEV%4)+4 ) {
                let maxDamage = highestFixedMoveDamage;
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