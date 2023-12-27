import {CPU} from "./cpu.js"
import {performance} from "perf_hooks"

let cpu = new CPU();
cpu.setup();

cpu.iMem.setWriteEnable(1);
cpu.iMem.setRegister(0, '0011010000000000');  // LOADI B, 0
cpu.iMem.setRegister(1, '0011000000000001');  // LOADI A, 1
cpu.iMem.setRegister(2, '0011110000000101');  // LOADI D, 5
cpu.iMem.setRegister(3, '1101001100000000');  // CMP   A, D
cpu.iMem.setRegister(4, '1111001000000011');  // BRG   END
cpu.iMem.setRegister(5, '0100010000000000');  // ADD   B, A
cpu.iMem.setRegister(6, '0101000000000001');  // ADDI  A, 1
cpu.iMem.setRegister(7, '1110000011111011');  // JUMP  Loop
cpu.iMem.setRegister(8, '1010010000000010');  // STORE [sum], B
cpu.iMem.setWriteEnable(0);

let numCycles = 31;

let t0 = performance.now();
for(let i=0; i<numCycles; i++) {
    cpu.singleCycle();
    console.log(cpu.registers.getRegister(1));
}
let t1 = performance.now();

let regA = cpu.registers.getRegister(0);
let regB = cpu.registers.getRegister(1);
let regD = cpu.registers.getRegister(3);
let dMemResult = cpu.dMem.getRegister(2);
console.log('regA: ' + regA);
console.log('regB: ' + regB);
console.log('regD: ' + regD);
console.log('dmemResult: ' + dMemResult);
console.log('===============');
console.log('Total execution time was: ' + (t1-t0) + ' ms');
console.log('Average time per instruction: ' + (t1-t0)/numCycles + ' ms');
console.log('Average "frequency": ' + numCycles/(t1-t0) + ' KHz');