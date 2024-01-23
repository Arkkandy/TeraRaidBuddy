
export class ExtraAction {
    public description: string;
    public hp?: number;
    public time?: number;

    constructor( description: string, hp?: number, time?: number) {
        this.description = description;
        this.hp = hp;
        this.time = time;
    }
}

export class RaidBossPreset {
    public readonly speciesName: string;
    public readonly level: number;
    public readonly ability: string;
    public readonly teraType?: string;
    public readonly nature?: string;
    public readonly item?: string;

    public readonly mainMoves: string[];
    public readonly addMoves?: string[];

    public readonly extraActions?: ExtraAction[];

    constructor( speciesName: string, level: number, ability: string, mainMoves: string[], addMoves?: string[], teraType?: string, nature?:string, item?: string, extraActions?: ExtraAction[] ) {
        this.speciesName = speciesName;
        this.level = level;
        this.ability = ability;
        this.mainMoves = mainMoves;
        this.addMoves = addMoves;
        this.teraType = teraType;
        this.nature = nature;
        this.item = item;
        this.extraActions = extraActions;
    }
}



export let tier7EventRaidBossPresets: RaidBossPreset[] = [
    { speciesName: "Greninja", level: 100, ability: "Protean", mainMoves: ["Gunk Shot", "Night Slash", "Hydro Pump", "Ice Beam"], addMoves: ["Toxic Spikes", "Double Team"], teraType: "Poison", nature: "Sassy" },
    { speciesName: "Pikachu", level: 100, ability: "Lightning Rod", mainMoves: ["Thunder", "Surf", "Play Rough", "Iron Tail"], addMoves: ["Rain Dance"], teraType: "Water", nature: "Quiet", item: 'Light Ball' },
    { speciesName: "Samurott", level: 100, ability: "Shell Armor", mainMoves: ["Aqua Cutter", "Megahorn", "Night Slash", "Drill Run"], addMoves: ["Focus Energy", "Swords Dance", "Bulldoze"], teraType: "Bug", nature: "Lonely" },
    { speciesName: "Samurott-Hisui", level: 100, ability: "Sharpness", mainMoves: ["Razor Shell", "Ceaseless Edge", "X-Scissor", "Sacred Sword"], addMoves: ["Focus Energy", "Swords Dance", "Bulldoze"], teraType: "Water", nature: "Adamant" },
    { speciesName: "Iron Bundle", level: 100, ability: "Quark Drive", mainMoves: ["Freeze-Dry", "Hydro Pump", "Blizzard", "Chilling Water"], addMoves: ["Snowscape", "Aurora Veil", "Electric Terrain"], teraType: "Ice", nature: "Modest"}, // HP x30
    { speciesName: "Blaziken", level: 100, ability: "Speed Boost", mainMoves: ["Brave Bird", "Blaze Kick", "Low Kick", "Earthquake"], addMoves: ["Bulk Up", "Swords Dance", "Overheat", "Rock Slide" ], teraType: "Flying", nature: "Adamant", extraActions: [ {description: "Swords Dance", time:90}, {description: "Player Stat Reset", hp: 90 } ] }

];



export let tier5EventRaidBossPresets: RaidBossPreset[] = [
    { speciesName: "Blissey", level: 75, ability: "Natural Cure", mainMoves: ["Heal Pulse", "Last Resort", "Soft-Boiled", "Seismic Toss"], teraType: "Normal" },
    { speciesName: "Dialga", level: 75, ability: "Telepathy", mainMoves: ["Draco Meteor", "Earth Power", "Fire Blast", "Steel Beam"], addMoves: ["Toxic Spikes", "Double Team"], teraType: "Dragon", nature: "Quiet" },
    { speciesName: "Palkia", level: 75, ability: "Telepathy", mainMoves: ["Draco Meteor", "Thunder", "Fire Blast", "Hydro Pump"], addMoves: ["Rain Dance"], teraType: "Dragon", nature: "Modest" },
    { speciesName: "Iron Leaves", level: 75, ability: "Quark Drive", mainMoves: ["Psyblade", "Leaf Blade", "Megahorn", "Swords Dance"], addMoves: ["Electric Terrain","Psyblade"], teraType: "Psychic" },
    { speciesName: "Walking Wake", level: 75, ability: "Protosynthesis", mainMoves: ["Hydro Steam", "Dragon Pulse", "Flamethrower", "Noble Roar"], addMoves: ["Sunny Day","Hydro Steam"], teraType: "Water" },
];





export let T6Raids_Paldea: RaidBossPreset[] = [
    { speciesName: "Gengar", level: 90, ability: "Cursed Body", mainMoves: ["Shadow Ball", "Sludge Bomb", "Dazzling Gleam", "Will-O-Wisp"], addMoves: ["Hypnosis"], teraType: "Ghost" },
    { speciesName: "Tauros-Paldea-Combat", level: 90, ability: "Cud Chew", mainMoves: ["Close Combat", "Thrash", "Zen Headbutt", "Raging Bull"], addMoves: ["Bulk Up", "Screech"], teraType: "Fighting" },
    { speciesName: "Tauros-Paldea-Blaze", level: 90, ability: "Cud Chew", mainMoves: ["Flare Blitz", "Close Combat", "Flamethrower", "Headbutt"], addMoves: ["Sunny Day", "Bulk Up"], teraType: "Fighting" },
    { speciesName: "Tauros-Paldea-Aqua", level: 90, ability: "Cud Chew", mainMoves: ["Wave Crash", "Close Combat", "Surf", "Headbutt"], addMoves: ["Rain Dance", "Bulk Up"], teraType: "Fighting" },
    { speciesName: "Gyarados", level: 90, ability: "Moxie", mainMoves: ["Aqua Tail", "Crunch", "Hurricane", "Ice Fang"], addMoves: ["Taunt", "Dragon Dance"], teraType: "Water" },
    { speciesName: "Ditto", level: 90, ability: "Imposter", mainMoves: ["Transform"], teraType: "Normal" },
    { speciesName: "Vaporeon", level: 90, ability: "Hydration", mainMoves: ["Tera Blast", "Surf", "Hyper Voice", "Yawn"], addMoves: ["Rain Dance", "Calm Mind"], teraType: "Water" },
    { speciesName: "Jolteon", level: 90, ability: "Quick Feet", mainMoves: ["Tera Blast", "Thunderbolt", "Shadow Ball", "Thunder Wave"], addMoves: ["Electric Terrain", "Calm Mind"], teraType: "Electric" },
    { speciesName: "Flareon", level: 90, ability: "Guts", mainMoves: ["Tera Blast", "Flare Blitz", "Lava Plume", "Will-O-Wisp"], addMoves: ["Sunny Day", "Curse"], teraType: "Fire" },
    { speciesName: "Dragonite", level: 90, ability: "Multiscale", mainMoves: ["Dragon Rush", "Extreme Speed", "Dragon Dance", "Aqua Tail"], addMoves: ["Light Screen"], teraType: "Dragon" },
    { speciesName: "Espeon", level: 90, ability: "Magic Bounce", mainMoves: ["Tera Blast", "Psychic", "Psyshock", "Tickle"], addMoves: ["Psychic Terrain", "Calm Mind"], teraType: "Psychic" },
    { speciesName: "Umbreon", level: 90, ability: "Inner Focus", mainMoves: ["Tera Blast", "Dark Pulse", "Foul Play", "Tickle"], addMoves: ["Calm Mind", "Curse"], teraType: "Dark" },
    { speciesName: "Slowking", level: 90, ability: "Regenerator", mainMoves: ["Surf", "Psyshock", "Trick Room", "Flamethrower"], addMoves: ["Light Screen", "Rain Dance", "Calm Mind"], teraType: "Water" },
    { speciesName: "Scizor", level: 90, ability: "Light Metal", mainMoves: ["X-Scissor", "Bullet Punch", "Close Combat", "Iron Head"], addMoves: ["Iron Defense", "Focus Energy"], teraType: "Bug" },
    { speciesName: "Heracross", level: 90, ability: "Moxie", mainMoves: ["Megahorn", "Close Combat", "Thrash", "Leer"], addMoves: ["Bulk Up"], teraType: "Bug" },
    { speciesName: "Blissey", level: 90, ability: "Healer", mainMoves: ["Dazzling Gleam", "Hyper Voice", "Sing", "Light Screen"], addMoves: ["Defense Curl"], teraType: "Normal" },
    { speciesName: "Tyranitar", level: 90, ability: "Unnerve", mainMoves: ["Stone Edge", "Crunch", "Screech", "Rock Blast"], addMoves: ["Iron Defense"], teraType: "Rock" },
    { speciesName: "Pelipper", level: 90, ability: "Rain Dish", mainMoves: ["Hurricane", "Hydro Pump", "Mist", "Supersonic"], addMoves: ["Rain Dance", "Agility"], teraType: "Water" },
    { speciesName: "Gardevoir", level: 90, ability: "Telepathy", mainMoves: ["Moonblast", "Psychic", "Calm Mind", "Thunder Wave"], addMoves: ["Misty Terrain", "Psychic Terrain"], teraType: "Psychic" },
    { speciesName: "Breloom", level: 90, ability: "Technician", mainMoves: ["Bullet Seed", "Low Sweep", "Spore", "Aerial Ace"], addMoves: ["Grassy Terrain"], teraType: "Grass" },
    { speciesName: "Torkoal", level: 90, ability: "Shell Armor", mainMoves: ["Lava Plume", "Yawn", "Clear Smog", "Body Slam"], addMoves: ["Sunny Day", "Iron Defense"], teraType: "Fire" },
    { speciesName: "Salamence", level: 90, ability: "Moxie", mainMoves: ["Outrage", "Dual Wingbeat", "Flamethrower", "Tera Blast"], addMoves: ["Dragon Dance"], teraType: "Dragon" },
    { speciesName: "Staraptor", level: 90, ability: "Reckless", mainMoves: ["Close Combat", "Brave Bird", "Double-Edge", "Feather Dance"], teraType: "Normal" },
    { speciesName: "Garchomp", level: 90, ability: "Rough Skin", mainMoves: ["Outrage", "Earthquake", "Flamethrower", "Rock Slide"], addMoves: ["Swords Dance"], teraType: "Dragon" },
    { speciesName: "Hippowdon", level: 90, ability: "Sand Force", mainMoves: ["Earthquake", "Ice Fang", "Yawn", "Rock Slide"], teraType: "Ground" },
    { speciesName: "Magnezone", level: 90, ability: "Analytic", mainMoves: ["Thunder", "Flash Cannon", "Tri Attack", "Thunder Wave"], addMoves: ["Rain Dance", "Iron Defense", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Leafeon", level: 90, ability: "Chlorophyll", mainMoves: ["Tera Blast", "Leaf Blade", "Double Kick", "Charm"], addMoves: ["Sunny Day", "Swords Dance"], teraType: "Grass" },
    { speciesName: "Glaceon", level: 90, ability: "Ice Body", mainMoves: ["Tera Blast", "Ice Beam", "Blizzard", "Charm"], addMoves: ["Snowscape", "Calm Mind"], teraType: "Ice" },
    { speciesName: "Gallade", level: 90, ability: "Justified", mainMoves: ["Psycho Cut", "Close Combat", "Will-O-Wisp", "Aerial Ace"], addMoves: ["Hypnosis", "Disable", "Psychic Terrain"], teraType: "Psychic" },
    { speciesName: "Amoonguss", level: 90, ability: "Regenerator", mainMoves: ["Energy Ball", "Foul Play", "Spore", "Sludge Bomb"], addMoves: ["Grassy Terrain"], teraType: "Grass" },
    { speciesName: "Haxorus", level: 90, ability: "Unnerve", mainMoves: ["Outrage", "Crunch", "Giga Impact", "First Impression"], addMoves: ["Dragon Dance"], teraType: "Dragon" },
    { speciesName: "Hydreigon", level: 90, ability: "Levitate", mainMoves: ["Dark Pulse", "Dragon Pulse", "Crunch", "Taunt"], addMoves: ["Work Up", "Nasty Plot"], teraType: "Dark" },
    { speciesName: "Volcarona", level: 90, ability: "Swarm", mainMoves: ["Bug Buzz", "Flamethrower", "Hurricane", "Tailwind"], addMoves: ["Amnesia", "Sunny Day", "Light Screen", "Quiver Dance"], teraType: "Bug" },
    { speciesName: "Talonflame", level: 90, ability: "Gale Wings", mainMoves: ["Brave Bird", "Flare Blitz", "Flamethrower", "Tera Blast"], addMoves: ["Sunny Day", "Swords Dance"], teraType: "Fire" },
    { speciesName: "Dragalge", level: 90, ability: "Adaptability", mainMoves: ["Dragon Pulse", "Sludge Bomb", "Water Pulse", "Toxic"], addMoves: ["Acid Spray", "Draco Meteor"], teraType: "Poison" },
    { speciesName: "Clawitzer", level: 90, ability: "Mega Launcher", mainMoves: ["Water Pulse", "Dragon Pulse", "Aura Sphere", "Crabhammer"], addMoves: ["Rain Dance"], teraType: "Water" },
    { speciesName: "Sylveon", level: 90, ability: "Pixilate", mainMoves: ["Tera Blast", "Hyper Voice", "Moonblast", "Yawn"], addMoves: ["Misty Terrain", "Calm Mind"], teraType: "Fairy" },
    { speciesName: "Goodra", level: 90, ability: "Gooey", mainMoves: ["Dragon Pulse", "Surf", "Sludge Bomb", "Power Whip"], addMoves: ["Rain Dance"], teraType: "Dragon" },
    { speciesName: "Avalugg", level: 90, ability: "Sturdy", mainMoves: ["Icicle Crash", "Heavy Slam", "Snowscape", "Ice Spinner"], addMoves: ["Iron Defense"], teraType: "Ice" },
    { speciesName: "Lycanroc-Dusk", level: 90, ability: "Tough Claws", mainMoves: ["Accelerock", "Rock Slide", "Crunch", "Taunt"], addMoves: ["Sandstorm"], teraType: "Rock" },
    { speciesName: "Toxapex", level: 90, ability: "Regenerator", mainMoves: ["Water Pulse", "Liquidation", "Poison Jab", "Pin Missile"], addMoves: ["Chilling Water", "Toxic"], teraType: "Poison" },
    { speciesName: "Mimikyu", level: 90, ability: "Disguise", mainMoves: ["Play Rough", "Shadow Claw", "Shadow Sneak", "Wood Hammer"], addMoves: ["Misty Terrain", "Swords Dance"], teraType: "Ghost" },
    { speciesName: "Corviknight", level: 90, ability: "Mirror Armor", mainMoves: ["Iron Head", "Drill Peck", "Body Press", "Hone Claws"], addMoves: ["Tailwind"], teraType: "Flying" },
    { speciesName: "Pincurchin", level: 90, ability: "Electric Surge", mainMoves: ["Zing Zap", "Thunder", "Surf", "Poison Jab"], addMoves: ["Thunder Wave", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Frosmoth", level: 90, ability: "Ice Scales", mainMoves: ["Blizzard", "Bug Buzz", "Hurricane", "Snowscape"], teraType: "Ice" },
    { speciesName: "Dragapult", level: 90, ability: "Cursed Body", mainMoves: ["Shadow Ball", "Dragon Pulse", "Thunderbolt", "Flamethrower"], addMoves: ["Reflect", "Light Screen"], teraType: "Dragon" },
    { speciesName: "Pawmot", level: 90, ability: "Iron Fist", mainMoves: ["Wild Charge", "Close Combat", "Double Shock", "Nuzzle"], addMoves: ["Electric Terrain"], teraType: "Electric" },
    { speciesName: "Maushold-Four", level: 90, ability: "Technician", mainMoves: ["Play Rough", "Take Down", "Low Kick", "Charm"], addMoves: ["Tidy Up"], teraType: "Normal" },
    { speciesName: "Dachsbun", level: 90, ability: "Aroma Veil", mainMoves: ["Play Rough", "Double-Edge", "Bite", "Baby-Doll Eyes"], teraType: "Fairy" },
    { speciesName: "Garganacl", level: 90, ability: "Clear Body", mainMoves: ["Stone Edge", "Heavy Slam", "Salt Cure", "Hammer Arm"], addMoves: ["Sandstorm", "Rock Slide"], teraType: "Rock" },
    { speciesName: "Armarouge", level: 90, ability: "Weak Armor", mainMoves: ["Armor Cannon", "Psychic", "Night Shade", "Will-O-Wisp"], addMoves: ["Calm Mind", "Sunny Day"], teraType: "Fire" },
    { speciesName: "Ceruledge", level: 90, ability: "Weak Armor", mainMoves: ["Bitter Blade", "Shadow Claw", "Psycho Cut", "Will-O-Wisp"], addMoves: ["Sunny Day"], teraType: "Fire" },
    { speciesName: "Kilowattrel", level: 90, ability: "Competitive", mainMoves: ["Hurricane", "Thunder", "Uproar", "Scary Face"], addMoves: ["Charge", "Rain Dance"], teraType: "Electric" },
    { speciesName: "Mabosstiff", level: 90, ability: "Stakeout", mainMoves: ["Crunch", "Reversal", "Outrage", "Take Down"], addMoves: ["Taunt"], teraType: "Dark" },
    { speciesName: "Grafaiai", level: 90, ability: "Prankster", mainMoves: ["Knock Off", "Gunk Shot", "Take Down", "Flatter"], addMoves: ["Toxic"], teraType: "Poison" },
    { speciesName: "Toedscruel", level: 90, ability: "Mycelium Might", mainMoves: ["Energy Ball", "Earth Power", "Spore", "Hex"], addMoves: ["Grassy Terrain"], teraType: "Ground" },
    { speciesName: "Klawf", level: 90, ability: "Regenerator", mainMoves: ["Stone Edge", "Rock Smash", "X-Scissor", "Sandstorm"], addMoves: ["Knock Off", "Iron Defense"], teraType: "Rock" },
    { speciesName: "Tinkaton", level: 90, ability: "Pickpocket", mainMoves: ["Gigaton Hammer", "Play Rough", "Knock Off", "Thunder Wave"], addMoves: ["Misty Terrain", "Sweet Kiss"], teraType: "Fairy" },
    { speciesName: "Bombirdier", level: 90, ability: "Rocky Payload", mainMoves: ["Rock Slide", "Acrobatics", "Knock Off", "Feather Dance"], teraType: "Flying" },
    { speciesName: "Revavroom", level: 90, ability: "Filter", mainMoves: ["Gunk Shot", "Overheat", "Iron Head", "Taunt"], addMoves: ["Scary Face", "Shift Gear"], teraType: "Steel" },
    { speciesName: "Cyclizar", level: 90, ability: "Regenerator", mainMoves: ["Double-Edge", "Dragon Claw", "Dragon Pulse", "Knock Off"], addMoves: ["Shift Gear"], teraType: "Dragon" },
    { speciesName: "Orthworm", level: 90, ability: "Sand Veil", mainMoves: ["Iron Head", "Earthquake", "Smack Down", "Sandstorm"], addMoves: ["Coil"], teraType: "Steel" },
    { speciesName: "Glimmora", level: 90, ability: "Corrosion", mainMoves: ["Power Gem", "Sludge Wave", "Hyper Beam", "Rock Polish"], addMoves: ["Sandstorm"], teraType: "Rock" },
    { speciesName: "Cetitan", level: 90, ability: "Sheer Force", mainMoves: ["Ice Spinner", "Body Slam", "Snowscape", "Stomping Tantrum"], addMoves: ["Yawn"], teraType: "Ice" },
    { speciesName: "Dondozo", level: 90, ability: "Water Veil", mainMoves: ["Wave Crash", "Order Up", "Heavy Slam", "Yawn"], addMoves: ["Rain Dance", "Curse"], teraType: "Water" },
    { speciesName: "Annihilape", level: 90, ability: "Defiant", mainMoves: ["Close Combat", "Shadow Claw", "Assurance", "Focus Energy"], addMoves: ["Bulk Up", "Rage Fist"], teraType: "Fighting" },
    { speciesName: "Clodsire", level: 90, ability: "Unaware", mainMoves: ["Earthquake", "Poison Jab", "Megahorn", "Yawn"], teraType: "Poison" },
    { speciesName: "Farigiraf", level: 90, ability: "Sap Sipper", mainMoves: ["Twin Beam", "Hyper Voice", "Low Kick", "Uproar"], addMoves: ["Agility"], teraType: "Normal" },
    { speciesName: "Kingambit", level: 90, ability: "Pressure", mainMoves: ["Iron Head", "Night Slash", "Kowtow Cleave", "Thunder Wave"], addMoves: ["Swords Dance"], teraType: "Dark" },
    { speciesName: "Baxcalibur", level: 90, ability: "Ice Body", mainMoves: ["Icicle Spear", "Dragon Rush", "Snowscape", "Body Press"], teraType: "Dragon" }
];

export let T6Raids_TealMask: RaidBossPreset[] = [
    { speciesName: "Clefable", level: 90, ability: "Unaware", mainMoves: ["Moonblast", "Psychic", "Meteor Mash", "Encore"], addMoves: ["Dazzling Gleam", "Calm Mind"], teraType: "Fairy" },
    { speciesName: "Ninetales", level: 90, ability: "Drought", mainMoves: ["Flamethrower", "Extrasensory", "Will-O-Wisp", "Burning Jealousy"], addMoves: ["Heat Wave", "Sunny Day"], teraType: "Fire" },
    { speciesName: "Poliwrath", level: 90, ability: "Swift Swim", mainMoves: ["Brick Break", "Liquidation", "Focus Blast", "Haze"], addMoves: ["Rain Dance", "Bulk Up"], teraType: "Water" },
    { speciesName: "Golem", level: 90, ability: "Sand Veil", mainMoves: ["Earthquake", "Rock Slide", "Flail", "Smack Down"], addMoves: ["Stone Edge", "Iron Defense"], teraType: "Rock" },
    { speciesName: "Snorlax", level: 90, ability: "Gluttony", mainMoves: ["Facade", "Crunch", "Yawn", "Heavy Slam"], teraType: "Normal" },
    { speciesName: "Politoed", level: 90, ability: "Drizzle", mainMoves: ["Chilling Water", "Surf", "Ice Beam", "Encore"], addMoves: ["Amnesia"], teraType: "Water" },
    { speciesName: "Quagsire", level: 90, ability: "Unaware", mainMoves: ["Earthquake", "Liquidation", "Yawn", "Toxic"], addMoves: ["Curse", "Rain Dance"], teraType: "Water" },
    { speciesName: "Ludicolo", level: 90, ability: "Own Tempo", mainMoves: ["Energy Ball", "Hydro Pump", "Fake Out", "Chilling Water"], addMoves: ["Rain Dance", "Teeter Dance"], teraType: "Water" },
    { speciesName: "Shiftry", level: 90, ability: "Pickpocket", mainMoves: ["Leaf Blade", "Sucker Punch", "Fake Out", "Extrasensory"], addMoves: ["Sunny Day", "Trailblaze", "Swords Dance"], teraType: "Grass" },
    { speciesName: "Crawdaunt", level: 90, ability: "Adaptability", mainMoves: ["Aqua Jet", "Crabhammer", "Crunch", "Giga Impact"], addMoves: ["Leer", "Swords Dance"], teraType: "Water" },
    { speciesName: "Milotic", level: 90, ability: "Cute Charm", mainMoves: ["Dragon Pulse", "Water Pulse", "Safeguard", "Aqua Tail"], addMoves: ["Coil", "Hypnosis", "Rain Dance"], teraType: "Water" },
    { speciesName: "Ambipom", level: 90, ability: "Skill Link", mainMoves: ["Double Hit", "Ice Punch", "Fire Punch", "Thunder Punch"], addMoves: ["Screech"], teraType: "Normal" },
    { speciesName: "Yanmega", level: 90, ability: "Frisk", mainMoves: ["Bug Buzz", "Air Slash", "Quick Attack", "Ancient Power"], teraType: "Bug" },
    { speciesName: "Gliscor", level: 90, ability: "Poison Heal", mainMoves: ["Acrobatics", "Knock Off", "Quick Attack", "Earthquake"], addMoves: ["Sandstorm", "Swords Dance"], teraType: "Ground" },
    { speciesName: "Mamoswine", level: 90, ability: "Thick Fat", mainMoves: ["Icicle Crash", "Ice Shard", "Bulldoze", "Freeze-Dry"], addMoves: ["Snowscape", "Amnesia", "Earthquake"], teraType: "Ice" },
    { speciesName: "Dusknoir", level: 90, ability: "Frisk", mainMoves: ["Poltergeist", "Dark Pulse", "Will-O-Wisp", "Ice Punch"], addMoves: ["Gravity", "Spite"], teraType: "Ghost" },
    { speciesName: "Conkeldurr", level: 90, ability: "Iron Fist", mainMoves: ["Rock Slide", "Close Combat", "Mach Punch", "Slam"], addMoves: ["Bulk Up"], teraType: "Fighting" },
    { speciesName: "Leavanny", level: 90, ability: "Overcoat", mainMoves: ["Leaf Blade", "X-Scissor", "Grassy Glide", "Sticky Web"], addMoves: ["Grassy Terrain", "Swords Dance"], teraType: "Bug" },
    { speciesName: "Chandelure", level: 90, ability: "Infiltrator", mainMoves: ["Flamethrower", "Shadow Ball", "Will-O-Wisp", "Poltergeist"], addMoves: ["Heat Wave", "Sunny Day"], teraType: "Ghost" },
    { speciesName: "Mienshao", level: 90, ability: "Reckless", mainMoves: ["Aerial Ace", "Brick Break", "Aura Sphere", "Reversal"], addMoves: ["Calm Mind"], teraType: "Fighting" },
    { speciesName: "Mandibuzz", level: 90, ability: "Weak Armor", mainMoves: ["Dual Wingbeat", "Dark Pulse", "Toxic", "Bone Rush"], addMoves: ["Snarl"], teraType: "Dark" },
    { speciesName: "Trevenant", level: 90, ability: "Harvest", mainMoves: ["Wood Hammer", "Shadow Claw", "Forest's Curse", "Will-O-Wisp"], addMoves: ["Grassy Terrain", "Disable"], teraType: "Ghost" },
    { speciesName: "Kommo-o", level: 90, ability: "Overcoat", mainMoves: ["Focus Blast", "Dragon Claw", "Iron Head", "Scary Face"], addMoves: ["Clangorous Soul", "Reversal"], teraType: "Dragon" },
    { speciesName: "Morpeko", level: 90, ability: "Hunger Switch", mainMoves: ["Aura Wheel", "Lash Out", "Thunder Wave", "Torment"], addMoves: ["Taunt", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Basculegion", level: 90, ability: "Mold Breaker", mainMoves: ["Wave Crash", "Aqua Jet", "Crunch", "Scary Face"], addMoves: ["Icy Wind", "Rain Dance"], teraType: "Water" },
    { speciesName: "Basculegion-F", level: 90, ability: "Mold Breaker", mainMoves: ["Surf", "Aqua Jet", "Shadow Ball", "Scary Face"], addMoves: ["Icy Wind", "Rain Dance"], teraType: "Water" },
    { speciesName: "Sinistcha", level: 90, ability: "Heatproof", mainMoves: ["Energy Ball", "Shadow Ball", "Stun Spore", "Scald"], addMoves: ["Grassy Terrain", "Matcha Gotcha"], teraType: "Grass" },
];

export let T6Raids_IndigoDisk: RaidBossPreset[] = [
    { speciesName: "Sandslash-Alola", level: 90, ability: "Slush Rush", mainMoves: ["Ice Spinner", "Iron Head", "Earthquake", "Triple Axel"], addMoves: ["Snowscape", "Swords Dance"], teraType: "Ice" },
    { speciesName: "Ninetales-Alola", level: 90, ability: "Snow Warning", mainMoves: ["Moonblast", "Blizzard", "Ice Shard", "Dazzling Gleam"], addMoves: ["Aurora Veil", "Calm Mind", "Snowscape"], teraType: "Ice" },
    { speciesName: "Dugtrio-Alola", level: 90, ability: "Sand Force", mainMoves: ["Bulldoze", "Iron Head", "Ancient Power", "Metal Claw"], addMoves: ["Sandstorm", "Earthquake"], teraType: "Ground" },
    { speciesName: "Golem-Alola", level: 90, ability: "Galvanize", mainMoves: ["Heavy Slam", "Body Slam", "Rock Slide", "Discharge"], addMoves: ["Giga Impact"], teraType: "Rock" },
    { speciesName: "Slowbro-Galar", level: 90, ability: "Regenerator", mainMoves: ["Shell Side Arm", "Zen Headbutt", "Chilling Water", "Rock Blast"], addMoves: ["Toxic"], teraType: "Poison" },
    { speciesName: "Muk-Alola", level: 90, ability: "Power of Alchemy", mainMoves: ["Crunch", "Hex", "Gunk Shot", "Flamethrower"], addMoves: ["Toxic"], teraType: "Poison" },
    { speciesName: "Exeggutor-Alola", level: 90, ability: "Harvest", mainMoves: ["Dragon Hammer", "Extrasensory", "Seed Bomb", "Hypnosis"], addMoves: ["Trick Room"], teraType: "Grass" },
    { speciesName: "Lapras", level: 90, ability: "Hydration", mainMoves: ["Blizzard", "Hydro Pump", "Body Slam", "Sing"], addMoves: ["Snowscape", "Rain Dance"], teraType: "Water" },
    { speciesName: "Slowking-Galar", level: 90, ability: "Regenerator", mainMoves: ["Eerie Spell", "Power Gem", "Yawn", "Acid Spray"], addMoves: ["Toxic"], teraType: "Poison" },
    { speciesName: "Skarmory", level: 90, ability: "Weak Armor", mainMoves: ["Drill Peck", "Steel Wing", "Night Slash", "Slash"], addMoves: ["Taunt", "Iron Defense"], teraType: "Steel" },
    { speciesName: "Kingdra", level: 90, ability: "Damp", mainMoves: ["Draco Meteor", "Dragon Pulse", "Water Pulse", "Flash Cannon"], addMoves: ["Focus Energy", "Rain Dance"], teraType: "Water" },
    { speciesName: "Porygon2", level: 90, ability: "Analytic", mainMoves: ["Tri Attack", "Discharge", "Agility", "Psybeam"], addMoves: ["Thunder Wave", "Trick Room"], teraType: "Normal" },
    { speciesName: "Flygon", level: 90, ability: "Levitate", mainMoves: ["Earthquake", "Dragon Claw", "Quick Attack", "Breaking Swipe"], addMoves: ["Dragon Dance", "Draco Meteor"], teraType: "Ground" },
    { speciesName: "Metagross", level: 90, ability: "Light Metal", mainMoves: ["Zen Headbutt", "Iron Head", "Heavy Slam", "Aerial Ace"], addMoves: ["Agility", "Hone Claws"], teraType: "Steel" },
    { speciesName: "Rhyperior", level: 90, ability: "Reckless", mainMoves: ["Earthquake", "Rock Wrecker", "Megahorn", "Rock Polish"], addMoves: ["Sandstorm", "Iron Defense"], teraType: "Ground" },
    { speciesName: "Electivire", level: 90, ability: "Vital Spirit", mainMoves: ["Discharge", "Thunder Punch", "Earthquake", "Brick Break"], addMoves: ["Electric Terrain"], teraType: "Electric" },
    { speciesName: "Magmortar", level: 90, ability: "Vital Spirit", mainMoves: ["Lava Plume", "Psychic", "Scorching Sands", "Taunt"], addMoves: ["Sunny Day"], teraType: "Fire" },
    { speciesName: "Porygon-Z", level: 90, ability: "Analytic", mainMoves: ["Tri Attack", "Discharge", "Agility", "Psybeam"], addMoves: ["Thunder Wave", "Trick Room"], teraType: "Normal" },
    { speciesName: "Excadrill", level: 90, ability: "Mold Breaker", mainMoves: ["Iron Head", "Earthquake", "Drill Run", "Slash"], addMoves: ["Sandstorm"], teraType: "Ground" },
    { speciesName: "Whimsicott", level: 90, ability: "Chlorophyll", mainMoves: ["Energy Ball", "Moonblast", "Encore", "Hurricane"], addMoves: ["Taunt"], teraType: "Grass" },
    { speciesName: "Reuniclus", level: 90, ability: "Regenerator", mainMoves: ["Psychic", "Fire Punch", "Swift", "Rock Tomb"], addMoves: ["Reflect", "Light Screen", "Calm Mind"], teraType: "Psychic" },
    { speciesName: "Golurk", level: 90, ability: "No Guard", mainMoves: ["Dynamic Punch", "Shadow Punch", "Heavy Slam", "Ice Punch"], addMoves: ["Curse"], teraType: "Ground" },
    { speciesName: "Malamar", level: 90, ability: "Infiltrator", mainMoves: ["Psycho Cut", "Night Slash", "Foul Play", "Pluck"], addMoves: ["Taunt", "Topsy-Turvy"], teraType: "Dark" },
    { speciesName: "Alcremie", level: 90, ability: "Aroma Veil", mainMoves: ["Dazzling Gleam", "Psychic", "Encore", "Psyshock"], addMoves: ["Acid Armor"], teraType: "Fairy" },
    { speciesName: "Duraludon", level: 90, ability: "Stalwart", mainMoves: ["Flash Cannon", "Dragon Pulse", "Breaking Swipe", "Metal Claw"], addMoves: ["Stealth Rock", "Light Screen", "Reflect"], teraType: "Steel" },
    { speciesName: "Kleavor", level: 90, ability: "Sharpness", mainMoves: ["X-Scissor", "Close Combat", "Air Cutter", "Night Slash"], addMoves: ["Stone Axe", "Swords Dance"], teraType: "Bug" },
    { speciesName: "Overqwil", level: 90, ability: "Intimidate", mainMoves: ["Barb Barrage", "Crunch", "Pin Missile", "Fell Stinger"], addMoves: ["Toxic"], teraType: "Dark" },    
];

export let tier6RaidBossPresets: RaidBossPreset[] = T6Raids_Paldea.concat( T6Raids_TealMask, T6Raids_IndigoDisk);




export let T5Raids_Paldea: RaidBossPreset[] = [
    { speciesName: "Raichu", level: 75, ability: "Lightning Rod", mainMoves: ["Discharge", "Iron Tail", "Charm", "Nuzzle"], addMoves: ["Electric Terrain", "Thunder Wave"], teraType: "Electric" },
    { speciesName: "Arcanine", level: 75, ability: "Justified", mainMoves: ["Flamethrower", "Crunch", "Extreme Speed", "Fire Fang"], addMoves: ["Sunny Day", "Leer"], teraType: "Fire" },
    { speciesName: "Slowbro", level: 75, ability: "Regenerator", mainMoves: ["Zen Headbutt", "Liquidation", "Yawn", "Water Pulse"], addMoves: ["Curse"], teraType: "Water" },
    { speciesName: "Cloyster", level: 75, ability: "Overcoat", mainMoves: ["Icicle Spear", "Hydro Pump", "Ice Shard", "Supersonic"], addMoves: ["Shell Smash"], teraType: "Water" },
    { speciesName: "Gengar", level: 75, ability: "Cursed Body", mainMoves: ["Shadow Ball", "Sludge Bomb", "Confuse Ray", "Spite"], addMoves: ["Hypnosis"], teraType: "Ghost" },
    { speciesName: "Scyther", level: 75, ability: "Steadfast", mainMoves: ["Aerial Ace", "X-Scissor", "Slash", "Agility"], addMoves: ["Focus Energy", "Swords Dance"], teraType: "Bug" },
    { speciesName: "Tauros", level: 75, ability: "Sheer Force", mainMoves: ["Flare Blitz", "Close Combat", "Flamethrower", "Headbutt"], addMoves: ["Work Up", "Sunny Day"], teraType: "Normal" },
    { speciesName: "Tauros", level: 75, ability: "Sheer Force", mainMoves: ["Wave Crash", "Close Combat", "Surf", "Headbutt"], addMoves: ["Work Up", "Rain Dance"], teraType: "Normal" },
    { speciesName: "Gyarados", level: 75, ability: "Moxie", mainMoves: ["Aqua Tail", "Twister", "Hurricane", "Crunch"], addMoves: ["Scary Face", "Taunt", "Dragon Dance", "Rain Dance"], teraType: "Water" },
    { speciesName: "Ditto", level: 75, ability: "Imposter", mainMoves: ["Transform"], teraType: "Normal" },
    { speciesName: "Eevee", level: 75, ability: "Anticipation", mainMoves: ["Tera Blast", "Take Down", "Shadow Ball", "Tickle"], addMoves: ["Yawn", "Calm Mind"], teraType: "Normal" },
    { speciesName: "Dragonite", level: 75, ability: "Multiscale", mainMoves: ["Dragon Rush", "Aerial Ace", "Extreme Speed", "Hurricane"], addMoves: ["Safeguard", "Dragon Dance", "Rain Dance"], teraType: "Dragon" },
    { speciesName: "Slowking", level: 75, ability: "Regenerator", mainMoves: ["Psychic", "Surf", "Yawn", "Water Pulse"], addMoves: ["Psychic Terrain", "Calm Mind"], teraType: "Water" },
    { speciesName: "Scizor", level: 75, ability: "Light Metal", mainMoves: ["Iron Head", "X-Scissor", "Bullet Punch", "Slash"], addMoves: ["Iron Defense", "Focus Energy"], teraType: "Bug" },
    { speciesName: "Delibird", level: 75, ability: "Insomnia", mainMoves: ["Present", "Drill Peck", "Ice Punch", "Blizzard"], addMoves: ["Snowscape"], teraType: "Ice" },
    { speciesName: "Houndoom", level: 75, ability: "Unnerve", mainMoves: ["Flamethrower", "Crunch", "Taunt", "Will-O-Wisp"], addMoves: ["Sunny Day", "Howl"], teraType: "Dark" },
    { speciesName: "Blissey", level: 75, ability: "Healer", mainMoves: ["Dazzling Gleam", "Hyper Voice", "Sing", "Seismic Toss"], addMoves: ["Gravity"], teraType: "Normal" },
    { speciesName: "Tyranitar", level: 75, ability: "Unnerve", mainMoves: ["Rock Slide", "Crunch", "Screech", "Dark Pulse"], addMoves: ["Dragon Dance", "Sandstorm"], teraType: "Rock" },
    { speciesName: "Gardevoir", level: 75, ability: "Telepathy", mainMoves: ["Psychic", "Moonblast", "Disable", "Draining Kiss"], addMoves: ["Misty Terrain", "Calm Mind", "Psychic Terrain"], teraType: "Psychic" },
    { speciesName: "Breloom", level: 75, ability: "Technician", mainMoves: ["Seed Bomb", "Mach Punch", "Worry Seed", "Headbutt"], addMoves: ["Grassy Terrain", "Spore"], teraType: "Grass" },
    { speciesName: "Slaking", level: 75, ability: "Truant", mainMoves: ["Facade", "Shadow Claw", "Play Rough", "Swagger"], addMoves: ["Encore"], teraType: "Normal" },
    { speciesName: "Hariyama", level: 75, ability: "Sheer Force", mainMoves: ["Reversal", "Brick Break", "Brine", "Heavy Slam"], addMoves: ["Scary Face", "Taunt", "Bulk Up"], teraType: "Fighting" },
    { speciesName: "Sableye", level: 75, ability: "Prankster", mainMoves: ["Shadow Claw", "Foul Play", "Will-O-Wisp", "Night Shade"], addMoves: ["Flatter", "Torment"], teraType: "Dark" },
    { speciesName: "Camerupt", level: 75, ability: "Anger Point", mainMoves: ["Flamethrower", "Earth Power", "Yawn", "Eruption"], addMoves: ["Sunny Day"], teraType: "Fire" },
    { speciesName: "Altaria", level: 75, ability: "Cloud Nine", mainMoves: ["Dragon Pulse", "Hurricane", "Sing", "Mist"], addMoves: ["Safeguard", "Cotton Guard"], teraType: "Dragon" },
    { speciesName: "Glalie", level: 75, ability: "Moody", mainMoves: ["Freeze-Dry", "Crunch", "Headbutt", "Frost Breath"], addMoves: ["Snowscape", "Disable"], teraType: "Ice" },
    { speciesName: "Salamence", level: 75, ability: "Moxie", mainMoves: ["Dragon Rush", "Aerial Ace", "Hyper Voice", "Draco Meteor"], addMoves: ["Dragon Dance", "Focus Energy"], teraType: "Dragon" },
    { speciesName: "Staraptor", level: 75, ability: "Reckless", mainMoves: ["Close Combat", "Brave Bird", "Quick Attack", "Double-Edge"], teraType: "Normal" },
    { speciesName: "Luxray", level: 75, ability: "Guts", mainMoves: ["Crunch", "Wild Charge", "Discharge", "Thunder Wave"], addMoves: ["Electric Terrain", "Leer"], teraType: "Electric" },
    { speciesName: "Drifblim", level: 75, ability: "Flare Boost", mainMoves: ["Hex", "Air Slash", "Thunder Wave", "Shadow Ball"], addMoves: ["Will-O-Wisp"], teraType: "Ghost" },
    { speciesName: "Mismagius", level: 75, ability: "Levitate", mainMoves: ["Mystical Fire", "Shadow Ball", "Confuse Ray", "Taunt"], addMoves: ["Light Screen", "Nasty Plot"], teraType: "Ghost" },
    { speciesName: "Honchkrow", level: 75, ability: "Moxie", mainMoves: ["Night Slash", "Hurricane", "Haze", "Wing Attack"], addMoves: ["Nasty Plot"], teraType: "Dark" },
    { speciesName: "Bronzong", level: 75, ability: "Heavy Metal", mainMoves: ["Flash Cannon", "Extrasensory", "Metal Sound", "Payback"], addMoves: ["Rain Dance", "Calm Mind", "Reflect"], teraType: "Steel" },
    { speciesName: "Garchomp", level: 75, ability: "Rough Skin", mainMoves: ["Earthquake", "Dragon Claw", "Iron Head", "Slash"], addMoves: ["Sandstorm", "Bulldoze"], teraType: "Dragon" },
    { speciesName: "Hippowdon", level: 75, ability: "Sand Force", mainMoves: ["Earthquake", "Yawn", "Rock Slide", "Body Slam"], addMoves: ["Stockpile"], teraType: "Ground" },
    { speciesName: "Abomasnow", level: 75, ability: "Soundproof", mainMoves: ["Energy Ball", "Ice Punch", "Ice Shard", "Leer"], addMoves: ["Blizzard", "Snowscape", "Aurora Veil"], teraType: "Grass" },
    { speciesName: "Weavile", level: 75, ability: "Pickpocket", mainMoves: ["Ice Punch", "Night Slash", "Taunt", "Facade"], addMoves: ["Reflect", "Swords Dance"], teraType: "Dark" },
    { speciesName: "Magnezone", level: 75, ability: "Analytic", mainMoves: ["Thunderbolt", "Flash Cannon", "Tri Attack", "Thunder Wave"], addMoves: ["Magnet Rise", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Gallade", level: 75, ability: "Justified", mainMoves: ["Psycho Cut", "Brick Break", "Shadow Sneak", "Fury Cutter"], addMoves: ["Hypnosis", "Disable", "Psychic Terrain"], teraType: "Psychic" },
    { speciesName: "Froslass", level: 75, ability: "Cursed Body", mainMoves: ["Frost Breath", "Shadow Ball", "Scary Face", "Draining Kiss"], addMoves: ["Snowscape", "Disable", "Aurora Veil"], teraType: "Ice" },
    { speciesName: "Rotom", level: 75, ability: "Levitate", mainMoves: ["Discharge", "Uproar", "Hex", "Thunder Wave"], addMoves: ["Charge", "Eerie Impulse"], teraType: "Electric" },
    { speciesName: "Krookodile", level: 75, ability: "Anger Point", mainMoves: ["Earthquake", "Crunch", "Sand Tomb", "Counter"], addMoves: ["Torment", "Hone Claws"], teraType: "Ground" },
    { speciesName: "Zoroark", level: 75, ability: "Illusion", mainMoves: ["Night Daze", "Shadow Claw", "Taunt", "Hyper Voice"], addMoves: ["Torment", "Nasty Plot"], teraType: "Dark" },
    { speciesName: "Gothitelle", level: 75, ability: "Shadow Tag", mainMoves: ["Psychic", "Thunder Wave", "Thunderbolt", "Stored Power"], addMoves: ["Calm Mind", "Light Screen"], teraType: "Psychic" },
    { speciesName: "Amoonguss", level: 75, ability: "Regenerator", mainMoves: ["Energy Ball", "Sludge Bomb", "Spore", "Clear Smog"], addMoves: ["Grassy Terrain"], teraType: "Grass" },
    { speciesName: "Eelektross", level: 75, ability: "Levitate", mainMoves: ["Wild Charge", "Flamethrower", "Discharge", "Crush Claw"], addMoves: ["Ion Deluge", "Thunder Wave", "Coil"], teraType: "Electric" },
    { speciesName: "Haxorus", level: 75, ability: "Unnerve", mainMoves: ["Dragon Claw", "Crunch", "Giga Impact", "First Impression"], addMoves: ["Harden", "Dragon Dance"], teraType: "Dragon" },
    { speciesName: "Braviary", level: 75, ability: "Defiant", mainMoves: ["Acrobatics", "Crush Claw", "Superpower", "Air Slash"], addMoves: ["Tailwind", "Hone Claws"], teraType: "Normal" },
    { speciesName: "Hydreigon", level: 75, ability: "Levitate", mainMoves: ["Dark Pulse", "Dragon Pulse", "Scary Face", "Dragon Rush"], addMoves: ["Taunt", "Reflect", "Nasty Plot"], teraType: "Dark" },
    { speciesName: "Volcarona", level: 75, ability: "Swarm", mainMoves: ["Fire Blast", "Bug Buzz", "Hurricane", "Will-O-Wisp"], addMoves: ["Sunny Day", "Quiver Dance"], teraType: "Bug" },
    { speciesName: "Talonflame", level: 75, ability: "Gale Wings", mainMoves: ["Acrobatics", "Flare Blitz", "Steel Wing", "Heat Wave"], addMoves: ["Bulk Up"], teraType: "Fire" },
    { speciesName: "Florges", level: 75, ability: "Symbiosis", mainMoves: ["Petal Dance", "Moonblast", "Psychic", "Safeguard"], addMoves: ["Grassy Terrain", "Calm Mind"], teraType: "Fairy" },
    { speciesName: "Dragalge", level: 75, ability: "Adaptability", mainMoves: ["Dragon Pulse", "Sludge Bomb", "Water Pulse", "Toxic"], addMoves: ["Acid Spray", "Draco Meteor"], teraType: "Poison" },
    { speciesName: "Clawitzer", level: 75, ability: "Mega Launcher", mainMoves: ["Water Pulse", "Dragon Pulse", "Aura Sphere", "Crabhammer"], addMoves: ["Rain Dance"], teraType: "Water" },
    { speciesName: "Goodra", level: 75, ability: "Gooey", mainMoves: ["Water Pulse", "Dragon Pulse", "Sludge Bomb", "Power Whip"], addMoves: ["Rain Dance", "Draco Meteor", "Acid Armor"], teraType: "Dragon" },
    { speciesName: "Avalugg", level: 75, ability: "Sturdy", mainMoves: ["Icicle Crash", "Double-Edge", "Crunch", "Ice Fang"], addMoves: ["Snowscape", "Iron Defense"], teraType: "Ice" },
    { speciesName: "Noivern", level: 75, ability: "Telepathy", mainMoves: ["Air Slash", "Dragon Pulse", "Acrobatics", "Boomburst"], addMoves: ["Tailwind"], teraType: "Flying" },
    { speciesName: "Mudsdale", level: 75, ability: "Inner Focus", mainMoves: ["High Horsepower", "Body Press", "Rock Smash", "Heavy Slam"], addMoves: ["Scary Face", "Iron Defense"], teraType: "Ground" },
    { speciesName: "Tsareena", level: 75, ability: "Sweet Veil", mainMoves: ["High Jump Kick", "Power Whip", "Stomp", "Trop Kick"], addMoves: ["Reflect", "Grassy Terrain"], teraType: "Grass" },
    { speciesName: "Oranguru", level: 75, ability: "Symbiosis", mainMoves: ["Facade", "Psychic", "Stored Power", "Yawn"], addMoves: ["Calm Mind", "Light Screen"], teraType: "Normal" },
    { speciesName: "Passimian", level: 75, ability: "Defiant", mainMoves: ["Reversal", "Rock Smash", "Facade", "Gunk Shot"], addMoves: ["Taunt", "Trailblaze", "Bulk Up"], teraType: "Fighting" },
    { speciesName: "Mimikyu", level: 75, ability: "Disguise", mainMoves: ["Play Rough", "Shadow Claw", "Will-O-Wisp", "Shadow Sneak"], addMoves: ["Light Screen", "Taunt"], teraType: "Ghost" },
    { speciesName: "Greedent", level: 75, ability: "Gluttony", mainMoves: ["Body Slam", "Body Press", "Bullet Seed", "Tail Whip"], addMoves: ["Stockpile"], teraType: "Normal" },
    { speciesName: "Corviknight", level: 75, ability: "Mirror Armor", mainMoves: ["Steel Wing", "Drill Peck", "Taunt", "Body Press"], addMoves: ["Iron Defense", "Hone Claws"], teraType: "Flying" },
    { speciesName: "Coalossal", level: 75, ability: "Flash Fire", mainMoves: ["Heat Crash", "Stone Edge", "Incinerate", "Ancient Power"], addMoves: ["Sandstorm", "Tar Shot", "Fire Blast"], teraType: "Rock" },
    { speciesName: "Flapple", level: 75, ability: "Hustle", mainMoves: ["Grav Apple", "Dragon Breath", "Dragon Rush", "Trailblaze"], addMoves: ["Grassy Terrain", "Iron Defense", "Dragon Dance"], teraType: "Grass" },
    { speciesName: "Appletun", level: 75, ability: "Thick Fat", mainMoves: ["Apple Acid", "Dragon Pulse", "Giga Drain", "Body Press"], addMoves: ["Growth"], teraType: "Grass" },
    { speciesName: "Toxtricity", level: 75, ability: "Technician", mainMoves: ["Overdrive", "Poison Jab", "Nuzzle", "Boomburst"], addMoves: ["Electric Terrain"], teraType: "Electric" },
    { speciesName: "Toxtricity-LowKey", level: 75, ability: "Technician", mainMoves: ["Overdrive", "Poison Jab", "Nuzzle", "Boomburst"], addMoves: ["Electric Terrain"], teraType: "Electric" },
    { speciesName: "Polteageist", level: 75, ability: "Cursed Body", mainMoves: ["Shadow Ball", "Mega Drain", "Astonish", "Will-O-Wisp"], addMoves: ["Shell Smash"], teraType: "Ghost" },
    { speciesName: "Hatterene", level: 75, ability: "Magic Bounce", mainMoves: ["Dazzling Gleam", "Psychic", "Dark Pulse", "Charm"], addMoves: ["Misty Terrain", "Calm Mind", "Psychic Terrain"], teraType: "Psychic" },
    { speciesName: "Grimmsnarl", level: 75, ability: "Pickpocket", mainMoves: ["Spirit Break", "False Surrender", "Scary Face", "Foul Play"], addMoves: ["Light Screen", "Bulk Up"], teraType: "Dark" },
    { speciesName: "Falinks", level: 75, ability: "Defiant", mainMoves: ["Megahorn", "Reversal", "Headbutt", "Brick Break"], addMoves: ["No Retreat"], teraType: "Fighting" },
    { speciesName: "Pincurchin", level: 75, ability: "Electric Surge", mainMoves: ["Zing Zap", "Thunder", "Surf", "Poison Jab"], addMoves: ["Rain Dance", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Indeedee", level: 75, ability: "Psychic Surge", mainMoves: ["Psychic", "Hyper Voice", "Shadow Ball", "Trick Room"], addMoves: ["Play Nice", "Calm Mind"], teraType: "Psychic" },
    { speciesName: "Indeedee-F", level: 75, ability: "Psychic Surge", mainMoves: ["Psychic", "Hyper Voice", "Shadow Ball", "Trick Room"], addMoves: ["Play Nice", "Calm Mind"], teraType: "Psychic" },
    { speciesName: "Copperajah", level: 75, ability: "Heavy Metal", mainMoves: ["Heavy Slam", "Strength", "Curse", "High Horsepower"], addMoves: ["Sandstorm", "Iron Defense"], teraType: "Steel" },
    { speciesName: "Dragapult", level: 75, ability: "Cursed Body", mainMoves: ["Shadow Ball", "Dragon Darts", "Thunderbolt", "Hex"], addMoves: ["Reflect", "Light Screen"], teraType: "Dragon" },
    { speciesName: "Pawmot", level: 75, ability: "Iron Fist", mainMoves: ["Wild Charge", "Close Combat", "Nuzzle", "Sweet Kiss"], addMoves: ["Double Shock"], teraType: "Electric" },
    { speciesName: "Arboliva", level: 75, ability: "Harvest", mainMoves: ["Energy Ball", "Hyper Voice", "Earth Power", "Charm"], addMoves: ["Sunny Day", "Growth", "Leaf Storm"], teraType: "Grass" },
    { speciesName: "Garganacl", level: 75, ability: "Clear Body", mainMoves: ["Salt Cure", "Rock Slide", "Hammer Arm", "Sandstorm"], teraType: "Rock" },
    { speciesName: "Armarouge", level: 75, ability: "Weak Armor", mainMoves: ["Armor Cannon", "Psychic", "Night Shade", "Will-O-Wisp"], addMoves: ["Sunny Day", "Calm Mind"], teraType: "Fire" },
    { speciesName: "Ceruledge", level: 75, ability: "Weak Armor", mainMoves: ["Bitter Blade", "Shadow Claw", "Psycho Cut", "Will-O-Wisp"], addMoves: ["Sunny Day", "Swords Dance"], teraType: "Fire" },
    { speciesName: "Mabosstiff", level: 75, ability: "Stakeout", mainMoves: ["Crunch", "Play Rough", "Take Down", "Swagger"], addMoves: ["Taunt"], teraType: "Dark" },
    { speciesName: "Brambleghast", level: 75, ability: "Infiltrator", mainMoves: ["Giga Drain", "Shadow Ball", "Power Whip", "Infestation"], addMoves: ["Grassy Terrain"], teraType: "Grass" },
    { speciesName: "Tinkaton", level: 75, ability: "Pickpocket", mainMoves: ["Gigaton Hammer", "Play Rough", "Brutal Swing", "Rock Smash"], addMoves: ["Misty Terrain", "Thunder Wave", "Charm"], teraType: "Fairy" },
    { speciesName: "Bombirdier", level: 75, ability: "Rocky Payload", mainMoves: ["Rock Slide", "Sucker Punch", "Brave Bird", "Torment"], addMoves: ["Knock Off", "Feather Dance"], teraType: "Flying" },
    { speciesName: "Palafin", level: 75, ability: "Zero to Hero", mainMoves: ["Liquidation", "Acrobatics", "Charm", "Boomburst"], addMoves: ["Rain Dance", "Bulk Up"], teraType: "Water" },
    { speciesName: "Revavroom", level: 75, ability: "Filter", mainMoves: ["Spin Out", "Taunt", "Gunk Shot", "Overheat"], addMoves: ["Scary Face", "Shift Gear"], teraType: "Steel" },
    { speciesName: "Orthworm", level: 75, ability: "Sand Veil", mainMoves: ["Iron Head", "Earthquake", "Stomping Tantrum", "Wrap"], addMoves: ["Sandstorm", "Coil"], teraType: "Steel" },
    { speciesName: "Glimmora", level: 75, ability: "Corrosion", mainMoves: ["Power Gem", "Sludge Bomb", "Mortal Spin", "Ancient Power"], addMoves: ["Sandstorm", "Tera Blast"], teraType: "Rock" },
    { speciesName: "Cetitan", level: 75, ability: "Sheer Force", mainMoves: ["Ice Spinner", "Liquidation", "Yawn", "Entrainment"], addMoves: ["Snowscape"], teraType: "Ice" },
    { speciesName: "Dondozo", level: 75, ability: "Water Veil", mainMoves: ["Order Up", "Waterfall", "Heavy Slam", "Tickle"], addMoves: ["Rain Dance", "Stockpile"], teraType: "Water" },
    { speciesName: "Tatsugiri", level: 75, ability: "Storm Drain", mainMoves: ["Water Pulse", "Dragon Pulse", "Rapid Spin", "Counter"], addMoves: ["Chilling Water"], teraType: "Dragon" },
    { speciesName: "Annihilape", level: 75, ability: "Defiant", mainMoves: ["Shadow Claw", "Close Combat", "Outrage", "Leer"], addMoves: ["Taunt", "Bulk Up"], teraType: "Fighting" },
    { speciesName: "Kingambit", level: 75, ability: "Pressure", mainMoves: ["Iron Head", "Night Slash", "Torment", "Slash"], addMoves: ["Taunt", "Metal Burst"], teraType: "Dark" },
    { speciesName: "Baxcalibur", level: 75, ability: "Ice Body", mainMoves: ["Dragon Claw", "Icicle Crash", "Ice Shard", "Body Press"], addMoves: ["Snowscape"], teraType: "Dragon" }
];

export let T5Raids_TealMask: RaidBossPreset[] = [
    { speciesName: "Ninetales", level: 75, ability: "Drought", mainMoves: ["Flamethrower", "Extrasensory", "Will-O-Wisp", "Hypnosis"], addMoves: ["Nasty Plot"], teraType: "Fire" },
    { speciesName: "Poliwrath", level: 75, ability: "Swift Swim", mainMoves: ["Liquidation", "Brick Break", "Haze", "Hydro Pump"], addMoves: ["Rain Dance"], teraType: "Water" },
    { speciesName: "Victreebel", level: 75, ability: "Gluttony", mainMoves: ["Sludge Bomb", "Power Whip", "Acid Spray", "Trailblaze"], addMoves: ["Sunny Day"], teraType: "Grass" },
    { speciesName: "Golem", level: 75, ability: "Sand Veil", mainMoves: ["Earthquake", "Stone Edge", "Heavy Slam", "Defense Curl"], teraType: "Rock" },
    { speciesName: "Snorlax", level: 75, ability: "Gluttony", mainMoves: ["Body Slam", "Heavy Slam", "Bite", "Mud-Slap"], addMoves: ["Curse"], teraType: "Normal" },
    { speciesName: "Politoed", level: 75, ability: "Drizzle", mainMoves: ["Surf", "Hyper Voice", "Weather Ball", "Encore"], addMoves: ["Rain Dance", "Hydro Pump"], teraType: "Water" },
    { speciesName: "Ludicolo", level: 75, ability: "Own Tempo", mainMoves: ["Energy Ball", "Surf", "Fake Out", "Trailblaze"], addMoves: ["Rain Dance"], teraType: "Water" },
    { speciesName: "Shiftry", level: 75, ability: "Pickpocket", mainMoves: ["Fake Out", "Sucker Punch", "Leaf Blade", "Extrasensory"], addMoves: ["Sunny Day", "Leaf Storm"], teraType: "Grass" },
    { speciesName: "Milotic", level: 75, ability: "Cute Charm", mainMoves: ["Chilling Water", "Surf", "Dragon Pulse", "Attract"], addMoves: ["Rain Dance", "Hydro Pump"], teraType: "Water" },
    { speciesName: "Ambipom", level: 75, ability: "Skill Link", mainMoves: ["Double Hit", "Screech", "Fury Swipes", "Knock Off"], addMoves: ["Trailblaze", "Sand Attack"], teraType: "Normal" },
    { speciesName: "Yanmega", level: 75, ability: "Frisk", mainMoves: ["Bug Buzz", "Air Slash", "Quick Attack", "Hypnosis"], addMoves: ["Supersonic"], teraType: "Bug" },
    { speciesName: "Gliscor", level: 75, ability: "Poison Heal", mainMoves: ["Poison Jab", "Earthquake", "Acrobatics", "X-Scissor"], addMoves: ["Sandstorm", "Swords Dance"], teraType: "Ground" },
    { speciesName: "Mamoswine", level: 75, ability: "Thick Fat", mainMoves: ["Earthquake", "Blizzard", "Ice Shard", "Ancient Power"], addMoves: ["Snowscape", "Amnesia"], teraType: "Ice" },
    { speciesName: "Probopass", level: 75, ability: "Sand Force", mainMoves: ["Body Press", "Power Gem", "Flash Cannon", "Harden"], addMoves: ["Gravity", "Zap Cannon"], teraType: "Rock" },
    { speciesName: "Dusknoir", level: 75, ability: "Frisk", mainMoves: ["Fire Punch", "Brick Break", "Shadow Ball", "Shadow Punch"], addMoves: ["Trick Room", "Poltergeist"], teraType: "Ghost" },
    { speciesName: "Conkeldurr", level: 75, ability: "Iron Fist", mainMoves: ["Hammer Arm", "Stone Edge", "Superpower", "Scary Face"], addMoves: ["Bulk Up"], teraType: "Fighting" },
    { speciesName: "Chandelure", level: 75, ability: "Infiltrator", mainMoves: ["Shadow Ball", "Heat Wave", "Confuse Ray", "Flamethrower"], addMoves: ["Sunny Day"], teraType: "Ghost" },
    { speciesName: "Mienshao", level: 75, ability: "Reckless", mainMoves: ["Aura Sphere", "Poison Jab", "Taunt", "Acrobatics"], addMoves: ["Bulk Up"], teraType: "Fighting" },
    { speciesName: "Mandibuzz", level: 75, ability: "Weak Armor", mainMoves: ["Rock Tomb", "Dark Pulse", "Toxic", "Foul Play"], addMoves: ["Taunt", "Nasty Plot"], teraType: "Dark" },
    { speciesName: "Trevenant", level: 75, ability: "Harvest", mainMoves: ["Wood Hammer", "Shadow Claw", "Will-O-Wisp", "Hex"], addMoves: ["Grassy Terrain"], teraType: "Ghost" },
    { speciesName: "Vikavolt", level: 75, ability: "Levitate", mainMoves: ["Discharge", "Bug Buzz", "Solar Beam", "Zap Cannon"], teraType: "Bug" },
    { speciesName: "Kommo-o", level: 75, ability: "Overcoat", mainMoves: ["Brick Break", "Dragon Claw", "Boomburst", "Scary Face"], addMoves: ["Clangorous Soul"], teraType: "Dragon" },
    { speciesName: "Basculegion", level: 75, ability: "Mold Breaker", mainMoves: ["Liquidation", "Aqua Jet", "Shadow Ball", "Scary Face"], addMoves: ["Rain Dance", "Wave Crash"], teraType: "Water" },
    { speciesName: "Basculegion-F", level: 75, ability: "Mold Breaker", mainMoves: ["Liquidation", "Aqua Jet", "Shadow Ball", "Scary Face"], addMoves: ["Rain Dance", "Hydro Pump"], teraType: "Water" },
    { speciesName: "Sinistcha", level: 75, ability: "Heatproof", mainMoves: ["Energy Ball", "Shadow Ball", "Stun Spore", "Scald"], addMoves: ["Grassy Terrain", "Matcha Gotcha"], teraType: "Grass" },
];

export let T5Raids_IndigoDisk: RaidBossPreset[] = [
    { speciesName: "Exeggutor", level: 75, ability: "Harvest", mainMoves: ["Psychic", "Energy Ball", "Uproar", "Bulldoze"], addMoves: ["Sunny Day", "Growth"], teraType: "Grass" },
    { speciesName: "Hitmonlee", level: 75, ability: "Unburden", mainMoves: ["Low Sweep", "Mega Kick", "Blaze Kick", "Scary Face"], addMoves: ["Focus Energy", "Bulk Up", "Close Combat"], teraType: "Fighting" },
    { speciesName: "Hitmonchan", level: 75, ability: "Inner Focus", mainMoves: ["Mach Punch", "Mega Punch", "Thunder Punch", "Throat Chop"], addMoves: ["Focus Energy", "Bulk Up", "Close Combat"], teraType: "Fighting" },
    { speciesName: "Lapras", level: 75, ability: "Hydration", mainMoves: ["Ice Beam", "Freeze-Dry", "Sparkling Aria", "Body Press"], addMoves: ["Sing", "Mist", "Snowscape"], teraType: "Water" },
    { speciesName: "Skarmory", level: 75, ability: "Weak Armor", mainMoves: ["Steel Wing", "Drill Peck", "X-Scissor", "Feint"], addMoves: ["Iron Defense", "Swords Dance", "Tailwind"], teraType: "Steel" },
    { speciesName: "Kingdra", level: 75, ability: "Damp", mainMoves: ["Dragon Pulse", "Hydro Pump", "Flash Cannon", "Yawn"], addMoves: ["Rain Dance", "Focus Energy"], teraType: "Water" },
    { speciesName: "Porygon2", level: 75, ability: "Analytic", mainMoves: ["Tri Attack", "Discharge", "Agility", "Psybeam"], addMoves: ["Magnet Rise"], teraType: "Normal" },
    { speciesName: "Hitmontop", level: 75, ability: "Steadfast", mainMoves: ["Triple Kick", "Sucker Punch", "Gyro Ball", "Triple Axel"], addMoves: ["Focus Energy", "Bulk Up", "Close Combat"], teraType: "Fighting" },
    { speciesName: "Flygon", level: 75, ability: "Levitate", mainMoves: ["Dragon Pulse", "Scorching Sands", "Earthquake", "Flamethrower"], addMoves: ["Sandstorm", "Boomburst"], teraType: "Ground" },
    { speciesName: "Metagross", level: 75, ability: "Light Metal", mainMoves: ["Zen Headbutt", "Meteor Mash", "Agility", "Bullet Punch"], addMoves: ["Light Screen", "Magnet Rise"], teraType: "Steel" },
    { speciesName: "Rhyperior", level: 75, ability: "Reckless", mainMoves: ["Earthquake", "Rock Wrecker", "Brick Break", "Surf"], addMoves: ["Sandstorm"], teraType: "Ground" },
    { speciesName: "Electivire", level: 75, ability: "Vital Spirit", mainMoves: ["Discharge", "Thunder Punch", "Fire Punch", "Ice Punch"], addMoves: ["Thunder Wave", "Electric Terrain"], teraType: "Electric" },
    { speciesName: "Magmortar", level: 75, ability: "Vital Spirit", mainMoves: ["Flamethrower", "Psychic", "Focus Blast", "Clear Smog"], addMoves: ["Sunny Day", "Will-O-Wisp"], teraType: "Fire" },
    { speciesName: "Porygon-Z", level: 75, ability: "Analytic", mainMoves: ["Tri Attack", "Discharge", "Agility", "Psybeam"], addMoves: ["Magnet Rise"], teraType: "Normal" },
    { speciesName: "Excadrill", level: 75, ability: "Mold Breaker", mainMoves: ["Drill Run", "Iron Head", "X-Scissor", "Rapid Spin"], addMoves: ["Sandstorm", "Earthquake"], teraType: "Ground" },
    { speciesName: "Reuniclus", level: 75, ability: "Regenerator", mainMoves: ["Psychic", "Psyshock", "Gravity", "Shadow Ball"], addMoves: ["Psychic Terrain", "Reflect"], teraType: "Psychic" },
    { speciesName: "Golurk", level: 75, ability: "No Guard", mainMoves: ["Shadow Punch", "Drain Punch", "Heavy Slam", "Iron Defense"], addMoves: ["Gravity", "Reflect"], teraType: "Ground" },
    { speciesName: "Malamar", level: 75, ability: "Infiltrator", mainMoves: ["Foul Play", "Psycho Cut", "Night Slash", "Taunt"], addMoves: ["Topsy-Turvy", "Superpower"], teraType: "Dark" },
    { speciesName: "Minior-Meteor", level: 75, ability: "Shields Down", mainMoves: ["Power Gem", "Acrobatics", "Take Down", "Swift"], addMoves: ["Sandstorm", "Shell Smash"], teraType: "Rock" },
    { speciesName: "Alcremie", level: 75, ability: "Aroma Veil", mainMoves: ["Dazzling Gleam", "Psychic", "Encore", "Psyshock"], addMoves: ["Acid Armor"], teraType: "Fairy" },
    { speciesName: "Duraludon", level: 75, ability: "Stalwart", mainMoves: ["Flash Cannon", "Dragon Pulse", "Breaking Swipe", "Metal Sound"], addMoves: ["Light Screen", "Draco Meteor", "Iron Defense"], teraType: "Steel" },
];

export let tier5RaidBossPresets: RaidBossPreset[] = T5Raids_Paldea.concat( T5Raids_TealMask, T5Raids_IndigoDisk );
