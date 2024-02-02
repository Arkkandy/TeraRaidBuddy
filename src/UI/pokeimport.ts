import { FilterDataEntry, filteringData } from "../ranking/filteringdata";
import { toID } from "../smogon-calc";
import { Generation } from "../smogon-calc/data/interface";
import UIElements from "./uielements";
import { AbilitySelectionMode, RaidPresetMode } from "./uilogic";

import * as UIRaidBoss from "./uiraidboss"


export class SimplifiedBossData {
    public bossName? : string;
    public item? : string;
    public level? : string;
    public nature? : string;
    public teraType? : string;
    public ability? : string;
    public evs? : {stat:string, val:string}[];
    public ivs? : {stat:string, val:string}[];
    public mainMoves? : string[];
    public extraMoves? : string[];
}

export function ExportBossData( currentPresetMode : RaidPresetMode, abilityMode : AbilitySelectionMode ) {
    // Boss Name
    let bossName = UIRaidBoss.retrieveSelectedBossSpecies( currentPresetMode );

    // Item
    let item = UIElements.RaidBoss.BossHeldItem.value;

    // Level
    let level = UIElements.RaidBoss.BossLevel.value;

    // Nature
    let nature = UIElements.RaidBoss.BossNature.value;

    // Tera Type
    let teraType = UIElements.RaidBoss.BossTeraType.value;

    // Ability
    let ability = UIRaidBoss.readBossSelectedAbility( abilityMode );
    
    // EVs
    let evs : string[] = [];
    let evValues = [ {stat:'HP', val:UIElements.RaidBoss.BossHPEV.value},
        {stat:'Atk', val:UIElements.RaidBoss.BossAtkEV.value},
        {stat:'Def', val:UIElements.RaidBoss.BossDefEV.value},
        {stat:'SpA', val:UIElements.RaidBoss.BossSpaEV.value},
        {stat:'SpD', val:UIElements.RaidBoss.BossSpdEV.value},
        {stat:'Spe', val:UIElements.RaidBoss.BossSpeEV.value}, ];

    evValues.forEach( (ev) => {
        if ( ev.val != "0" ) {
            evs.push(ev.val + " " + ev.stat);
        }
    });

    // IVs
    let ivs : string[] = [];
    let ivValues = [ {stat:'HP', val:UIElements.RaidBoss.BossHPIV.value},
        {stat:'Atk', val:UIElements.RaidBoss.BossAtkIV.value},
        {stat:'Def', val:UIElements.RaidBoss.BossDefIV.value},
        {stat:'SpA', val:UIElements.RaidBoss.BossSpaIV.value},
        {stat:'SpD', val:UIElements.RaidBoss.BossSpdIV.value},
        {stat:'Spe', val:UIElements.RaidBoss.BossSpeIV.value}, ];

    ivValues.forEach( (iv) => {
        if ( iv.val != "31" ) {
            ivs.push(iv.val + " " + iv.stat);
        }
    });

    // Moves
    let mainMoves : string[] = [];
    if ( UIElements.RaidBoss.BossMove1.value != "(No Move)" ) {
        mainMoves.push( UIElements.RaidBoss.BossMove1.value);
    }
    if ( UIElements.RaidBoss.BossMove2.value != "(No Move)" ) {
        mainMoves.push( UIElements.RaidBoss.BossMove2.value);
    }
    if ( UIElements.RaidBoss.BossMove3.value != "(No Move)" ) {
        mainMoves.push( UIElements.RaidBoss.BossMove3.value);
    }
    if ( UIElements.RaidBoss.BossMove4.value != "(No Move)" ) {
        mainMoves.push( UIElements.RaidBoss.BossMove4.value);
    }

    // Extra Moves
    let extraMoves : string[] = [];
    if ( UIElements.RaidBoss.BossAddMove1.value != "(No Move)" ) {
        extraMoves.push( UIElements.RaidBoss.BossAddMove1.value);
    }
    if ( UIElements.RaidBoss.BossAddMove2.value != "(No Move)" ) {
        extraMoves.push( UIElements.RaidBoss.BossAddMove2.value);
    }
    if ( UIElements.RaidBoss.BossAddMove3.value != "(No Move)" ) {
        extraMoves.push( UIElements.RaidBoss.BossAddMove3.value);
    }
    if ( UIElements.RaidBoss.BossAddMove4.value != "(No Move)" ) {
        extraMoves.push( UIElements.RaidBoss.BossAddMove4.value);
    }

    // Convert all to string
    let bossData = "";
    bossData += bossName;
    if ( item != "" ) {
        bossData += " @ " + item;
    }
    bossData += '\n';

    bossData += "Level: " + level + "\n";

    bossData += nature + " Nature\n";

    if ( teraType != "" ) {
        bossData += "Tera Type: " + teraType + "\n";
    }

    bossData += "Ability: " + ability + "\n";

    if ( evs.length > 0 ) {
        bossData += "EVs: " + evs.join(" / ") + "\n";
    }

    if ( ivs.length > 0 ) {
        bossData += "IVs: " + ivs.join(" / ") + "\n";
    }

    mainMoves.forEach( (moveName) => {
        bossData +=  "- " + moveName + "\n";
    });

    if ( extraMoves.length > 0 ) {
        bossData += "Extra\n";

        extraMoves.forEach( (moveName) => {
            bossData +=  "- " + moveName + "\n";
        });
    }

    // Paste into text area
    UIElements.RaidBoss.ExportTextContent.value = bossData;
}


export function ReadBossData( bossData : string ) : SimplifiedBossData {
 
    let lines = bossData.split('\n');

    let data = new SimplifiedBossData();

    // Read data from string
    let readMainMoves = true;
    if ( lines.length > 0 ) {
        // Read boss name [optionally read item]
        let line1 = lines[0].split(' @ ');

        if ( line1.length == 1 ) {
            data.bossName = line1[0];
        }
        else if ( line1.length == 2 ) {
            data.bossName = line1[0];
            data.item = line1[1];
        }

        for ( let i = 1; i < lines.length; ++i ) {
            let line = lines[i];

            if ( line.startsWith("Level: ")) {
                let elements = line.split(": ");
                if ( elements.length == 2 ) {
                    data.level = elements[1];
                }
            }
            else if ( line.endsWith("Nature")) {
                let elements = line.split(" ");
                if ( elements.length == 2 ) {
                    data.nature = elements[0];
                }
            }
            else if ( line.startsWith("Tera Type: ")) {
                let elements = line.split(": ");
                if ( elements.length == 2 ) {
                    data.teraType = elements[1];
                }
            }
            else if ( line.startsWith("Ability: ")) {
                let elements = line.split(": ");
                if ( elements.length == 2 ) {
                    data.ability = elements[1];
                }
            }
            else if ( line.startsWith("EVs: ")) {
                let evcontent = line.substring(5).split(" / ");
                evcontent.forEach( (s) => {
                    let statSplit = s.split(" ");
                    if ( statSplit.length == 2 ) {
                        let value = statSplit[0];
                        let stat = statSplit[1];

                        if (  data.evs == undefined ) {
                            data.evs = [];
                        }

                        data.evs.push( {stat:stat, val:value} );
                    }
                });
            }
            else if ( line.startsWith("IVs: ")) {
                let ivcontent = line.substring(5).split(" / ");
                ivcontent.forEach( (s) => {
                    let statSplit = s.split(" ");
                    if ( statSplit.length == 2 ) {
                        let value = statSplit[0];
                        let stat = statSplit[1];

                        if (  data.ivs == undefined ) {
                            data.ivs = [];
                        }

                        data.ivs.push( {stat:stat, val:value} );
                    }
                });
            }
            else if ( line.startsWith("Extra")) {
                readMainMoves = false;
            }
            else if ( line.startsWith("- ")) {
                if ( readMainMoves ) {
                    if ( data.mainMoves == undefined ) { data.mainMoves = []; }
                    data.mainMoves.push( line.substring(2));
                }
                else {
                    if ( data.extraMoves == undefined ) { data.extraMoves = []; }
                    data.extraMoves.push( line.substring(2));
                }
            }
        }
    }

    return data;
}

export function VerifyBossData( gen: Generation, bossData : SimplifiedBossData ) : boolean {
    // Check if given boss name is valid
    let dataEntry : FilterDataEntry | undefined = undefined;
   
    // Read boss name
    if ( bossData.bossName != undefined ) {
        dataEntry = filteringData.find( (entry) => {
            return entry.name == bossData.bossName;
        });
    }
    if ( dataEntry == undefined ) {
        throw "Wrong boss name or missing.";
    }

    // Item [Optional]
    if ( bossData.item != undefined ) {
        if ( gen.items.get( toID( bossData.item )) == undefined ) {
            throw "Wrong item name.";
        }
    }

    // Level
    if ( bossData.level != undefined ) {
        if (bossData.level.match(/[^$,.\d]/)) {
            throw 'Malformed level value.';
        }
        let level = parseInt( bossData.level );
        if ( Number.isNaN( level ) ) {
            throw "Malformed level value.";
        }
        if ( level < 1 || level > 100 ) {
            throw "Level out of bounds.";
        }
    }
    else {
        throw "Level required -> Level: #";
    }

    // Nature
    if ( bossData.nature != undefined ) {
        if ( gen.natures.get( toID( bossData.nature )) == undefined ) {
            throw "Wrong nature";
        }
    }
    else {
        throw "Missing nature";
    }

    // Tera Type [Optional]
    if ( bossData.teraType != undefined ) {
        if ( ( bossData.teraType == '???' )|| gen.types.get( toID( bossData.teraType )) == undefined ) {
            throw "Wrong Tera Type";
        }
    }

    // Ability [Optional]
    if ( bossData.ability != undefined ) {
        if ( gen.abilities.get( toID( bossData.ability )) == undefined ) {
            throw "Wrong ability";
        }
    }

    // EVs [Optional]
    if ( bossData.evs != undefined ) {
        bossData.evs.forEach( (s) => {
            let statName = s.stat.toLowerCase();
            if ( statName != "hp" && statName != "atk" && statName != "def" && statName != "spa" && statName != "spd" && statName != "spe") {
                throw "Wrong EV stat name -> hp | atk | def | spa | spd | spe";
            }
            if (s.val.match(/[^$,.\d]/)) {
                throw 'Malformed EV value.';
            }
            let evValue = parseInt( s.val );
            if ( Number.isNaN( evValue ) ) {
                throw "Malformed EV value.";
            }
            if ( evValue < 0 || evValue > 252 ) {
                throw "EV value out of bounds -> [0-252] ";
            }
        });
    }

    // IVs [Optional]
    if ( bossData.ivs != undefined ) {
        let ivsValid = true;
        bossData.ivs.forEach( (s) => {
            let statName = s.stat.toLowerCase();
            if ( statName != "hp" && statName != "atk" && statName != "def" && statName != "spa" && statName != "spd" && statName != "spe") {
                throw "Wrong IV stat name -> hp | atk | def | spa | spd | spe";
            }
            if (s.val.match(/[^$,.\d]/)) {
                throw 'Malformed IV value.';
            }
            let ivValue = parseInt( s.val );
            if ( Number.isNaN( ivValue ) ) {
                throw "Malformed IV value.";
            }
            if ( ivValue < 0 || ivValue > 31 ) {
                throw "IV value out of bounds -> [0-31] ";
            }
        });
    }

    // Moves [Optional]
    if ( bossData.mainMoves != undefined ) {
        for ( let m = 0; m < bossData.mainMoves.length; ++m ) {
            if ( gen.moves.get( toID( bossData.mainMoves[m]) ) == undefined) {
                throw `Wrong main move -> ${bossData.mainMoves[m]}`;
            }
        }
    }

    // Extra Moves [Optional]
    if ( bossData.extraMoves != undefined ) {
        for ( let m = 0; m < bossData.extraMoves.length; ++m ) {
            if ( gen.moves.get( toID( bossData.extraMoves[m]) ) == undefined) {
                throw `Wrong extra move -> ${bossData.extraMoves[m]}`;
            }
        }
    }

    return true;
}

export function ImportBossData( gen: Generation, bossData : SimplifiedBossData ) {
    // Get boss entry
    let dataEntry = filteringData.find( (entry) => {
        entry.name == bossData.bossName;
    })!;

    UIElements.RaidBoss.CustomSelect.value = bossData.bossName!;

    if ( bossData.item ) {
        UIElements.RaidBoss.BossHeldItem.value = bossData.item;
    }

    UIElements.RaidBoss.BossLevel.value = bossData.level!;
    UIElements.RaidBoss.BossNature.value = bossData.nature!;

    if ( bossData.teraType ) {
        UIElements.RaidBoss.BossTeraType.value = bossData.teraType;
    }
    else {
        UIElements.RaidBoss.BossTeraType.value = "";
    }

    if ( bossData.ability ) {
        UIElements.RaidBoss.BossAllAbilitiesSelect.value = bossData.ability;
    }

    // EVs
    if ( bossData.evs ) {
        bossData.evs.forEach( (s) => {
            let statName = s.stat.toLowerCase();
            if ( statName == "hp" ) {
                UIElements.RaidBoss.BossHPEV.value = s.val;
            }
            else if ( statName == "atk" ) {
                UIElements.RaidBoss.BossAtkEV.value = s.val;
            }
            else if ( statName == "def" ) {
                UIElements.RaidBoss.BossDefEV.value = s.val;
            }
            else if ( statName == "spa" ) {
                UIElements.RaidBoss.BossSpaEV.value = s.val;
            }
            else if ( statName == "spd" ) {
                UIElements.RaidBoss.BossSpdEV.value = s.val;
            }
            else if ( statName == "spe" ) {
                UIElements.RaidBoss.BossSpeEV.value = s.val;
            }
        });
    }

    // IVs
    if ( bossData.ivs ) {
        bossData.ivs.forEach( (s) => {
            let statName = s.stat.toLowerCase();
            if ( statName == "hp" ) {
                UIElements.RaidBoss.BossHPIV.value = s.val;
            }
            else if ( statName == "atk" ) {
                UIElements.RaidBoss.BossAtkIV.value = s.val;
            }
            else if ( statName == "def" ) {
                UIElements.RaidBoss.BossDefIV.value = s.val;
            }
            else if ( statName == "spa" ) {
                UIElements.RaidBoss.BossSpaIV.value = s.val;
            }
            else if ( statName == "spd" ) {
                UIElements.RaidBoss.BossSpdIV.value = s.val;
            }
            else if ( statName == "spe" ) {
                UIElements.RaidBoss.BossSpeIV.value = s.val;
            }
        });
    }

    // Main Moves
    if ( bossData.mainMoves ) {
        if ( bossData.mainMoves.length > 0 ) {
            UIElements.RaidBoss.BossMove1.value = bossData.mainMoves[0];
            if ( bossData.mainMoves.length > 1 ) {
                UIElements.RaidBoss.BossMove2.value = bossData.mainMoves[1];
            }
            else {
                UIElements.RaidBoss.BossMove2.value = "(No Move)";    
            }
            if ( bossData.mainMoves.length > 2 ) {
                UIElements.RaidBoss.BossMove3.value = bossData.mainMoves[2];
            }
            else {
                UIElements.RaidBoss.BossMove3.value = "(No Move)";    
            }
            if ( bossData.mainMoves.length > 3 ) {
                UIElements.RaidBoss.BossMove4.value = bossData.mainMoves[3];
            }
            else {
                UIElements.RaidBoss.BossMove4.value = "(No Move)";
            }
        }
        else {
            UIElements.RaidBoss.BossMove1.value = "(No Move)";
            UIElements.RaidBoss.BossMove2.value = "(No Move)";
            UIElements.RaidBoss.BossMove3.value = "(No Move)";
            UIElements.RaidBoss.BossMove4.value = "(No Move)";
        }
    }
    else {
        UIElements.RaidBoss.BossMove1.value = "(No Move)";
        UIElements.RaidBoss.BossMove2.value = "(No Move)";
        UIElements.RaidBoss.BossMove3.value = "(No Move)";
        UIElements.RaidBoss.BossMove4.value = "(No Move)";
    }

    // Extra Moves
    if ( bossData.extraMoves ) {
        if ( bossData.extraMoves.length > 0 ) {
            UIElements.RaidBoss.BossAddMove1.value = bossData.extraMoves[0];
            if ( bossData.extraMoves.length > 1 ) {
                UIElements.RaidBoss.BossAddMove2.value = bossData.extraMoves[1];
            }
            else {
                UIElements.RaidBoss.BossAddMove2.value = "(No Move)";    
            }
            if ( bossData.extraMoves.length > 2 ) {
                UIElements.RaidBoss.BossAddMove3.value = bossData.extraMoves[2];
            }
            else {
                UIElements.RaidBoss.BossAddMove3.value = "(No Move)";    
            }
            if ( bossData.extraMoves.length > 3 ) {
                UIElements.RaidBoss.BossAddMove4.value = bossData.extraMoves[3];
            }
            else {
                UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
            }
        }
        else {
            UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
            UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
            UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
            UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
        }
    }
    else {
        UIElements.RaidBoss.BossAddMove1.value = "(No Move)";
        UIElements.RaidBoss.BossAddMove2.value = "(No Move)";
        UIElements.RaidBoss.BossAddMove3.value = "(No Move)";
        UIElements.RaidBoss.BossAddMove4.value = "(No Move)";
    }
}