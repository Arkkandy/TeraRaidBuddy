export class PostSearchFilter {
    public learnMoveList : string[] = [];
    public checkStab : boolean = false;
    public checkType : boolean = false;
    public typeFilter : string = "";
    
    isDefault() {
        if ( this.learnMoveList.length > 0) {
            return false;
        }

        if ( this.checkStab ) {
            return false;
        }

        if ( this.checkType ) {
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

        // Check if stab setting is equal
        if ( this.checkStab != psf.checkStab ) {
            return false;            
        }

        // If the type filter settings match
        if ( this.checkType != psf.checkType ) {
            return false;
        }
        else if ( this.checkType == psf.checkType ) {
            // If both are true, check if type is the same
            if ( this.checkType ) {
                if ( this.typeFilter != psf.typeFilter ) {
                    return false;
                }
            }
            // Otherwise, if both are false then the type is irrelevant
        }

        // If all previous conditions match then both PSF are effectively equal
        return true;
    }
}
