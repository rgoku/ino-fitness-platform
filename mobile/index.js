import { registerRootComponent } from 'expo';
import App from './App';

// Custom root entry — used so the workspace-hoisted `node_modules/expo/AppEntry.js`
// (which assumes a non-monorepo layout) is bypassed.
registerRootComponent(App);
