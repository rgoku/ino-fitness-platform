/**
 * Metro config for the mobile workspace.
 * Tells Metro about the npm-workspaces hoisted root so it can resolve
 * `expo`, `react-native`, etc. from ../node_modules.
 * Reference: https://docs.expo.dev/guides/monorepos/
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const rootNodeModules = path.resolve(workspaceRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

// Watch the hoisted root node_modules — but NOT the rest of the monorepo
// (trainer-app, ino-platform, etc. have permission issues and aren't needed).
config.watchFolders = [rootNodeModules];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  rootNodeModules,
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
