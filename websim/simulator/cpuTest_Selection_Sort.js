import {CPU} from "./cpu.js"
//import {performance} from "perf_hooks"

let cpu = new CPU();
cpu.setup();

cpu.iMem.setWriteEnable(1);
cpu.iMem.setRegister(0, '0011000000000000');  // LOADI  A, 0
cpu.iMem.setRegister(1, '1010000000000101');  // STORE  [i], A
cpu.iMem.setRegister(2, '1000110000000100');  // LOAD   D, [last]
cpu.iMem.setRegister(3, '1101001100000000');  // CMP    A, D 
cpu.iMem.setRegister(4, '1111001100010100');  // BRGE   End
cpu.iMem.setRegister(5, '0010100000000000');  // MOVE   C, A
cpu.iMem.setRegister(6, '0010010000000000');  // MOVE   B, A
cpu.iMem.setRegister(7, '0101010000000001');  // ADDI   B, 1
cpu.iMem.setRegister(8, '1000110000000100');  // LOAD   D, [last]
cpu.iMem.setRegister(9, '1101011100000000');  // CMP    B, D
cpu.iMem.setRegister(10, '1111001000000111');  // BRG    Swap
cpu.iMem.setRegister(11, '1001000100000000');  // LOADF  A, [array + B]
cpu.iMem.setRegister(12, '1001111000000000');  // LOADF  D, [array + C]
cpu.iMem.setRegister(13, '1101110000000000');  // CMP    D, A
cpu.iMem.setRegister(14, '1111001100000001');  // BRGE   Jinc
cpu.iMem.setRegister(15, '0010100100000000');  // MOVE   C, B
cpu.iMem.setRegister(16, '0101010000000001');  // ADDI   B, 1
cpu.iMem.setRegister(17, '1110000011110110');  // JUMP   Inner
cpu.iMem.setRegister(18, '1000000000000101');  // LOAD   A, [i]
cpu.iMem.setRegister(19, '1001010000000000');  // LOADF  B, [array + A]
cpu.iMem.setRegister(20, '1001111000000000');  // LOADF  D, [array + C]
cpu.iMem.setRegister(21, '1011110000000000');  // STOREF [array + A], D
cpu.iMem.setRegister(22, '1011011000000000');  // STOREF [array + C], B
cpu.iMem.setRegister(23, '0101000000000001');  // ADDI   A, 1
cpu.iMem.setRegister(24, '1110000011101000');  // JUMP   Outer
cpu.iMem.setRegister(25, '0000000000000000');  // NOOP
cpu.iMem.setWriteEnable(0);

// Initialize dmem
cpu.dMem.setWriteEnable(1);
cpu.dMem.setRegister(0, '00000010');  // Array
cpu.dMem.setRegister(1, '00000011');
cpu.dMem.setRegister(2, '00000100');
cpu.dMem.setRegister(3, '00000001');
cpu.dMem.setRegister(4, '00000011');  // last
cpu.dMem.setWriteEnable(0);

let numCycles = 119;

let dMemResult0 = cpu.dMem.getRegister(0);
let dMemResult1 = cpu.dMem.getRegister(1);
let dMemResult2 = cpu.dMem.getRegister(2);
let dMemResult3 = cpu.dMem.getRegister(3);

console.log('Unsorted Array: '+dMemResult0+', '+dMemResult1+', '+dMemResult2+', '+dMemResult3);

let t0 = performance.now();
for(let i=0; i<numCycles; i++) {
    cpu.singleCycle();
}
let t1 = performance.now();

dMemResult0 = cpu.dMem.getRegister(0);
dMemResult1 = cpu.dMem.getRegister(1);
dMemResult2 = cpu.dMem.getRegister(2);
dMemResult3 = cpu.dMem.getRegister(3);

console.log('  Sorted Array: '+dMemResult0+', '+dMemResult1+', '+dMemResult2+', '+dMemResult3);
console.log('===============');
console.log('Total execution time was: ' + (t1-t0) + ' ms');
console.log('Average time per instruction: ' + (t1-t0)/numCycles + ' ms');
console.log('Average "frequency": ' + numCycles/(t1-t0) + ' KHz');