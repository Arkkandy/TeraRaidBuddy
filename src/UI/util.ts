//import { TypeName } from "@smogon/calc/dist/data/interface";

import { Move, Pokemon, StatsTable } from "../smogon-calc";
import { NatureName } from "../smogon-calc/data/interface";

/* Return hiperlink type A for species data lookup.
   Hyperlink is returned as a HTML element in string format.
*/
export function getLookupLinkA( species : string ) {
    // Hyperlink
    let speciesName : string = "";
    if ( species == 'Ho-Oh' || species == 'Ting-Lu' || species == 'Chien-Pao' || species == 'Chi-Yu' || species == 'Wo-Chien' || species == 'Porygon-Z' ||
    species == "Jangmo-o" || species == "Hakamo-o" || species == "Kommo-o") {
        speciesName = species;
    }
    else {
        speciesName = species.split('-')[0];
    }    
    return `<a href="https://bulbapedia.bulbagarden.net/wiki/${speciesName}_(Pokémon)">${species}</a>`;
}


// Populate various <select> dropdown elements
export function populateDropdown( select: HTMLSelectElement, options: string[] ) : void {
    options.forEach(element => {
        const newOption = document.createElement('option');
        newOption.value = element;
        newOption.text = element;
        select.add(newOption);
    });
}

export function setTypeColor(cell: HTMLElement, type: string ) : void {
    if ( type == 'Normal') {
        cell.classList.add('normal-type');
    }
    else if ( type == 'Fighting') {
        cell.classList.add('fighting-type');
    }
    else if ( type == 'Flying') {
        cell.classList.add('flying-type');
    }
    else if ( type == 'Poison') {
        cell.classList.add('poison-type');
    }
    else if ( type == 'Ground') {
        cell.classList.add('ground-type');
    }
    else if ( type == 'Rock') {
        cell.classList.add('rock-type');
    }
    else if ( type == 'Bug') {
        cell.classList.add('bug-type');
    }
    else if ( type == 'Ghost') {
        cell.classList.add('ghost-type');
    }
    else if ( type == 'Steel') {
        cell.classList.add('steel-type');
    }
    else if ( type == 'Fire') {
        cell.classList.add('fire-type');
    }
    else if ( type == 'Water') {
        cell.classList.add('water-type');
    }
    else if ( type == 'Grass') {
        cell.classList.add('grass-type');
    }
    else if ( type == 'Electric') {
        cell.classList.add('electric-type');
    }
    else if ( type == 'Psychic') {
        cell.classList.add('psychic-type');
    }
    else if ( type == 'Ice') {
        cell.classList.add('ice-type');
    }
    else if ( type == 'Dragon') {
        cell.classList.add('dragon-type');
    }
    else if ( type == 'Dark') {
        cell.classList.add('dark-type');
    }
    else if ( type == 'Fairy') {
        cell.classList.add('fairy-type');
    }
    else if ( type == 'Stellar') {
        cell.classList.add('stellar-type');
    }
}
export function setTypeBackgroundColor(cell: HTMLElement, type: string ) : void {
    if ( type == 'Normal') {
        cell.classList.add('normal-bgbanner');
    }
    else if ( type == 'Fighting') {
        cell.classList.add('fighting-bgbanner');
    }
    else if ( type == 'Flying') {
        cell.classList.add('flying-bgbanner');
    }
    else if ( type == 'Poison') {
        cell.classList.add('poison-bgbanner');
    }
    else if ( type == 'Ground') {
        cell.classList.add('ground-bgbanner');
    }
    else if ( type == 'Rock') {
        cell.classList.add('rock-bgbanner');
    }
    else if ( type == 'Bug') {
        cell.classList.add('bug-bgbanner');
    }
    else if ( type == 'Ghost') {
        cell.classList.add('ghost-bgbanner');
    }
    else if ( type == 'Steel') {
        cell.classList.add('steel-bgbanner');
    }
    else if ( type == 'Fire') {
        cell.classList.add('fire-bgbanner');
    }
    else if ( type == 'Water') {
        cell.classList.add('water-bgbanner');
    }
    else if ( type == 'Grass') {
        cell.classList.add('grass-bgbanner');
    }
    else if ( type == 'Electric') {
        cell.classList.add('electric-bgbanner');
    }
    else if ( type == 'Psychic') {
        cell.classList.add('psychic-bgbanner');
    }
    else if ( type == 'Ice') {
        cell.classList.add('ice-bgbanner');
    }
    else if ( type == 'Dragon') {
        cell.classList.add('dragon-bgbanner');
    }
    else if ( type == 'Dark') {
        cell.classList.add('dark-bgbanner');
    }
    else if ( type == 'Fairy') {
        cell.classList.add('fairy-bgbanner');
    }
    else if ( type == 'Stellar') {
        cell.classList.add('stellar-bgbanner');
    }
}
export function clearTypeColoring( element: HTMLElement ) {
    element.classList.forEach( className => {
      if ( className.includes('-type')) {
        element.classList.remove(className);
      }
    });
}

export function clearTypeBackground( element: HTMLElement ) {
    element.classList.forEach( className => {
      if ( className.includes('-bgbanner')) {
        element.classList.remove(className);
      }
    });
}



export function stringFromEVSpread(nature: string, evspread: StatsTable<number> ) {
    let spread: string = nature;

    if ( evspread.hp > 0 ) {
        spread += ', ' + evspread.hp.toString() + " HP";
    }
    if ( evspread.atk > 0 ) {
        spread += ', ' + evspread.atk.toString() + " Atk";
    }
    if ( evspread.def > 0 ) {
        spread += ', ' + evspread.def.toString() + " Def";
    }
    if ( evspread.spa > 0 ) {
        spread += ', ' + evspread.spa.toString() + " SpA";
    }
    if ( evspread.spd > 0 ) {
        spread += ', ' + evspread.spd.toString() + " SpD";
    }
    if ( evspread.spe > 0 ) {
        spread += ', ' + evspread.spe.toString() + " Spe";
    }

    return spread;
}

export function setDamageBackgroundColor(cell: HTMLTableCellElement, damage: number ) : void {
    if ( damage <= 0) {
        cell.classList.add('result-no-damage');
    }
    else if ( damage < 16) {
        cell.classList.add('result-very-low-damage');
    }
    else if ( damage < 25) {
        cell.classList.add('result-low-damage');
    }
    else if ( damage < 33.3) {
        cell.classList.add('result-ok-damage');
    }
    else if ( damage < 50) {
        cell.classList.add('result-high-damage');
    }
    else if ( damage < 66.6) {
        cell.classList.add('result-very-high-damage');
    }
    else {
        cell.classList.add('result-extreme-damage');
    }
}

export function setValidBackgroundColor(cell: HTMLTableCellElement, state: boolean ) : void {
    if ( state ) {
        cell.classList.add('result-valid');
    }
    else {
        cell.classList.add('result-invalid');
    }
}


export function getImagePath(pokeName: string) {
    let path = "assets/sprites/";
    let extension = ".png";
    return path + pokeName.toLowerCase() + extension;
}


/**
 * Create a new header cell for the given header row.
 * @param headRow Header row to append new cell
 * @param content Text content given to the cell
 * @param colSpan Cell column span
 * @returns The newly created cell is returned.
 */
export function createTableHeadCell( headRow: HTMLTableRowElement, content: string, colSpan: number = 1 ) {
    const newHeadCell = document.createElement('th');
    newHeadCell.colSpan = colSpan;
    newHeadCell.textContent = content;
  
    headRow.appendChild(newHeadCell);
  
    return newHeadCell;
  }

/**
 * Create a new table cell for the given table body row.
 * @param bodyRow Body row to append new cell
 * @param content Text content given to the cell
 * @param colSpan Cell column span
 * @returns The newly created cell is returned.
 */
export function createTableBodyCell( bodyRow: HTMLTableRowElement, content: string, colSpan: number = 1 ) {
    const newBodyCell = document.createElement('td');
    newBodyCell.colSpan = colSpan;
    newBodyCell.textContent = content;
  
    bodyRow.appendChild(newBodyCell);
  
    return newBodyCell;
  }


export function colorBossInfoMove( moveElement: HTMLElement, move: Move, boss: Pokemon ) {
// Set background color matching the type
if ( move.name == "Tera Blast") {
    setTypeColor( moveElement, boss.teraType! );
}
else {
    setTypeColor( moveElement, move.type );
}
}