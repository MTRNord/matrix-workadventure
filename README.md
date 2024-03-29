# How to edit

All edits are done using <https://ldtk.io>.

After that we need to convert the exported files to tiled as workadventure has no direct support.

For that run:

```bash
tiled matrix_office/tiled/0001_level_0.tmx --export-map level_0.tmj
tiled matrix_office/tiled/0002_level_element.tmx --export-map level_element.tmj
```

Since however there is some missing data in those conversions we need to fix those up.

To do that first build the js file by running `npx tsc -p ./tsconfig_util.json`.

After that you can fixup the data using:

```bash
node ./dist_utils/postprocess_map_export.js ./matrix_office.ldtk
```

If you want to view the map run `npm run dev`.
