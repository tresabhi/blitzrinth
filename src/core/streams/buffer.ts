export class BufferStream {
  public index = 0;
  constructor(public stream: Buffer) {}

  skip(size: number) {
    this.index += size;
  }
  read(size: number) {
    return this.stream.subarray(this.index, this.index + size);
  }
  consume(size: number) {
    const subarray = this.read(size);
    this.skip(size);

    return subarray;
  }

  readRemaining() {
    return this.read(Number.POSITIVE_INFINITY);
  }
  readRemainingLength() {
    return this.stream.length - this.index;
  }
  consumeRemaining() {
    return this.consume(Number.POSITIVE_INFINITY);
  }

  byte(size: number) {
    return this.consume(size);
  }

  ascii(size: number) {
    return this.consume(size).toString('ascii');
  }

  int8() {
    return this.consume(1).readInt8();
  }
  int16() {
    return this.consume(2).readInt16LE();
  }
  int32() {
    return this.consume(4).readInt32LE();
  }
  int64() {
    return this.consume(8).readBigInt64LE();
  }
  uint8() {
    return this.consume(1).readUInt8();
  }
  uint16() {
    return this.consume(2).readUInt16LE();
  }
  uint32() {
    return this.consume(4).readUInt32LE();
  }
  uint64() {
    return this.consume(8).readBigUInt64LE();
  }
  float() {
    return this.consume(4).readFloatLE();
  }

  boolean() {
    return this.consume(1).readUInt8() === 1;
  }
}