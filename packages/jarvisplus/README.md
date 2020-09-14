# @terminus/jarvisplus

Generate typescript client/models from swagger.json file

## install

```
npm install --global @terminus/jarvisplus
```

## generate separate files for models and client

```
$ @terminus/jarvisplus models -f swagger.json > models.ts
$ @terminus/jarvisplus client MyApi "./models.ts" -f swagger.json > client.ts
```

## generate one file for both models and client

```
$ @terminus/jarvisplus bundle MyApi -f swagger.json > client.ts
```

## commands

- `models` - generate only models
- `client <name> [importFromFile]` - generate client with given `name` and import models from optional parameter `[importFromFile]` (default `"./model"`)
- `bundle <name>` - generate models and client in single run

## parameters

- `--file, -f` - input file swagger.json
- `-allowVoidParameterTypes, -a` - generate parameter types (query, body, formData, headers) for `void` values.
  Can apply to both models and client (see #)
