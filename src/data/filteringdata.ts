export interface DexID {
    national: number;
    paldea?: number;
    teal?: number;
    indigo?: number;
}

export interface AbilitySet {
    slot1: string;
    slot2?: string;
    h?: string;
}

export class FilterDataEntry {
    public readonly name: string = "";
    public readonly dex: DexID = {national:0};
    public readonly rarity: RarityFlag = RarityFlag.Regular;
    public readonly abilities: AbilitySet = {slot1: ""};

    constructor(entry: Partial<FilterDataEntry>) {
        Object.assign(this,entry);
    }
}

export enum RarityFlag {
    Regular = "R",
    Paradox = "P",
    Legendary = "L",
    Mythical = "M"
}

export class SearchDataModule {
	private static data : FilterDataEntry[] | null = null;

	private static async loadData() {
		
		SearchDataModule.data = (await import ('./searchdata.json')).default as FilterDataEntry[];

		return SearchDataModule.data;
	}

	static async GetData() {
		if ( SearchDataModule.data === null ) {
			return await SearchDataModule.loadData();
		}

		return SearchDataModule.data;
	}


}

export default SearchDataModule;