/**
 * This class simulates an arithmetic logic unit.
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class Alu {
    constructor() {
		this.opA;
		this.opB;
		this.result;
		this.zero = 0;
		this.negative = 0;
		this.overflow = 0;
		this.carry = 0;
		
    }
    

    /**-
     * This function sets the operands. This should be called before the process function is called.
     * @since 1.0
	 * @param {string} A: 8 bit operand
	 * @param {string} B: 8 bit operand
     * @author Bryce Snell
     * 
    */
    setOps(A, B) {
		this.opA = A;
		this.opB = B;
	}	

    /**
     * This function calculates the ALU result for given control signals and operands. 
	 * This needs to have the setOps function called before it runs. 
	 * This function also creates the flag values.
	 * @param {string} control - Control bits for cpu
	 * @returns {Error} Adder Error
	 * @returns {Error} ALU Control Error
     * @since: 1.0
     * @author Bryce Snell
     */
    process(control) {

		// Shift left
		if(control[0] == 0 && control[1] == 0) {
			this.result = this.opA.substring(1)+'0';
			this.carry = this.opA[0];
			this.overflow = "0";
			this.negative = this.result[0];

			if(parseInt(this.result,2) == 0) {
				this.zero = "1";
			}

			else {
				this.zero = "0";
			}
		}

		// Shift right
		else if(control[0] == 0 && control[1] == 1) {
			this.result = '0' + this.opA.substring(0,7);
			this.carry = this.opA[7];
			this.overflow = "0";
			this.negative = this.result[0];

			if(parseInt(this.result,2) == 0) {
				this.zero = "1";
			}
			 
			else {
				this.zero = "0";
			}
		}

		// Add/sub
		else if(control[0] == 1) {
			let tempResult = new Array(8);  // This will hold the result
			let carryArray = new Array(9);  // This will hold the carry results

			carryArray[7] = parseInt(control[1], 2);  // This is the part that handles the add/sub difference

			// Bit based add (I'm so sorry we have to do it this way)
			for(let i=7; i>=0; i--) {
				let a = parseInt(this.opA[i], 2);
				let b = parseInt(this.opB[i], 2);
				

				let sum = a+(b^carryArray[7])+carryArray[i];
				if (sum == 0) {
					tempResult[i] = 0;
					carryArray[i-1] = 0;
				}

				else if (sum == 1) {
					tempResult[i] = 1;
					carryArray[i-1] = 0;
				}

				else if (sum == 2) {
					tempResult[i] = 0;
					carryArray[i-1] = 1;
				}

				else if (sum == 3) {
					tempResult[i] = 1;
					carryArray[i-1] = 1;
				}

				else return new Error('Adder Error: ' + sum);
			}

			this.result = tempResult.join("");

			// Calculate flags
			this.zero = !(tempResult[7] || tempResult[6] || tempResult[5] || tempResult[4] || tempResult[3] || tempResult[2] || tempResult[1] || tempResult[0]) ? 1 : 0;
			this.carry = carryArray[-1];
			this.overflow = carryArray[-1] ^ carryArray[0];
			this.negative = tempResult[0];
		}

		else return new Error('ALU Control Error: ' + control);
	}
	
	/**
     * A little helper function for padding strings.
     * @param {string} input - input string to pad
     * @param {number} size - Size to pad it to.
     */
    pad(input, size) {
        while (input.length < size) {input= '0' + input;}
        return input;
    }
};