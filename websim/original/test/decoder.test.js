const {Decoder} = require('../decoder');

const globalDecoder = new Decoder(4);

test('Set control valid: 0x0', () => {
    globalDecoder.setControl(0x0);
});

test('Set state invalid: 0x6', () => {
    expect(globalDecoder.setControl(0x6)).toThrow('Invalid decoder control: 6');
})

test('Get output: 0x0', () => {
    globalDecoder.setControl(0x0);
    expect(globalDecoder.getOutputString()).toBe('1000');
})

test('Get output: 0x1', () => {
    globalDecoder.setControl(0x1);
    expect(globalDecoder.getOutputString()).toBe('0100');
})

test('Get output: 0x2', () => {
    globalDecoder.setControl(0x2);
    expect(globalDecoder.getOutputString()).toBe('0010');
})

test('Get output: 0x3', () => {
    globalDecoder.setControl(0x3);
    expect(globalDecoder.getOutputString()).toBe('0001');
})

test('Get output: 0x4', () => {
    globalDecoder.setControl(0x4);
    expect(globalDecoder.getOutputString()).toThrow('');
})

test('Not power of two', () => {
    expect(new Decoder(0x3)).toThrow('Decoder size is not a power of two');
})

test('Get output at location: 0', () => {
    globalDecoder.setControl(0x0);
    expect(globalDecoder.getOutputAtLocation(0)).toBe(1);
})

test('Get output at location: 1', () => {
    globalDecoder.setControl(0x0);
    expect(globalDecoder.getOutputAtLocation(1)).toBe(0);
})