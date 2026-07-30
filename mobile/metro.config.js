// Metro config: watch the repo root so the app can require the shared
// /locales JSON files directly from the web project — one source of truth
// for translations instead of a copied set that drifts.

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.join(workspaceRoot, "locales")];

module.exports = config;
