import esbuild, { analyzeMetafile } from "esbuild"

const sharedSettings = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    write: true,
    outdir: "build",
    metafile: true,
    sourcemap: true,
}

const esm = await esbuild.build({
    ...sharedSettings,
    format: "esm",
})

console.log(await analyzeMetafile(esm.metafile))

const cjs = await esbuild.build({
    ...sharedSettings,
    format: "cjs",
    entryNames: "index-cjs"
})

console.log(await analyzeMetafile(cjs.metafile))
