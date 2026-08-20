import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

const TauriConfigSchema = z.object({
  $schema: z.string().optional(),
  productName: z.literal("ChessForge"),
  version: z.literal("1.0.0"),
  identifier: z.literal("com.chessforge.app"),
  build: z.object({
    beforeDevCommand: z.string(),
    devUrl: z.string(),
    beforeBuildCommand: z.string(),
    frontendDist: z.string(),
  }),
  app: z.object({
    windows: z.array(
      z.object({
        title: z.string(),
        width: z.number(),
        height: z.number(),
        minWidth: z.number(),
        minHeight: z.number(),
        resizable: z.boolean(),
        fullscreen: z.boolean(),
      })
    ),
    security: z.object({
      csp: z.string(),
    }),
  }),
  bundle: z.object({
    active: z.literal(true),
    targets: z.union([z.literal("all"), z.array(z.string())]),
    icon: z.array(z.string()),
    publisher: z.string().min(1),
    copyright: z.string().min(1),
    category: z.string().min(1),
    shortDescription: z.string().min(1),
    longDescription: z.string().min(1),
    windows: z.object({
      nsis: z.object({
        installMode: z.enum(["currentUser", "perMachine", "both"]),
      }),
      wix: z.object({
        language: z.string(),
      }),
    }),
  }),
});

describe("Phase 11 · Sprint 02: Windows Packaging & Installer Invariants", () => {
  const rootDir = path.resolve(__dirname, "../../");
  const tauriConfigPath = path.join(rootDir, "src-tauri/tauri.conf.json");
  const packageJsonPath = path.join(rootDir, "package.json");
  const cargoTomlPath = path.join(rootDir, "src-tauri/Cargo.toml");
  const packagingGuidePath = path.join(
    rootDir,
    "docs/release/windows_packaging_guide.md"
  );

  const tauriConfigRaw = fs.readFileSync(tauriConfigPath, "utf-8");
  const tauriConfig = JSON.parse(tauriConfigRaw);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const cargoToml = fs.readFileSync(cargoTomlPath, "utf-8");

  it("TC-PKG-01: validates tauri.conf.json bundle activation and target configuration", () => {
    expect(tauriConfig.bundle).toBeDefined();
    expect(tauriConfig.bundle.active).toBe(true);
    expect(tauriConfig.bundle.targets).toBe("all");
  });

  it("TC-PKG-02: verifies NSIS & WiX Windows packaging options", () => {
    expect(tauriConfig.bundle.windows).toBeDefined();
    expect(tauriConfig.bundle.windows.nsis.installMode).toBe("currentUser");
    expect(tauriConfig.bundle.windows.wix.language).toBe("en-US");
  });

  it("TC-PKG-03: verifies synchronized product metadata and descriptive fields", () => {
    expect(tauriConfig.productName).toBe("ChessForge");
    expect(tauriConfig.version).toBe("1.0.0");
    expect(tauriConfig.identifier).toBe("com.chessforge.app");
    expect(tauriConfig.bundle.publisher).toBe("ChessForge Team");
    expect(tauriConfig.bundle.copyright).toContain("ChessForge Team");
    expect(tauriConfig.bundle.category).toBe("Game");
    expect(tauriConfig.bundle.shortDescription).toBeTruthy();
    expect(tauriConfig.bundle.longDescription).toBeTruthy();

    expect(packageJson.name).toBe("chessforge");
    expect(packageJson.version).toBe("1.0.0");
    expect(cargoToml).toContain('name = "chessforge"');
    expect(cargoToml).toContain('version = "1.0.0"');
  });

  it("TC-PKG-04: verifies that all referenced application icons exist on disk", () => {
    expect(Array.isArray(tauriConfig.bundle.icon)).toBe(true);
    expect(tauriConfig.bundle.icon.length).toBeGreaterThanOrEqual(4);

    for (const iconRelPath of tauriConfig.bundle.icon) {
      const fullIconPath = path.join(rootDir, "src-tauri", iconRelPath);
      expect(
        fs.existsSync(fullIconPath),
        `Icon missing at: ${fullIconPath}`
      ).toBe(true);
      const stat = fs.statSync(fullIconPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it("TC-PKG-05: verifies Content Security Policy and offline execution boundary", () => {
    const csp = tauriConfig.app.security.csp;
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("http://*");
    expect(csp).not.toContain("https://*");
  });

  it("TC-PKG-07: verifies Tauri build and dev helper scripts in package.json", () => {
    expect(packageJson.scripts["tauri"]).toBe("tauri");
    expect(packageJson.scripts["tauri:build"]).toBe("tauri build");
    expect(packageJson.scripts["tauri:dev"]).toBe("tauri dev");
  });

  it("TC-PKG-09: validates tauri.conf.json against strict Zod runtime schema", () => {
    const parseResult = TauriConfigSchema.safeParse(tauriConfig);
    expect(parseResult.success).toBe(true);
    if (!parseResult.success) {
      console.error(parseResult.error.format());
    }
  });

  it("TC-PKG-10: verifies presence and completeness of Windows Packaging Guide", () => {
    expect(fs.existsSync(packagingGuidePath)).toBe(true);
    const guideContent = fs.readFileSync(packagingGuidePath, "utf-8");
    expect(guideContent).toContain("ChessForge v1.0.0");
    expect(guideContent).toContain("NSIS");
    expect(guideContent).toContain("WiX");
    expect(guideContent).toContain("npm run tauri:build");
  });
});
