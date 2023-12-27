/**
 * This class simulates a register file.
 * @param width: number of bits for each row of the register file
 * @param row: number of rows in the register file
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class RegisterFile {
    constructor(width, rows) {
        this.width = width;
        this.rows = rows;
        this.registers = Array(rows);
        this.writeEnable = 0;
        this.verbose = 0;
    }

    getWidth() {
        return this.width;
    }

    getRows() {
        return this.rows;
    }

    initialize() {
        for(let i=0; i<this.rows; i++) {
            this.registers[i] = new Array(this.width+1).join('0');
        }
    }

    /**
     * This function returns a value from a register
     * @param src: integer for the register target
     * @since 1.0
     * @returns: the value in the register at src
     * @author Bryce Snell
     * 
    */
    getRegister(src) {
        if (0 <= src && src <= this.rows) return this.registers[src];
        else throw 'Invalid src register';
    }


    /**
     * This function sets the write enable bit
     * @param writeEnable: binary for write enable
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    setWriteEnable(writeEnable) {
        this.writeEnable = writeEnable;
    }

    /**
     * This function returns a value from a register
     * @param dest: integer for the register target
     * @param value: value to store in the register
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    setRegister(dest, value) {
        if (this.writeEnable == 1) {
            if (0 <= dest && dest <= this.rows) this.registers[dest] = value;
            else throw 'Invalid dest register';
        }

        else {
            if (this.verbose) {console.warn("Attempt to write to register without enabling write (this may be expected)")};
        }

    }
};