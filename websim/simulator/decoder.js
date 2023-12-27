/**
 * Deprecated and completely unused. This class simulates a decoder.
 * Left in the repository as a reference for future work if that ever happens.
 * Documentation was left unfinished to free up time; however, it should be enough to understand.
 * @since 1.1 - Deprecated and completely unused. 
 * @author Bryce Snell
 * 
*/

export class Decoder {
    /**
     * 
     * @param {number} outputSize: Sets the size of a decoder, must be power of 2
     * @returns {Error} 'Decoder Power of Two Error' if the desired output is not a power of 2.
     */
    constructor(outputSize) {
    
        if(this.powerOfTwo(outputSize) == true) {
            this.outputSize = outputSize;
        }
        else return new Error('Decoder Power of Two Error');

        this.outputs = new Array(this.outputSize);
    }
    

    /**
     * This function returns the outputs as an array
     * @since 1.0
     * @returns {string} Output the current output values as an array
     * @author Bryce Snell
     * 
    */
    getOutput() {
        return this.outputs;
    }


    /**
     * This function returns the outputs at a location
     * @since 1.0
     * @param {number} i: 
     * @returns: the current output value at a location
     * @author Bryce Snell
     * 
    */
    getOutputAtLocation(i) {
        return this.outputs[i];
    }

    /**
     * This function returns the outputs as a string
     * @since 1.0
     * @returns: the current output values as a string
     * @author Bryce Snell
     * 
    */
    getOutputString() {
        return this.outputs.join('');
    }


    /**
     * This function sets the control of the output
     * @param control: 0xX...X where the size is within the limits
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    setControl(control) {
        let targetState = parseInt(control, 16);

        if(0 <= targetState && targetState <= (this.outputSize)) {
            for(var i=0; i < this.outputSize; i++) {

                if(i == targetState) {
                    this.outputs[i] = 1;
                }

                else {
                    this.outputs[i] = 0;
                }
            }
        }

        else throw 'Invalid decoder control: ' + control;
    }


    /**
     * This helper function checks if a number is a power of two
     * @param n: A number to check
     * @returns: True if power of two, false otherwise
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    powerOfTwo(n) {
        return n && (n & (n-1)) === 0;
    }
};