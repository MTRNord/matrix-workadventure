import fs from "node:fs";
import path from "node:path";


const files = await fs.promises.opendir(".");
const ldtk_file = process.argv[2]

const teleport_areas_raw = await fs.promises.readFile("./teleport_areas.json", { encoding: "utf-8" })
const teleport_areas = JSON.parse(teleport_areas_raw)

for await (const file of files) {
    if (file.isFile() && file.name.endsWith(".tmj")) {
        const tiled_file = path.join(file.path, file.name)
        const level_name = file.name.replace(".tmj", "").replace(/^[0-9]{4}/, "")
        const tiled_clean_file = path.join(file.path, `${level_name}.tmj`)
        // Parse the map
        const ldtk_map_raw = await fs.promises.readFile(ldtk_file, { encoding: "utf-8" })
        const ldtk_map = JSON.parse(ldtk_map_raw);
        const tiled_map_raw = await fs.promises.readFile(tiled_file, { encoding: "utf-8" })
        const tiled_map = JSON.parse(tiled_map_raw);

        const ldtk_layer = ldtk_map.levels.find((x: any) => x.identifier === level_name)

        for (const layer of tiled_map.layers) {
            if (layer.type == "objectgroup") {
                for (const object of layer.objects) {
                    if (!object.ldtk_fixed) {
                        // Yes this really has to be backwards ^^
                        const entity_id = object.properties.find((x: any) => x.name === "entity_id").value
                        // Find the same entity over in the ldtk mapfile
                        const entities = ldtk_layer.layerInstances.find((x: any) => x.__type === "Entities")

                        for (const entity of entities.entityInstances) {
                            if (entity.fieldInstances.find((y: any) => y.__identifier === "entity_id").__value === entity_id) {
                                object.width = entity.width
                                object.height = entity.height
                                object.ldtk_fixed = true
                            }
                        }
                    }
                }
            }
            if (layer.type == "tilelayer" && !layer.ldtk_fixed) {
                const teleport_area = teleport_areas.areas.find((x: any) => x.layer_name === layer.name)
                if (teleport_area) {
                    if (!layer.properties) {
                        layer.properties = []
                    }
                    layer.properties.push({
                        "name": "exitUrl",
                        "type": "string",
                        "value": teleport_area.exitUrl
                    })
                    layer.ldtk_fixed = true
                }
            }
        }

        // Write the file back
        await fs.promises.writeFile(tiled_clean_file, JSON.stringify(tiled_map), { encoding: "utf-8" })
    }
}