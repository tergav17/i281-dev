import {CPU} from "./cpu.js"
import {performance} from "perf_hooks"

let cpu = new CPU();
cpu.setup();

cpu.iMem.setWriteEnable(1);
cpu.iMem.setRegister(0, '0011000000000000');  // LOADI  A, 0
cpu.iMem.setRegister(1, '1000110000001000');  // LOAD   D, [last]
cpu.iMem.setRegister(2, '0011010000000000');  // LOADI  B, 0
cpu.iMem.setRegister(3, '1101001100000000');  // CMP    A, D 
cpu.iMem.setRegister(4, '1111001100001110');  // BRGE   End
cpu.iMem.setRegister(5, '1000110000001000');  // LOAD   D, [last]
cpu.iMem.setRegister(6, '0110110000000000');  // SUB    D, A
cpu.iMem.setRegister(7, '1101011100000000');  // CMP    B, D
cpu.iMem.setRegister(8, '1111001100001000');  // BRGE   Iinc
cpu.iMem.setRegister(9, '1001100100000000');  // LOADF  C, [array+B]
cpu.iMem.setRegister(10, '1001110100000001');  // LOADF  D, [array+B+1]
cpu.iMem.setRegister(11, '1101111000000000');  // CMP    D, C
cpu.iMem.setRegister(12, '1111001100000010');  // BRGE   Jinc
cpu.iMem.setRegister(13, '1011110100000000');  // STOREF [array+B], D
cpu.iMem.setRegister(14, '1011100100000001');  // STOREF [array+B+1], C
cpu.iMem.setRegister(15, '0101010000000001');  // ADDI   B, 1
cpu.iMem.setRegister(16, '1110000011110100');  // JUMP   Inner
cpu.iMem.setRegister(17, '0101000000000001');  // ADDI   A, 1
cpu.iMem.setRegister(18, '1110000011101110');  // JUMP   Outer
cpu.iMem.setRegister(19, '0000000000000000');  // NOOP
cpu.iMem.setWriteEnable(0);

// Initialize dmem
cpu.dMem.setWriteEnable(1);
cpu.dMem.setRegister(0, '00000111');  // Array
cpu.dMem.setRegister(1, '00000011');
cpu.dMem.setRegister(2, '00000010');
cpu.dMem.setRegister(3, '00000001');
cpu.dMem.setRegister(4, '00000110');
cpu.dMem.setRegister(5, '00000100');
cpu.dMem.setRegister(6, '00000101');
cpu.dMem.setRegister(7, '00001000');
cpu.dMem.setRegister(8, '00000111');  // last
cpu.dMem.setWriteEnable(0);

let numCycles = 185;

let dMemResult0 = cpu.dMem.getRegister(0);
let dMemResult1 = cpu.dMem.getRegister(1);
let dMemResult2 = cpu.dMem.getRegister(2);
let dMemResult3 = cpu.dMem.getRegister(3);
let dMemResult4 = cpu.dMem.getRegister(4);
let dMemResult5 = cpu.dMem.getRegister(5);
let dMemResult6 = cpu.dMem.getRegister(6);
let dMemResult7 = cpu.dMem.getRegister(7);

console.log('Unsorted Array: '+dMemResult0+', '+dMemResult1+', '+dMemResult2+', '+dMemResult3+', '+dMemResult4+', '+dMemResult5+', '+dMemResult6+', '+dMemResult7);

let t0 = performance.now();
for(let i=0; i<numCycles; i++) {
    cpu.singleCycle();
}
let t1 = performance.now();

dMemResult0 = cpu.dMem.getRegister(0);
dMemResult1 = cpu.dMem.getRegister(1);
dMemResult2 = cpu.dMem.getRegister(2);
dMemResult3 = cpu.dMem.getRegister(3);
dMemResult4 = cpu.dMem.getRegister(4);
dMemResult5 = cpu.dMem.getRegister(5);
dMemResult6 = cpu.dMem.getRegister(6);
dMemResult7 = cpu.dMem.getRegister(7);

console.log('  Sorted Array: '+dMemResult0+', '+dMemResult1+', '+dMemResult2+', '+dMemResult3+', '+dMemResult4+', '+dMemResult5+', '+dMemResult6+', '+dMemResult7);
console.log('===============');
console.log('Total execution time was: ' + (t1-t0) + ' ms');
console.log('Average time per instruction: ' + (t1-t0)/numCycles + ' ms');
console.log('Average "frequency": ' + numCycles/(t1-t0) + ' KHz');