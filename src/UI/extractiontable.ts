import { ExtraAction } from "../presets/raidpreset";
import { Pokemon, toID } from "../smogon-calc";
import { Generation } from "../smogon-calc/data/interface";
import { colorBossInfoMove, createTableBodyCell, setTypeColor } from "./util";


export function showExtraActions( gen: Generation, actions: ExtraAction[] | undefined, table: HTMLTableElement, moveUser?: Pokemon ) {
    // Clear previous contents
    let actiontbody = table.tBodies[0];
    actiontbody.innerHTML = "";
  
    if ( actions ) {
      actions.forEach( (action) => {
        let actionRow = actiontbody.insertRow();  
        let actionDesc = createTableBodyCell( actionRow, action.description, 1);
        if ( action.description.startsWith("Move:")) {
          let move = gen.moves.get( toID(action.description.slice(6)));
          if ( move ) {
            if ( move.name == 'Tera Blast' && moveUser != undefined ) {
              if ( moveUser.teraType ) {
                setTypeColor( actionDesc, moveUser.teraType );
              }
              else {
                setTypeColor( actionDesc, move.type );
              }
            }
            setTypeColor( actionDesc, move.type );
            actionDesc.textContent = move.name;
          }
          else {
            actionDesc.style.paddingLeft = "8px";
          }
        }
        else {
          actionDesc.style.paddingLeft = "8px";
          actionDesc.style.backgroundColor = "white";
        }
  
        // HP
        let hpCell = createTableBodyCell( actionRow, action.hp ? action.hp.toString() : "-", 1 );
        hpCell.style.textAlign = 'center';
        hpCell.style.backgroundColor = "white";
  
        // TIME
        let timeCell = createTableBodyCell( actionRow, action.time ? action.time.toString() : "-", 1 );
        timeCell.style.textAlign = 'center';
        timeCell.style.backgroundColor = "white";
      });
    }
    else {
      let defaultRow = actiontbody.insertRow();
      createTableBodyCell( defaultRow, "No extra actions", 3 ).style.textAlign = 'center';
    }
  }