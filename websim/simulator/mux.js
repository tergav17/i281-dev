/**
 * This class simulates a multiplexer.
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class Multiplexer {
    /**
     * Creates a multiplexer object.
     * @param {number} size: Sets the size of a multiplexer, must be power of 2
     * @returns {Error} Multiplexer Power of Two Error
     */
    constructor(size) {
        this.state = null;
        
        if(this.powerOfTwo(size) == true) this.size = size;
        else throw new Error('Multiplexer Power of Two Error');

        this.sources = new Array(this.size);
    }
    

    /**
     * This function returns a value from a register
     * @since 1.0
     * @returns {number}: the current state of the register
     * @author Bryce Snell
     * 
    */
    getState() {
        return this.state;
    }


    /**
     * This function sets the state of a multiplexer
     * @param {number} state: integer for the state must be natural and less than the size stated during construction
     * @returns {Error} Invalid Multiplexer State
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    setState(state) {
        if(0 <= state && state <= (this.size - 1)) this.state = state;
        else return new Error('Invalid Multiplexer State: ' + state);
    }

    /**
     * This function sets the input states of the multiplexer
     * @param {number} port: The input port to set the value of
     * @param {string} value: Input value to the mux
     * @returns {Error} Invalid Multiplexer Port
     * @since: 3.0 - The great callback change was not good, we have reverted
     * @author Bryce Snell
     */
    setSource(port, value) {
        if(0 <= port && port <= (this.size - 1)) {
            this.sources[port] = value;
        }   
        else return new Error('Invalid Multiplexer Port: ' + port);
    }

    /**
     * This function gets the current output of a multiplexer
     * @returns {string} The value at the current state
     * @since: 2.0 - Allows callbacks and "static" data
     * @author Bryce Snell
     */
    getOutput() {
        return this.sources[this.state];
    }


    /**
     * This helper function checks if a number is a power of two
     * @param {integer} n: A number to check
     * @returns {boolean}: True if power of two, false otherwise
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    powerOfTwo(n) {
        return n && (n & (n-1)) === 0;
    }
};