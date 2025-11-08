#!/usr/bin/env node

import { build } from 'vite';
import { build as electronBuild } from 'electron-builder';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildApp() {
  try {
    console.log('🔨 Building React app for Electron...');
    
    // Build with Vite for Electron
    await build({
      configFile: path.resolve(__dirname, '../vite.config.ts'),
      mode: 'production',
      base: './',
      build: {
        outDir: 'dist',
      },
    });
    
    console.log('✅ React app built successfully');
    
    console.log('📦 Building Electron app...');
    
    // Build Electron
    await electronBuild({
      config: path.resolve(__dirname, '../electron-builder.yml'),
      projectDir: path.resolve(__dirname, '..'),
    });
    
    console.log('✅ Electron app built successfully!');
    console.log('📁 Output in ./release directory');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildApp();
