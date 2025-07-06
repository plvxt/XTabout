const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Config {
    constructor() {
        this.configDir = path.join(app.getPath('documents'), 'XTabout');
        this.configFile = path.join(this.configDir, 'config.json');
        this.customImageDir = path.join(this.configDir, 'images');
        this.defaultConfig = {
            language: 'es',
            title: 'Hackintosh',
            model: '2025',
            customImage: ''
        };
        this.initializeConfig();
    }

    initializeConfig() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
        if (!fs.existsSync(this.customImageDir)) {
            fs.mkdirSync(this.customImageDir, { recursive: true });
        }
        if (!fs.existsSync(this.configFile)) {
            fs.writeFileSync(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
        }
    }

    getConfig() {
        try {
            const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            return { ...this.defaultConfig, ...config };
        } catch (error) {
            console.error('Error al leer la configuración:', error);
            return this.defaultConfig;
        }
    }

    saveConfig(newConfig) {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(newConfig, null, 2));
            return true;
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
            return false;
        }
    }

    getCustomImagePath() {
        const config = this.getConfig();
        return config.customImage ? path.join(this.customImageDir, config.customImage) : null;
    }

    saveCustomImage(imagePath) {
        try {
            if (!imagePath.toLowerCase().endsWith('.png')) {
                throw new Error('Solo se permiten imágenes PNG');
            }

            const config = this.getConfig();
            const oldImage = config.customImage ? path.join(this.customImageDir, config.customImage) : null;

            if (oldImage && fs.existsSync(oldImage)) {
                fs.unlinkSync(oldImage);
            }

            const destPath = path.join(this.customImageDir, 'custom.png');
            fs.copyFileSync(imagePath, destPath);
            
            config.customImage = 'custom.png';
            this.saveConfig(config);
            
            return destPath;
        } catch (error) {
            console.error('Error al guardar la imagen personalizada:', error);
            throw error;
        }
    }

    deleteCustomImage() {
        try {
            const config = this.getConfig();
            const imagePath = config.customImage ? path.join(this.customImageDir, config.customImage) : null;

            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                config.customImage = '';
                this.saveConfig(config);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar la imagen personalizada:', error);
            throw error;
        }
    }
}

module.exports = new Config();