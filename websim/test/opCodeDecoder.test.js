const {OpCodeDecoder} = require('../opCodeDecoder');

const globalOpCodeDecoder = new OpCodeDecoder();

// Control signal tests
test('Noop test', () => {
    var opCode = '0x0000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.noop).toBe(1);
});

test('InputC test', () => {
    var opCode = '0x1000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.inputc).toBe(1);
});

test('InputCF test', () => {
    var opCode = '0x1100';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.inputcf).toBe(1);
});

test('InputD test', () => {
    var opCode = '0x1200';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.inputd).toBe(1);
});

test('InputDF test', () => {
    var opCode = '0x1300';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.inputdf).toBe(1);
});

test('Move test', () => {
    var opCode = '0x2000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.move).toBe(1);
});

test('Loadi/Loadp test', () => {
    var opCode = '0x3000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.loadi).toBe(1);
});

test('Add test', () => {
    var opCode = '0x4000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.add).toBe(1);
});

test('Addi test', () => {
    var opCode = '0x5000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.addi).toBe(1);
});

test('Sub test', () => {
    var opCode = '0x6000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.sub).toBe(1);
});

test('Subi test', () => {
    var opCode = '0x7000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.subi).toBe(1);
});

test('Load test', () => {
    var opCode = '0x8000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.load).toBe(1);
});

test('Loadf test', () => {
    var opCode = '0x9000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.loadf).toBe(1);
});

test('Store test', () => {
    var opCode = '0xA000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.store).toBe(1);
});

test('Storef test', () => {
    var opCode = '0xB000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.storef).toBe(1);
});

test('Shiftl test', () => {
    var opCode = '0xC000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.shiftl).toBe(1);
});

test('Shiftr test', () => {
    var opCode = '0xC100';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.shiftr).toBe(1);
});

test('Cmp test', () => {
    var opCode = '0xD000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.cmp).toBe(1);
});

test('Jump test', () => {
    var opCode = '0xE000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.jump).toBe(1);
});

test('Bre test', () => {
    var opCode = '0xF000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.bre).toBe(1);
});

test('Brne test', () => {
    var opCode = '0xF100';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.brne).toBe(1);
});

test('Brg test', () => {
    var opCode = '0xF200';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.brg).toBe(1);
});

test('Brge test', () => {
    var opCode = '0xF300';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.brge).toBe(1);
});


// Ry tests
test('Rx test 0', () => {
    var opCode = '0x0F00';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.rx).toBe('c');
});

test('Rx test 1', () => {
    var opCode = '0x0000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.rx).toBe('0');
});


// Ry tests
test('Ry test 0', () => {
    var opCode = '0x0F00';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.ry).toBe('3');
});

test('Ry test 1', () => {
    var opCode = '0x0000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.ry).toBe('0');
});


// Output String tests
test('Output String 0', () => {
    var opCode = '0x0000';
    globalOpCodeDecoder.getDecodedOpCode(opCode)
    expect(globalOpCodeDecoder.output).toBe('100000000000000000000000000');
});