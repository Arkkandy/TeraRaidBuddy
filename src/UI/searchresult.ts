import { RankingResult, RankingResultEntry } from "../ranking/ranking";

export class SearchResult {
    public rankingData: RankingResult;
    
    public filteredData: RankingResultEntry[] = [];
  
    public bestMoveSize: number = 0;
    public bestMoveBoth: boolean = false;
  
    public mainMoveSize: number = 0;
    public mainMoveBoth: boolean = false;
  
    public visibleEntries: number[] = [];
    public itemsPerPage: number = 20;
    public currentPage: number = 1;
  
    public maxColspan: number = 1;

    public execTime : number = 0;
  
    constructor( rankingData: RankingResult ) {
      this.rankingData = rankingData;
    }

    getExecSummary() {
      return `Execution Time: ${this.execTime.toFixed(3)}s<br>Entries analyzed: ${this.rankingData.entriesAnalyzed} | Entries filtered: ${this.rankingData.entriesSkipped}<br>Viewing: ${this.filteredData.length} | PSF: ${this.rankingData.originalData.length-this.filteredData.length}`;
    }
  }