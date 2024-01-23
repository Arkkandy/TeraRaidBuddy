import { DefenseSpreadNode } from "./statoptimization";
import { findBestHPEV_Threshold } from "./util";


class DefenseNodeExtended {
    public ev: number;
    public stat: number;
    public damage: number;

    constructor(ev: number, stat: number, damage: number) {
        this.ev = ev;
        this.stat = stat;
        this.damage = damage;
    }
}

class DefenseNodePQ {
    public damageValue : number;
    public entries : {ev:number,stat:number}[] = [];

    constructor( damageValue: number ) {
        this.damageValue = damageValue;
    }

    public addEVStatEntry(ev:number, stat:number) {
        this.entries.push({ev:ev, stat:stat});
    }

    /** Return the minimum EV necessary to reach this node */
    public getMinimumEV() {
        return this.entries[0].ev;
    }
    /** Return the stat value associated with the minimum EV in this node */
	public getMinimumStat() {
        return this.entries[0].stat;
    }
    /** Return the maximum EV necessary to reach this node */
	public getMaximumEV() {
        return this.entries[this.entries.length-1].ev;
    }
    /** Return the stat value associated with the maximum EV in this node */
	public getMaximumStat() {
        return this.entries[this.entries.length-1].stat;
    }

    /** Minimum compatible Def EV for the given SpD stat. The respective defense stat has the first value equal to or higher than the given SpD stat.
     */
    public findMinimumCompatibleDefEV( spdStat: number ) {
        // Quick check: spdStat must be lower or equal to the maximum def stat in this node to be compatible
        if ( spdStat <= this.getMaximumStat()) {
            // Once that's settled, search all entries from lowest to highest stat and return the first EV to meet the criteria
            for ( let e = 0; e < this.entries.length; ++e ) {
                let entry = this.entries[e];
                if ( spdStat <= entry.stat ) {
                    return entry.ev;
                }
            }
        }
        return undefined;
    }

    /** Minimum compatible SpD EV for the given Def stat. The respective spdef stat has the first value strictly higher than the given Def stat.
     */
	public findMinimumCompatibleSpDEV( defStat: number ) {
        // Quick check: defStat must be lower than the maximum spd stat in this node to be compatible
        if ( defStat < this.getMaximumStat()) {
            // Once that's settled, search all entries from lowest to highest stat and return the first EV to meet the criteria
            for ( let e = 0; e < this.entries.length; ++e ) {
                let entry = this.entries[e];
                if ( defStat < entry.stat ) {
                    return entry.ev;
                }
            }
        }
        return undefined;
    }
}

export class DefenseStatOptimizerPQ {
    // #TODO #DEBUG: Node should be private
    public defNodes: DefenseNodeExtended[] = [];
    public spdNodes: DefenseNodeExtended[] = [];
    public defNodesPQ: DefenseNodePQ[] = [];
    public spdNodesPQ: DefenseNodePQ[] = [];

    public getDefPQThresholdEV() {
        if ( this.defNodesPQ.length > 0 ) {
            return this.defNodesPQ[0].entries[0].ev;
        }
        return Number.POSITIVE_INFINITY;
    }

    public getSpDPQThresholdEV() {
        if ( this.spdNodesPQ.length > 0 ) {
            return this.spdNodesPQ[0].entries[0].ev;
        }
        return Number.POSITIVE_INFINITY;
    }

    public addDefNode( ev: number, stat: number, damage: number) {
        this.defNodes.push( new DefenseNodeExtended(ev, stat, damage ));
    }
    public addSpDNode( ev: number, stat: number, damage: number) {
        this.spdNodes.push( new DefenseNodeExtended(ev, stat, damage ));
    }

    public addDefNodePQ( ev: number, stat: number, damage: number) {
        this.defNodesPQ.push( new DefenseNodePQ( damage ));
        this.increaseDefNodePQRange( ev, stat );
    }
    public addSpDNodePQ( ev: number, stat: number, damage: number) {
        this.spdNodesPQ.push( new DefenseNodePQ( damage ));
        this.increaseSpDNodePQRange( ev, stat );
    }

    public increaseDefNodePQRange( ev: number, stat: number ) {
        this.defNodesPQ[this.defNodesPQ.length-1].addEVStatEntry( ev, stat );
    }

    public increaseSpDNodePQRange( ev: number, stat: number ) {
        this.spdNodesPQ[this.spdNodesPQ.length-1].addEVStatEntry( ev, stat );
    }

    private findCompatibleDefPQEV( spdStat: number ) {
        // Compatible Def ev can only be found IF there are any PQ nodes
        if ( this.defNodesPQ.length > 0 ) {
            // And if the given SpD stat is within the range of values of all the nodes
            let firstNode = this.defNodesPQ[0];
            let lastNode = this.defNodesPQ[this.defNodesPQ.length-1];
            if ( firstNode.getMinimumStat() <= spdStat && spdStat <= lastNode.getMaximumStat() ) {
                for ( let i = 0; i < this.defNodesPQ.length; ++i ) {
                    let currentNode = this.defNodesPQ[i];
                    let result = currentNode.findMinimumCompatibleDefEV( spdStat );
                    if ( result != undefined ) {
                        return result;
                    }
                }
            }
        }
        return undefined;
    }
    
    private findCompatibleSpDPQEV( defStat: number ) {
        // Compatible SpD ev can only be found IF there are any PQ nodes
        if ( this.spdNodesPQ.length > 0 ) {
            // And if the given Def stat is within the range of values of all the nodes
            let firstNode = this.spdNodesPQ[0];
            let lastNode = this.spdNodesPQ[this.spdNodesPQ.length-1];
            if ( (firstNode.getMinimumStat()-1) <= defStat && defStat <= (lastNode.getMaximumStat()-1) ) {
                for ( let i = 0; i < this.spdNodesPQ.length; ++i ) {
                    let currentNode = this.spdNodesPQ[i];
                    let result = currentNode.findMinimumCompatibleSpDEV( defStat );
                    if ( result != undefined ) {
                        return result;
                    }
                }
            }
        }
        return undefined;
    }

    // #TODO: Use 'evAllocationLimit' to cull pairs
    private findPairs( evAllocationLimit: number) {
        let defThresholdEV = this.getDefPQThresholdEV();
        let spdThresholdEV =  this.getSpDPQThresholdEV();

        /*console.log('Def PQ Threshold: %d', defThresholdEV );
        console.log('SpD PQ Threshold: %d', spdThresholdEV );*/

        let pairs: {defEV: number, spdEV: number, damage: number}[] = [];

        // 1 - Match pairs of non boosted defense and non boosted special defense
        for ( let dI = 0; dI < this.defNodes.length; ++dI ) {
            let defNode = this.defNodes[dI];
            if ( defNode.ev < defThresholdEV)  {
                for ( let sI = 0; sI < this.spdNodes.length; ++sI ) {
                    let spdNode = this.spdNodes[sI];
                    if ( spdNode.ev < spdThresholdEV ) {
                        pairs.push( {defEV:defNode.ev, spdEV:spdNode.ev, damage:Math.max(defNode.damage,spdNode.damage)});
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                break;
            }
        }

        // 2 - Match pairs of boosted defense and non boosted special defense
        for ( let dI = 0; dI < this.defNodesPQ.length; ++dI ) {
            let defNodePQ = this.defNodesPQ[dI];
            for ( let sI = 0; sI < this.spdNodes.length; ++sI ) {
                let spdNode = this.spdNodes[sI];

                // If SpD is <= to this node's minimum defense stat, we add the pair
                if ( spdNode.stat <= defNodePQ.getMinimumStat() ) {
                    pairs.push( {defEV:defNodePQ.getMinimumEV(), spdEV:spdNode.ev, damage:Math.max(defNodePQ.damageValue,spdNode.damage)});
                }
                // Otherwise try to find a compatible defense value
                else {
                    let compatibleDefEV = defNodePQ.findMinimumCompatibleDefEV( spdNode.stat );
                    if ( compatibleDefEV != undefined ) {
                        pairs.push( {defEV:compatibleDefEV, spdEV:spdNode.ev, damage:Math.max(defNodePQ.damageValue,spdNode.damage)} );
                    }
                }
            }
        }

        // 3 - Match pairs of unboosted defense and boosted special defense
        for ( let sI = 0; sI < this.spdNodesPQ.length; ++sI ) {
            let spdNodePQ = this.spdNodesPQ[sI];
            for ( let dI = 0; dI < this.defNodes.length; ++dI ) {
                let defNode = this.defNodes[dI];

                // If Def is < this node's minimum sp defense stat, add the pair
                if ( defNode.stat < spdNodePQ.getMinimumStat() ) {
                    pairs.push( { defEV:defNode.ev, spdEV:spdNodePQ.getMinimumEV(), damage: Math.max(defNode.damage, spdNodePQ.damageValue)} );
                }
                // Otherwise try to find a compatible special defense value
                else {
                    let compatibleSpDEV = spdNodePQ.findMinimumCompatibleSpDEV( defNode.stat );
                    // If a compatible specia ldefense EV is found, add the pair
                    if ( compatibleSpDEV != undefined ) {
                        pairs.push( {defEV:defNode.ev, spdEV: compatibleSpDEV, damage: Math.max(defNode.damage, spdNodePQ.damageValue)} );
                    }
                }
            }
        }

        // #DEBUG: Log values
        /*console.log('Pairings');
        pairs.forEach( pairing => {
            console.log('DefEV: %d   SpdEV: %d', pairing.defEV, pairing.spdEV );
        });*/

        return pairs;
    }

    public findBestSpread(baseHP: number, HPIV: number, HPMinimumEV: number, evAllocationLimit: number, level: number) {
        let evPairings = this.findPairs(evAllocationLimit);

        // EVs can really have any value since there is always at least one node for each defense stat, and positive infinity ensures a better one is always picked.
        let bestNode : DefenseSpreadNode = new DefenseSpreadNode( this.defNodes[0].ev, this.spdNodes[0].ev, HPMinimumEV, Number.POSITIVE_INFINITY );

        // Take into account any initial investment in defenses
        let initialInvestment = this.defNodes[0].ev + this.spdNodes[0].ev;

        evPairings.forEach( pairing => {
            let evsAllocated = (pairing.defEV + pairing.spdEV) - initialInvestment;
            if ( evsAllocated <= evAllocationLimit ) {
                // Test-allocate as much HP as possible
                let hpEV = HPMinimumEV + Math.min(evAllocationLimit-evsAllocated, 252-HPMinimumEV );
                // Adjust HP EV to be a multiple of 4 and clear out extra EVs. Except if the minimum EV isn't a multiple of 4.
                hpEV = Math.max( hpEV - (hpEV%4), HPMinimumEV);

                let hpStat = ( baseHP === 1 ? 
                    baseHP :
                    Math.floor(((baseHP * 2 + HPIV + Math.floor(hpEV / 4)) * level) / 100) + level + 10);

                let hpPercent = pairing.damage/hpStat;
                // If the new node has better overall defenses, set it as best node
                if ( hpPercent < bestNode.hpPercent ) {
                    bestNode = new DefenseSpreadNode( pairing.defEV, pairing.spdEV, hpEV, hpPercent );
                }
                // If the previous node and current node have the same damage percent --
                else if ( hpPercent == bestNode.hpPercent ) {
                    // Keep the one that has the least investment
                    let candidateNode = new DefenseSpreadNode( pairing.defEV, pairing.spdEV, hpEV, hpPercent );
                    if ( candidateNode.getTotalEVInvestment() < bestNode.getTotalEVInvestment() ) {
                        bestNode = candidateNode;
                    }
                }
            }
        });

        return bestNode;
    }

    public findBestThreshold(baseHP: number, HPIV: number, minHPEV: number, evAllocationLimit: number, level: number) {
        let evPairings = this.findPairs(evAllocationLimit);

        // Default best node = zero investment
        let bestNode : DefenseSpreadNode = new DefenseSpreadNode( this.defNodes[0].ev, this.spdNodes[0].ev, minHPEV, Number.POSITIVE_INFINITY );
        let bestThreshold : number = 0;

        // Take into account any initial investment in defenses
        let initialInvestment = this.defNodes[0].ev + this.spdNodes[0].ev;

        // Loop from the highest nodes to maximize the number of nodes skipped (? does this really matter)
        evPairings.forEach( pairing => {
            let evsAllocated = (pairing.defEV + pairing.spdEV) - initialInvestment;
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

                let maxDamage = pairing.damage;

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
                        let candidateNode = new DefenseSpreadNode( pairing.defEV, pairing.spdEV, bestHPEV, bestHpPercent );

                        // #DEBUG
                        //console.log('HP:%d, Def:%d, SpD:%d (%d) | Dmg:%d HP:%d (\%:%d) VS CurrentBest:%d', bestHPEV, pairing.defEV, pairing.spdEV, candidateNode.getTotalEVInvestment(), pairing.damage, bestHPStat, bestHpPercent, bestNode.hpPercent );

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
        });

        return bestNode;
    }

}