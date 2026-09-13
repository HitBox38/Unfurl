const VERSION_PATTERN = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*))*))?(?:\+[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?$/;

function parseVersion(version: string) {
  const match = VERSION_PATTERN.exec(version);
  if (!match) throw new Error("Invalid version");
  return { core: match.slice(1, 4).map(BigInt), pre: match[4]?.split(".") };
}

export function isNewerVersion(candidate: string, current: string): boolean {
  const next = parseVersion(candidate);
  const installed = parseVersion(current);
  for (let index = 0; index < 3; index++) {
    if (next.core[index] !== installed.core[index]) {
      return next.core[index] > installed.core[index];
    }
  }
  if (!next.pre || !installed.pre) return Boolean(installed.pre && !next.pre);
  for (let index = 0; index < Math.max(next.pre.length, installed.pre.length); index++) {
    const a = next.pre[index];
    const b = installed.pre[index];
    if (a === b) continue;
    if (a === undefined || b === undefined) return b === undefined;
    const aNumeric = /^\d+$/.test(a);
    const bNumeric = /^\d+$/.test(b);
    if (aNumeric && bNumeric) return BigInt(a) > BigInt(b);
    if (aNumeric !== bNumeric) return bNumeric;
    return a > b;
  }
  return false;
}
