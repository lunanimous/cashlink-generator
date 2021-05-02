import { loadNimiq } from './CoreLoader';

export class Cashlink {
  public static async create(value: number): Promise<Cashlink> {
    await loadNimiq();
    const keyPair = Nimiq.KeyPair.derive(Nimiq.PrivateKey.generate());
    return new Cashlink(keyPair, keyPair.publicKey.toAddress(), value);
  }

  private _theme: number;
  private _messageBytes: Uint8Array = new Uint8Array(0);

  constructor(
    public keyPair: Nimiq.KeyPair,
    public address: Nimiq.Address,
    public value: number
  ) {
    this._theme = 0;
  }

  /**
   * https://github.com/nimiq/hub/blob/master/src/lib/Cashlink.ts#L296
   */
  render() {
    const buf = new Nimiq.SerialBuffer(
      /*key*/ this.keyPair.privateKey.serializedSize +
        /*value*/ 8 +
        /*message length*/ (this._messageBytes.byteLength || this._theme
          ? 1
          : 0) +
        /*message*/ this._messageBytes.byteLength +
        /*theme*/ (this._theme ? 1 : 0)
    );

    this.keyPair.privateKey.serialize(buf);
    buf.writeUint64(this.value);
    if (this._messageBytes.byteLength || this._theme) {
      buf.writeUint8(this._messageBytes.byteLength);
      buf.write(this._messageBytes);
    }
    if (this._theme) {
      buf.writeUint8(this._theme);
    }

    let result = Nimiq.BufferUtils.toBase64Url(buf);
    // replace trailing . by = because of URL parsing issues on iPhone.
    result = result.replace(/\./g, '=');
    // iPhone also has a problem to parse long words with more then 300 chars in a URL in WhatsApp
    // (and possibly others). Therefore we break the words by adding a ~ every 256 characters in long words.
    result = result.replace(/[A-Za-z0-9_]{257,}/g, (match) =>
      match.replace(/.{256}/g, '$&~')
    );

    return result;
  }

  async fund() {}
}
