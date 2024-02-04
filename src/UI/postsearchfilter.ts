export class PostSearchFilter {
    public learnMoveList : string[] = [];
    public checkStab : boolean = false;
    
    isDefault() {
        if ( this.learnMoveList.length > 0) {
            return false;
        }

        if ( this.checkStab ) {
            return false;
        }

        return true;
    }

    isEqual( psf: PostSearchFilter ) {
        if ( this.learnMoveList.length != psf.learnMoveList.length ) {
            return false;
        }
        // If any element is different, then the two are not equal
        for ( let i = 0; i < this.learnMoveList.length; ++i ) {
            if ( this.learnMoveList[i] != psf.learnMoveList[i] ) {
                return false;
            }
        }

        return this.checkStab == psf.checkStab;
    }
}
