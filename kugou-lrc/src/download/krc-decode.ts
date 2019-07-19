import { promisify } from 'util';
import { InputType, unzip as originUnzip } from 'zlib';

const unzip = promisify<InputType, Buffer>(originUnzip);

const KRC_ENCODE_KEY = Buffer.from(
  Uint8Array.from([64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105])
);

// https://github.com/kangkang520/kugou-lyric/blob/master/src/util.ts#L23-L31
async function decodeKrc(content: Buffer): Promise<Buffer> {
  const buffer = Buffer.alloc(content.length - 4);
  for (let i = 4; i < content.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    buffer[i - 4] = content[i] ^ KRC_ENCODE_KEY[(i - 4) % 16];
  }
  return unzip(buffer);
}

export { decodeKrc };
