import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA, POI } from './constants';

export async function circleFlags(production: boolean) {
  const flags = await readdir(`${DATA}/${POI.flags}`);
  const changes = await Promise.all(
    flags
      .filter(
        (flag) =>
          flag.startsWith('flag_profile-stat_') &&
          !flag.endsWith('@2x.packed.webp.dvpl'),
      )
      .map(async (flag) => {
        const image = sharp(await readDVPLFile(`${DATA}/${POI.flags}/${flag}`));
        const content = (
          await image.trim({ threshold: 100 }).toBuffer()
        ).toString('base64');
        const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

        return {
          content,
          encoding: 'base64',
          path: `flags/circle/${name}.webp`,
        } satisfies FileChange;
      }),
  );

  await commitAssets('circle flags', changes, production);
}
