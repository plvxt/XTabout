const { ipcMain } = require('electron');
const os = require('os');
const { exec } = require('child_process');

async function getSystemInfo() {
    const cpuInfo = os.cpus()[0];
    
    const osVersion = await new Promise((resolve) => {
        exec('sw_vers -productName && sw_vers -productVersion && sw_vers -buildVersion', (error, stdout) => {
            if (error) {
                resolve('macOS (versió desconeguda)');
                return;
            }
            const [productName, productVersion, buildVersion] = stdout.trim().split('\n');
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
            
            resolve(`${versionName} ${productVersion} (${buildVersion})`);
        });
    });

    const [gpuInfo, memoryInfo, serialInfo] = await Promise.all([
        new Promise((resolve) => {
            exec('system_profiler SPDisplaysDataType', (error, stdout) => {
                let graphicsInfo = 'Gráficos no detectados';
                let vramInfo = '';
                let metalInfo = 'Metal no detectado';
                
                if (!error) {
                    const modelMatch = stdout.match(/Chipset Model: (.+)/i);
                    const vramMatch = stdout.match(/VRAM \(.*\): ([\d,]+) ([GM]B)/i);
                    const metalMatch = stdout.match(/Metal Support: ([^\n]+)/i);
                    
                    if (modelMatch) {
                        graphicsInfo = modelMatch[1];
                        if (vramMatch) {
                            vramInfo = ` (${vramMatch[1]}${vramMatch[2]} VRAM)`;
                        }
                    }

                    if (metalMatch) {
                        metalInfo = metalMatch[1];
                    }
                }
                
                resolve({graphics: graphicsInfo + vramInfo, metal: metalInfo});
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

    const [bootDrive, darwinVersion, smbiosModel, opencoreVersion] = await Promise.all([
        new Promise((resolve) => {
            exec('diskutil info / | grep "Volume Name" | sed "s/.*Volume Name: *//"', (error, stdout) => {
                if (error) {
                    resolve('No detectado');
                    return;
                }
                resolve(stdout.trim() || 'No detectado');
            });
        }),
        new Promise((resolve) => {
            exec('uname -r', (error, stdout) => {
                if (error) {
                    resolve('No detectado');
                    return;
                }
                resolve(stdout.trim());
            });
        }),
        new Promise((resolve) => {
            exec('system_profiler SPHardwareDataType | grep "Model Identifier"', (error, stdout) => {
                if (error) {
                    resolve('No detectado');
                    return;
                }
                const modelMatch = stdout.match(/Model Identifier: ([^\n]+)/i);
                resolve(modelMatch ? modelMatch[1] : 'No detectado');
            });
        }),
        new Promise((resolve) => {
            exec('nvram 4D1FDA02-38C7-4A6A-9CC6-4BCCA8B30102:opencore-version', (error, stdout) => {
                if (error) {
                    resolve('No detectado');
                    return;
                }
                const versionMatch = stdout.match(/REL-(\d+)/);
                if (versionMatch) {
                    const version = versionMatch[1];
                    const formattedVersion = `${version.slice(0, 1)}.${version.slice(1, 2)}.${version.slice(2)}`;
                    resolve(`${formattedVersion} Release`);
                } else {
                    resolve('No detectado');
                }
            });
        })
    ]);

    return {
        processor: `${cpuInfo.speed / 1000} GHz ${cpuInfo.model}`,
        graphics: gpuInfo.graphics,
        metal: gpuInfo.metal,
        memory: memoryInfo,
        serialNumber: serialInfo,
        osVersion: osVersion,
        bootDrive: bootDrive,
        darwinVersion: darwinVersion,
        smbiosModel: smbiosModel,
        opencore: opencoreVersion,
        expanded: false
    };
}

function setupSystemInfo() {
    ipcMain.handle('get-system-info', async () => {
        return await getSystemInfo();
    });
}

module.exports = { setupSystemInfo };