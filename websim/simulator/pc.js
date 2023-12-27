/**
 * This class simulates an arithmetic logic cunit.
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class PC {
    constructor(maxPC) {
        this.currentPC = 0;
		this.lastPC = -1;
		this.step = 1;
		this.maxPC = maxPC;
    }
	

	/**
	 * This function can be used as a callback to get the PC dynamically.
	 * @since 1.0
	 * @author Bryce Snell
	 */
	getPC() {
		return this.currentPC;
	}

	/**
	 * This function can be called to get the previous pc.
	 * @since 1.0
	 * @author Bryce Snell
	 */
	getPreviousPC() {
		return this.lastPC;
	}

    /**
     * This function calculates the PC.
	 * Either increases by a set number (likely 1) or handles jumps.
	 * Like the hardware this represents, a jump includes an offset and a plus 1.
     * @param {string} opcode - 16 bits from the instruction memory
     * @param {number} branchControl - binary integer for branch control signal
     * @since: 1.0
     * @author Bryce Snell
     */
    process(opcode, branchControl) {
        let offset = opcode.substring(10,16); // get the lower 6 bits
		offset = offset.padStart(32, offset[0]);
		this.lastPC = this.currentPC;
		this.currentPC += this.step;

		// Add branch offset
		if(branchControl == 1) {
			let offsetInt = ~~parseInt(offset, 2);  // This should be explained. parseInt converts the offset to decimal. The ~~ makes it signed		
			this.currentPC += offsetInt;
		}
		
		// This handles loop logic
		if(this.currentPC > this.maxPC - 1) {
			this.currentPC = this.currentPC - 64;
		}
    }
};