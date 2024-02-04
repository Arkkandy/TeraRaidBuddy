
interface MoveLearnset {
    move: string;
    learners: string[];
}

class LearnsetModule {
	private static  data : Map<string, string[]> | null = null;

	private static async loadData() {
		
		const learnsetData : MoveLearnset[] = (await import ('./learnsetdata.json')).default as MoveLearnset[];

		LearnsetModule.data = new Map<string, string[]>;

		learnsetData.forEach( (entry) => {
			LearnsetModule.data!.set( entry.move, entry.learners );
		});
		
		return LearnsetModule.data;
	}

	static async GetData() {
		if ( LearnsetModule.data === null ) {
			return await LearnsetModule.loadData();
		}

		return LearnsetModule.data;
	}


}

export default LearnsetModule;