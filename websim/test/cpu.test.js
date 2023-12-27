const {CPU} = require('../cpu');

const cpu = new CPU();

test('Simple Test', () => {
    cpu.setup();
    cpu.singleCycle();
});

test('Test Add', () => {
    cpu.setup();
    cpu.iMem.setRegister(0, '');
    cpu.singleCycle();
});