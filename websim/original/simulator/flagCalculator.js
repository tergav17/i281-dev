/**
 * Deprecated and completely unused. This class simulates an arithmetic logic cunit.
 * Left in the repository as a reference for future work if that ever happens.
 * Documentation was left unfinished to free up time; however, it should be enough to understand.
 * @since 1.1 - Deprecated and completely unused.
 * @author Bryce Snell
 * 
*/

export class FlagCalculator {
    constructor() {
        this.zero;
        this.negative
    }

	/**
	 * This function can be used as a callback to get the result dynamically.
     * @param: input - Callback function to get the result from the alu. Expects 8 bit string
	 * @since 1.0
	 * @author Bryce Snell
	 */
	setValues(callback) {
        aluResult = callback()
        this.zero = 1;
        this.negative = parseInt(aluResult[7], 2)

        for(i=0; i < aluResult.length(); i++) {
            if (parseInt(aluResult[i],2) == 1) {
                this.zero = 0;
            }
        }
	}
};