/**
 * This class simulates the op code decoder.
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class OpCodeDecoder {
    constructor() {
        this.noop = 0;
        this.move = 0;
        this.loadi = 0;
        this.add = 0;
        this.addi = 0;
        this.sub = 0;
        this.subi = 0;
        this.load = 0;
        this.loadf = 0;
        this.store = 0;
        this.storef = 0;
        this.cmp = 0;
        this.jump = 0;
        this.inputc = 0;
        this.inputcf = 0;
        this.inputd = 0;
        this.inputdf = 0;
        this.shiftl = 0;
        this.shiftr = 0;
        this.bre = 0;
        this.brne = 0;
        this.brg = 0;
        this.brge = 0;
        this.rx = 0;
        this.ry = 0;
        this.output = '';
    }
    

    /**
     * This function returns the one hot encoded opcode post decoding
     * @param {string} opCode: XXXX op code for for an instruction
     * @returns {Array}: The one hot encoded output for the opcode
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    getDecodedOpCode(opCode) {      
        this.resetOutputs(); // TODO if we can remove by updating values in real time please do.
          
        let instruction = opCode.substring(0,4);
        this.rx = opCode.substring(4,6);
        this.ry = opCode.substring(6,8);

        if (instruction == '0000') this.noop = 1;
        if (instruction == '0001') {
            if (this.ry == '00') this.inputc = 1;
            if (this.ry == '01') this.inputcf = 1;
            if (this.ry == '10') this.inputd = 1;
            if (this.ry == '11') this.inputdf = 1;
        }
        if (instruction == '0010') this.move = 1;
        if (instruction == '0011') this.loadi = 1;
        if (instruction == '0100') this.add = 1;
        if (instruction == '0101') this.addi = 1;
        if (instruction == '0110') this.sub = 1;
        if (instruction == '0111') this.subi = 1;
        if (instruction == '1000') this.load = 1;
        if (instruction == '1001') this.loadf = 1;
        if (instruction == '1010') this.store = 1;
        if (instruction == '1011') this.storef = 1;
        if (instruction == '1100') {
            if (this.ry == '00') this.shiftl = 1;
            if (this.ry == '01') this.shiftr = 1;
        }
        if (instruction == '1101') this.cmp = 1;
        if (instruction == '1110') this.jump = 1;
        if (instruction == '1111') {
            if (this.ry == '00') this.bre = 1;
            if (this.ry == '01') this.brne = 1;
            if (this.ry == '10') this.brg = 1;
            if (this.ry == '11') this.brge = 1;
        }

        this.package();

        return this.output;
    }
    

    /**
     * This function takes the one hot encoded opcode and makes a string
     * Helper function for getDecodedOpCode
     * @private
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    package() {
        let rxString = this.rx.toString(2);
        rxString = '00'.substr(rxString.length) + rxString;
        let ryString = this.rx.toString(2);
        ryString = '00'.substr(ryString.length) + ryString;
        
        this.output = 
            this.noop.toString() +
            this.inputc.toString() +
            this.inputcf.toString() +
            this.inputd.toString() +
            this.inputdf.toString() +
            this.move.toString() +
            this.loadi.toString() +
            this.add.toString() +
            this.addi.toString() +
            this.sub.toString() +
            this.subi.toString() +
            this.load.toString() +
            this.loadf.toString() +
            this.store.toString() +
            this.storef.toString() +
            this.shiftl.toString() +
            this.shiftr.toString() +
            this.cmp.toString() +
            this.jump.toString() +
            this.bre.toString() +
            this.brne.toString() +
            this.brg.toString() +
            this.brge.toString() + 
            this.rx +
            this.ry;
    }

    /**
     * This function resets the control outputs.
     * DO NOT CALL EXTERNALLY
     * @private
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    resetOutputs() {
        this.noop = 0;
        this.move = 0;
        this.loadi = 0;
        this.add = 0;
        this.addi = 0;
        this.sub = 0;
        this.subi = 0;
        this.load = 0;
        this.loadf = 0;
        this.store = 0;
        this.storef = 0;
        this.cmp = 0;
        this.jump = 0;
        this.inputc = 0;
        this.inputcf = 0;
        this.inputd = 0;
        this.inputdf = 0;
        this.shiftl = 0;
        this.shiftr = 0;
        this.bre = 0;
        this.brne = 0;
        this.brg = 0;
        this.brge = 0;
        this.rx = 0;
        this.ry = 0;
    }
};