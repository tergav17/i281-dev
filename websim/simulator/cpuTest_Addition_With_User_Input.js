import {CPU} from "./cpu.js"
import {performance} from "perf_hooks"

let cpu = new CPU();
cpu.setup();

cpu.iMem.setWriteEnable(1);
cpu.iMem.setRegister(0, '1000000000000000');  // LOAD   A, [x]
cpu.iMem.setRegister(1, '0001001000000001');  // INPUTD [y]
cpu.iMem.setRegister(2, '1000010000000001');  // LOAD   B, [y]
cpu.iMem.setRegister(3, '0100000100000000');  // ADD    A, B 
cpu.iMem.setRegister(4, '1010000000000010');  // STORE  [result], A
cpu.iMem.setWriteEnable(0);
// Initialize dmem
cpu.dMem.setWriteEnable(1);
cpu.dMem.setRegister(0, '00000010');
cpu.dMem.setWriteEnable(0);
// Initialize switches
cpu.switchInput = '10000000';


let numCycles = 5;

let t0 = performance.now();
for(let i=0; i<numCycles; i++) {
    cpu.singleCycle();
}
let t1 = performance.now();

let dMemResult = cpu.dMem.getRegister(2);
console.log('dmemResult: ' + dMemResult);
console.log('===============');
console.log('Total execution time was: ' + (t1-t0) + ' ms');
console.log('Average time per instruction: ' + (t1-t0)/numCycles + ' ms');
console.log('Average "frequency": ' + numCycles/(t1-t0) + ' KHz');