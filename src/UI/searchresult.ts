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
  
    constructor( rankingData: RankingResult ) {
      this.rankingData = rankingData;
    }
  }