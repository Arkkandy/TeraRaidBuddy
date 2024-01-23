import { Stats } from "../smogon-calc/stats";
import { findBestHPEV_Threshold } from "./util";

class DefenseNodeSimple {
    public ev: number = 0;
    public damage: number = 0;
}

export class DefenseSpreadNode {
    public defEV: number;
    public spdEV: number;
    public hpEV: number;
    public hpPercent: number;

    constructor( defEV: number, spdEV : number, hpEV : number, hpPercent: number ) {
        this.defEV = defEV;
        this.spdEV = spdEV;
        this.hpEV = hpEV;
        this.hpPercent = hpPercent;
    }

    public getTotalEVInvestment() : number {
        return this.defEV + this.spdEV + this.hpEV;
    }
}

export class DefenseStatOptimizer {
    // #DEBUG: Nodes should be private
    public defNodes : DefenseNodeSimple[] = [];
    public spdNodes : DefenseNodeSimple[] = [];
    
    constructor() {
    }

    public addDefNode( defEV: number, dmg: number ) {
        this.defNodes.push( {ev: defEV, damage: dmg});
    }

    public addSpDNode( spdEV: number, dmg: number ) {
        this.spdNodes.push( {ev: spdEV, damage: dmg});
    }

    // Pair nodes => (DefEV, SpdEV, hpPercent)
    // Test-allocate HP
    // Find best node
    // #TODO: Find a fast way to cull nodes

    public findBestCombination(baseHP: number, HPIV: number, HPMinimumEV: number, evAllocationLimit: number, level: number) {
        // EVs can really have any value since there is always at least one node for each defense stat, and positive infinity ensures a better one is always picked.
        let bestNode : DefenseSpreadNode = new DefenseSpreadNode( this.defNodes[0].ev, this.spdNodes[0].ev, HPMinimumEV, Number.POSITIVE_INFINITY );

        // Take into account any initial investment in defenses
        let initialInvestment = this.defNodes[0].ev + this.spdNodes[0].ev;

        this.defNodes.forEach( defNode => 
            this.spdNodes.forEach( spdNode => {
                let evsAllocated = (defNode.ev + spdNode.ev) - initialInvestment;
                if ( evsAllocated <= evAllocationLimit ) {
                    // Test-allocate as much HP as possible
                    let hpEV = HPMinimumEV + Math.min(evAllocationLimit-evsAllocated, 252-HPMinimumEV );
                    // Adjust HP EV to be a multiple of 4 and clear out extra EVs. Except if the minimum EV isn't a multiple of 4.
                    hpEV = Math.max( hpEV - (hpEV%4), HPMinimumEV);

                    let hpStat = ( baseHP === 1 ? 
                        baseHP :
                        Math.floor(((baseHP * 2 + HPIV + Math.floor(hpEV / 4)) * level) / 100) + level + 10);

                    let maxDamage = Math.max( defNode.damage, spdNode.damage );

                    let hpPercent = maxDamage/hpStat;
                    // If the new node has better overall defenses, set it as best node
                    if ( hpPercent < bestNode.hpPercent ) {
                        bestNode = new DefenseSpreadNode( defNode.ev, spdNode.ev, hpEV, hpPercent );
                    }
                    // If the previous node and current node have the same damage percent --
                    else if ( hpPercent == bestNode.hpPercent ) {
                        // Keep the one that has the least investment
                        let candidateNode = new DefenseSpreadNode( defNode.ev, spdNode.ev, hpEV, hpPercent );
                        if ( candidateNode.getTotalEVInvestment() < bestNode.getTotalEVInvestment() ) {
                            bestNode = candidateNode;
                        }
                    }
                }
            })
        );

        return bestNode;
    }

    public findBestThresholdCombination(baseHP: number, HPIV: number, minHPEV: number, evAllocationLimit: number, level: number) {
        // Default best node = zero investment
        let bestNode : DefenseSpreadNode = new DefenseSpreadNode( this.defNodes[0].ev, this.spdNodes[0].ev, minHPEV, Number.POSITIVE_INFINITY );
        let bestThreshold : number = 0;

        // Take into account any initial investment in defenses
        let initialInvestment = this.defNodes[0].ev + this.spdNodes[0].ev;

        // Loop from the highest nodes to maximize the number of nodes skipped (? does this really matter)
        this.defNodes.forEach( defNode =>
            this.spdNodes.forEach( spdNode => {
                let evsAllocated = (defNode.ev + spdNode.ev) - initialInvestment;
                if ( evsAllocated <= evAllocationLimit ) {
                    // Test-allocate as much HP as possible
                    let maxHpEV = minHPEV + Math.min(evAllocationLimit-evsAllocated, 252-minHPEV );
                    // Adjust HP EV to be a multiple of 4 and clear out extra EVs. Except if the minimum EV isn't a multiple of 4.
                    maxHpEV = Math.max( maxHpEV - (maxHpEV%4), minHPEV);
                    
                    // Find minimum HP stat and worst threshold
                    let minHPStat = ( baseHP === 1 ? 
                        baseHP :
                        Math.floor(((baseHP * 2 + HPIV + Math.floor(minHPEV / 4)) * level) / 100) + level + 10);

                    // Find max HP investment and best threshold
                    let maxHpStat = ( baseHP === 1 ? 
                        baseHP :
                        Math.floor(((baseHP * 2 + HPIV + Math.floor(maxHpEV / 4)) * level) / 100) + level + 10);

                    let maxDamage = Math.max( defNode.damage, spdNode.damage );

                    let worstHpPercent = maxDamage / minHPStat;
                    let bestHpPercent = maxDamage / maxHpStat;
                    
                    let minThreshold = Math.floor( 1 / worstHpPercent );
                    let maxThreshold = Math.floor( 1 / bestHpPercent );

                    // We only analyze the node if the max threshold is greater than 0, since we already have minimum possible investment
                    if ( maxThreshold > 0 ) {
                        // If max threshold at least the same, we'll further analyze the node
                        if ( maxThreshold >= bestThreshold ) {
                            // #TODO: Find best hp investment
                            let bestHPEV = minHPEV;
                            // If there is a threshold change, find the lowest HP EV to meet the max threshold
                            if ( minThreshold != maxThreshold ) {
                                // Find best EV
                                let targetHP = maxDamage * maxThreshold;
                                bestHPEV = findBestHPEV_Threshold( baseHP, HPIV, minHPEV, maxHpEV, maxDamage * maxThreshold, level );
                            }
                            // If min threshold is the same as max threshold, there's no need to invest in HP
                            else {
                                // Check the corner case where minHPEV is exactly on the threshold
                                // Return the next EV value to be exactly above the threshold, if possible
                                // #TODO: For levels lower than 100 it may not be the case that the correct EV is +4 from minimum
                                if ( minHPStat === (maxDamage * maxThreshold)) {
                                    bestHPEV = Math.min( minHPEV + 4, maxHpEV );
                                }
                            }

                            // Calc the candidate node
                            let bestHPStat = ( baseHP === 1 ? 
                                baseHP :
                                Math.floor(((baseHP * 2 + HPIV + Math.floor(bestHPEV / 4)) * level) / 100) + level + 10);
                            let bestHpPercent = maxDamage / bestHPStat;
                            let candidateNode = new DefenseSpreadNode( defNode.ev, spdNode.ev, bestHPEV, bestHpPercent );
                            // If the max threshold is better than the registered node, immediately replace
                            if ( maxThreshold > bestThreshold ) {
                                bestNode = candidateNode;
                                bestThreshold = maxThreshold;
                            }
                            // Otherwise
                            else if ( maxThreshold == bestThreshold ) {
                                // If the new candidate reaches the threshold with more efficient investment, we take that
                                if ( candidateNode.getTotalEVInvestment() < bestNode.getTotalEVInvestment() ) {
                                        bestNode = candidateNode;
                                        bestThreshold = maxThreshold;
                                    }
                                }
                            }
                        }
                        // Else, if max threshold is worse than the best threshold, go next
                    }
                    // Else, not enough EVs to invest
                }
            )
        );
        return bestNode;
    }
}
