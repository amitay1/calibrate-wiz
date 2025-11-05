#!/usr/bin/env node

const { spawn } = require('child_process');
const { createServer } = require('vite');
const path = require('path');

let electronProcess = null;
let viteServer = null;

async function startVite() {
  console.log('🚀 Starting Vite dev server...');
  
  const vite = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    mode: 'development',
    server: {
      port: 8080,
    },
  });

  await vite.listen();
  viteServer = vite;
  
  console.log('✅ Vite dev server running on http://localhost:8080');
  return vite;
}

function startElectron() {
  console.log('⚡ Starting Electron...');
  
  electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:8080',
    },
  });

  electronProcess.on('close', () => {
    console.log('🛑 Electron closed');
    process.exit(0);
  });
}

async function main() {
  try {
    // Start Vite first
    await startVite();
    
    // Wait a bit for Vite to be ready
    setTimeout(() => {
      // Then start Electron
      startElectron();
    }, 2000);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🧹 Cleaning up...');
  
  if (electronProcess) {
    electronProcess.kill();
  }
  
  if (viteServer) {
    viteServer.close();
  }
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (electronProcess) {
    electronProcess.kill();
  }
  
  if (viteServer) {
    viteServer.close();
  }
  
  process.exit(0);
});

main();
