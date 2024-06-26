import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA, POI } from './constants';

export async function camouflageIcons(production: boolean) {
  console.log('Building camouflage icons...');
  const content = await readDVPLFile(
    `${DATA}/${POI.defaultCamoIcon.replace('.webp', '.packed.webp.dvpl')}`,
  ).then((content) => content.toString('base64'));
  const changes: FileChange[] = [
    {
      content,
      encoding: 'base64',
      path: 'icons/camo.webp',
    },
  ];

  await commitAssets('camo icons', changes, production);
}
