const EXT_COLOR: Record<string, string> = {
  csv: "var(--chart-2)",
  pdf: "var(--chart-4)",
};

export function fileExt(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileTypeColor(name: string): string {
  return EXT_COLOR[fileExt(name)] ?? "var(--chart-6)";
}
