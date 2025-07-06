const { ipcMain } = require('electron');
const os = require('os');
const { exec } = require('child_process');

async function getSystemInfo() {
    const cpuInfo = os.cpus()[0];
    
    const osVersion = await new Promise((resolve) => {
        exec('sw_vers -productName && sw_vers -productVersion', (error, stdout) => {
            if (error) {
                resolve('macOS (versió desconeguda)');
                return;
            }
            const [productName, productVersion] = stdout.trim().split('\n');
            const majorVersion = parseInt(productVersion.split('.')[0]);
            let versionName = '';
            
            switch (majorVersion) {
                case 10:
                    versionName = 'Catalina';
                    break;
                case 11:
                    versionName = 'Big Sur';
                    break;
                case 12:
                    versionName = 'Monterey';
                    break;
                case 13:
                    versionName = 'Ventura';
                    break;
                case 14:
                    versionName = 'Sonoma';
                    break;
                case 15:
                    versionName = 'Sequoia';
                    break;
                case 16:
                case 26:
                    versionName = 'Tahoe';
                    break;
                default:
                    versionName = 'macOS';
            }
            
            resolve(`${versionName} ${productVersion}`);
        });
    });

    const [gpuInfo, memoryInfo, serialInfo] = await Promise.all([
        new Promise((resolve) => {
            exec('system_profiler SPDisplaysDataType', (error, stdout) => {
                let graphicsInfo = 'Gráficos no detectats';
                let vramInfo = '';
                
                if (!error) {
                    const modelMatch = stdout.match(/Chipset Model: (.+)/i);
                    const vramMatch = stdout.match(/VRAM \(.*\): ([\d,]+) ([GM]B)/i);
                    
                    if (modelMatch) {
                        graphicsInfo = modelMatch[1];
                        if (vramMatch) {
                            vramInfo = ` (${vramMatch[1]}${vramMatch[2]} VRAM)`;
                        }
                    }
                }
                
                resolve(graphicsInfo + vramInfo);
            });
        }),
        new Promise((resolve) => {
            exec('system_profiler SPMemoryDataType', (error, stdout) => {
                if (error) {
                    resolve(`${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`);
                    return;
                }
                
                const speedMatch = stdout.match(/Speed: ([\d,]+) MHz/i);
                const typeMatch = stdout.match(/Type: ([^\n]+)/i);
                const totalMatch = stdout.match(/Memory: ([\d,]+) GB/i);
                
                let memoryInfo = `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
                if (speedMatch && typeMatch) {
                    memoryInfo = `${totalMatch ? totalMatch[1] : memoryInfo} ${typeMatch[1]} @ ${speedMatch[1]} MHz`;
                }
                
                resolve(memoryInfo);
            });
         }),
        new Promise((resolve) => {
            exec('system_profiler SPHardwareDataType', (error, stdout) => {
                if (error) {
                    resolve(os.hostname());
                    return;
                }
                
                const serialMatch = stdout.match(/Serial Number \(system\): ([^\n]+)/i);
                resolve(serialMatch ? serialMatch[1] : os.hostname());
            });
        })
    ]);

    return {
        processor: `${cpuInfo.speed / 1000} GHz ${cpuInfo.model}`,
        graphics: gpuInfo,
        memory: memoryInfo,
        serialNumber: serialInfo,
        osVersion: osVersion
    };
}

function setupSystemInfo() {
    ipcMain.handle('get-system-info', async () => {
        return await getSystemInfo();
    });
}

module.exports = { setupSystemInfo };