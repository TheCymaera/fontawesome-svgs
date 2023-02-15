const inputPath = "icons";
const outputPath = "dst";

// read files
const svgList: Map<string, Map<string, Map<string, string>>> = new Map;
const promises: Promise<void>[] = [];
for await (const versionEntry of Deno.readDir(inputPath)) {
	if (!versionEntry.isDirectory) continue;

	const version = versionEntry.name;
	const versionPath = inputPath + "/" + version;

	svgList.set(version, new Map);

	for await (const iconSetEntry of Deno.readDir(versionPath)) {
		if (!iconSetEntry.isDirectory) continue;

		const iconSet = iconSetEntry.name;
		const iconSetPath = versionPath + "/" + iconSet;

		svgList.get(version)!.set(iconSet, new Map);
		
		for await (const iconEntry of Deno.readDir(iconSetPath)) {
			if (!iconEntry.isFile) continue;

			const icon = iconEntry.name
			const iconPath = iconSetPath + "/" + iconEntry.name;

			promises.push(Deno.readTextFile(iconPath).then((text) => {
				svgList.get(version)!.get(iconSet)!.set(icon, text);
			}));
		}
	}
}
await Promise.all(promises);

// generate files
const files = new Map<string, string>();
const filePath = outputPath + "/index.js";
const declarationPath = outputPath + "/index.d.ts";

let declarationText = `// Icons provided by Font Awesome at https://fontawesome.com/\n`;
let fileText = `// Icons provided by Font Awesome at https://fontawesome.com/
const i = (v, p) => \`<svg style="fill: currentColor; height: 1em; display: inline-block; vertical-align: text-bottom;" xmlns="http://www.w3.org/2000/svg" viewBox="\${v}"><path d="\${p}"/></svg>\`
`;




for (const [version, iconSets] of svgList) {
	for (const [iconSet, icons] of iconSets) {
		for (const [icon, svg] of icons) {
			const iconCamelCase = icon
			.replace(/\.svg$/, "")
			.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
			.replaceAll("-", "");

			const svgCleaned = svg
			.replace(/<!--[\s\S]*?-->/g, "");

			const v = svgCleaned.match(/viewBox="([^"]+)"/)![1];
			const p = svgCleaned.match(/d="([^"]+)"/)![1];
			
			const variableName = `${version}_${iconSet}_${iconCamelCase}`;

			fileText += `export const ${variableName} = i(\`${v}\`,\`${p}\`);\n`;
			declarationText += `export const ${variableName}: string;\n`;
		}
	}
}

files.set(filePath, fileText);
files.set(declarationPath, declarationText);


// write files
for (const [path, text] of files) {
	await Deno.mkdir(path.split("/").slice(0, -1).join("/"), { recursive: true });
	await Deno.writeTextFile(path, text);
}