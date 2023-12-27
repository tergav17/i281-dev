/**
 * This class simulates the control module.
 * @since 1.0
 * @author Bryce Snell
 * 
*/

export class Control {
    constructor() {
        /**
         * Things to know about this array. It comes from slide 47 in 41_i281_CPU.ppt.
         * C[0] is always null, because Dr. Stoytchev didn't start at 0...
         * C[1] maps to IMEM_WRITE_ENABLE
         * C[18] maps to REG_WRITEBACK_MUX
         * Sorry for the confusion...
         */
        this.c = new Array(19);
    }
    

    /**
     * This function returns the control bits
     * @since 1.0
     * @returns {Array}: Control bits as binary integers (aka 0 or 1)
     * @author Bryce Snell
     * 
    */
    getControl() {
        return this.c;
    }


    /**
     * This function creates the control output bits.
     * These control bits will be stored in a local variable. This can be accessed by either the getControl function or the .c parameter
     * @param {string} decodedOpCode: output from opCodeDecoder (literally opCodeDecoder.output)
     * @param {number} zeroFlag: Either a 1 or 0
     * @param {number} negativeFlag: Either a 1 or 0
     * @param {number} overflowFlag: Either a 1 or 0
     * @since 1.0
     * @author Bryce Snell
     * 
    */
    setControl(decodedOpCode, zeroFlag, negativeFlag, overflowFlag) {
        let x0 = parseInt(decodedOpCode.charAt(24));
        let x1 = parseInt(decodedOpCode.charAt(23));
        let y0 = parseInt(decodedOpCode.charAt(26));
        let y1 = parseInt(decodedOpCode.charAt(25));

        let b1 = zeroFlag;
        let b2 = (zeroFlag===1) ? 0 : 1;  // b2 = ~zeroFlag
        let b4 = (negativeFlag===overflowFlag) ? 1 : 0; // XNOR(negativeFlag, overflowFlag)
        let b3 = (b2 == 1 && b4 == 1) ? 1 : 0;  // AND(~zeroFlag, XNOR(negativeFlag, overflowFlag))
        
        // This part sets the output. Note, if the input is not one hot encoded this will break.
        if(decodedOpCode.charAt(0) == 1) this.c =  [null, 0,  0, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // noop
        if(decodedOpCode.charAt(1) == 1) this.c =  [null, 1,  0, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 1, 0, 0, 0];  // inputc
        if(decodedOpCode.charAt(2) == 1) this.c =  [null, 1,  0, 1, x1, x0,  0,  0,  0,  0, 0, 1, 1, 0, 0, 0, 0, 0, 0];  // inputcf
        if(decodedOpCode.charAt(3) == 1) this.c =  [null, 0,  0, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 1, 1, 1, 0];  // inputd
        if(decodedOpCode.charAt(4) == 1) this.c =  [null, 0,  0, 1, x1, x0,  0,  0,  0,  0, 0, 1, 1, 0, 0, 0, 1, 1, 0];  // inputdf
        if(decodedOpCode.charAt(5) == 1) this.c =  [null, 0,  0, 1, y1, y0,  0,  0, x1, x0, 1, 1, 1, 0, 0, 0, 0, 0, 0];  // move
        if(decodedOpCode.charAt(6) == 1) this.c =  [null, 0,  0, 1,  0,  0,  0,  0, x1, x0, 1, 0, 0, 0, 0, 1, 0, 0, 0];  // loadi/loadp
        if(decodedOpCode.charAt(7) == 1) this.c =  [null, 0,  0, 1, x1, x0, y1, y0, x1, x0, 1, 0, 1, 0, 1, 0, 0, 0, 0];  // add
        if(decodedOpCode.charAt(8) == 1) this.c =  [null, 0,  0, 1, x1, x0,  0,  0, x1, x0, 1, 1, 1, 0, 1, 0, 0, 0, 0];  // addi
        if(decodedOpCode.charAt(9) == 1) this.c =  [null, 0,  0, 1, x1, x0, y1, y0, x1, x0, 1, 0, 1, 1, 1, 0, 0, 0, 0];  // sub
        if(decodedOpCode.charAt(10) == 1) this.c = [null, 0,  0, 1, x1, x0,  0,  0, x1, x0, 1, 1, 1, 1, 1, 0, 0, 0, 0];  // subi
        if(decodedOpCode.charAt(11) == 1) this.c = [null, 0,  0, 1,  0,  0,  0,  0, x1, x0, 1, 0, 0, 0, 0, 1, 0, 0, 1];  // load
        if(decodedOpCode.charAt(12) == 1) this.c = [null, 0,  0, 1, y1, y0,  0,  0, x1, x0, 1, 1, 1, 0, 0, 0, 0, 0, 1];  // loadf
        if(decodedOpCode.charAt(13) == 1) this.c = [null, 0,  0, 1,  0,  0, x1, x0,  0,  0, 0, 0, 0, 0, 0, 1, 0, 1, 0];  // store
        if(decodedOpCode.charAt(14) == 1) this.c = [null, 0,  0, 1, y1, y0, x1, x0,  0,  0, 0, 1, 1, 0, 0, 0, 0, 1, 0];  // storef
        if(decodedOpCode.charAt(15) == 1) this.c = [null, 0,  0, 1, x1, x0,  0,  0, x1, x0, 1, 0, 0, 0, 1, 0, 0, 0, 0];  // shiftl
        if(decodedOpCode.charAt(16) == 1) this.c = [null, 0,  0, 1, x1, x0,  0,  0, x1, x0, 1, 0, 0, 1, 1, 0, 0, 0, 0];  // shiftr
        if(decodedOpCode.charAt(17) == 1) this.c = [null, 0,  0, 1, x1, x0, y1, y0,  0,  0, 0, 0, 1, 1, 1, 0, 0, 0, 0];  // cmp
        if(decodedOpCode.charAt(18) == 1) this.c = [null, 0,  1, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // jump
        if(decodedOpCode.charAt(19) == 1) this.c = [null, 0, b1, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // bre/brz
        if(decodedOpCode.charAt(20) == 1) this.c = [null, 0, b2, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // brne/brnz
        if(decodedOpCode.charAt(21) == 1) this.c = [null, 0, b3, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // brg
        if(decodedOpCode.charAt(22) == 1) this.c = [null, 0, b4, 1,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  // brge
    }

    /**
     * Useful function to get pairs of control bits. It simplifies the top level design.
     * @param {string} target - One of the following options ['c4c5', 'c6c7', 'c8c9', 'c12c13']
     * @returns {string} 2 control bits in order 
     * @returns {Error} Invalid Control Group
     */
    get(target) {
        if(target == 'c4c5') return (String(this.c[4]) + String(this.c[5]));
        if(target == 'c6c7') return (String(this.c[6]) + String(this.c[7]));
        if(target == 'c8c9') return (String(this.c[8]) + String(this.c[9]));
        if(target == 'c12c13') return (String(this.c[12]) + String(this.c[13]));
        else throw new Error("Invalid Control Group: %s", target);
    }
};