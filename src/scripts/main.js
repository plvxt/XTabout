const { ipcRenderer } = window.require('electron');
let currentEditingElement = null;
let originalSerialNumber = '';
let isHidden = false;
let isExpanded = false;

    function loadConfig() {
        const config = ipcRenderer.sendSync('get-config');
        document.querySelector('h1').textContent = config.title;
        document.querySelector('.model').textContent = config.model;

        const customImage = ipcRenderer.sendSync('get-custom-image');
        if (customImage) {
            document.querySelector('.mac-icon img').src = customImage;
        }
    }

    function saveConfig() {
        const config = {
            title: document.querySelector('h1').textContent,
            model: document.querySelector('.model').textContent,
            language: 'es'
        };
        ipcRenderer.send('save-config', config);
    }

    function openEditModal(elementId) {
        const element = document.getElementById(elementId);
        const modal = document.getElementById('editModal');
        const input = document.getElementById('modalInput');
        
        currentEditingElement = elementId;
        input.value = element.textContent;
        modal.style.display = 'block';
        input.focus();
    }

    function closeModal() {
        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
        currentEditingElement = null;
    }

    function saveModalChanges() {
        if (!currentEditingElement) return;
        
        const element = document.getElementById(currentEditingElement);
        const input = document.getElementById('modalInput');
        element.textContent = input.value;
        saveConfig();
        closeModal();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Enter' && currentEditingElement) saveModalChanges();
    });

    ipcRenderer.on('toggle-serial-number', () => {
        const serialNumberElement = document.getElementById('serialNumberValue');
        if (!isHidden) {
            originalSerialNumber = serialNumberElement.textContent;
            serialNumberElement.textContent = '*'.repeat(originalSerialNumber.length);
            isHidden = true;
        } else {
            serialNumberElement.textContent = originalSerialNumber;
            isHidden = false;
        }
    });

    ipcRenderer.on('update-image', (event, imagePath) => {
        document.querySelector('.mac-icon img').src = imagePath;
        setTimeout(() => {
            window.location.reload();
        }, 500);
    });

    ipcRenderer.on('edit-title', () => openEditModal('title'));
    ipcRenderer.on('edit-model', () => openEditModal('model'));

    function toggleExpandedInfo() {
        const expandableElements = document.querySelectorAll('.expandable');
        const moreInfoButton = document.querySelector('.more-info');

        isExpanded = !isExpanded;

        expandableElements.forEach(element => {
            element.style.display = isExpanded ? 'block' : 'none';
        });

        moreInfoButton.textContent = isExpanded ? 'Menos información...' : 'Más información...';
        ipcRenderer.send('window-controls', isExpanded ? 'expand' : 'collapse');
    }

    window.onload = async () => {
        loadConfig();
        const loadingScreen = document.querySelector('.loading-screen');
        await new Promise(resolve => setTimeout(resolve, 300));
        const systemInfo = await ipcRenderer.invoke('get-system-info');
        loadingScreen.classList.add('hidden');
        
        document.querySelector('.info-value[data-field="processor"]').textContent = systemInfo.processor;
        document.querySelector('.info-value[data-field="graphics"]').textContent = systemInfo.graphics;
        document.querySelector('.info-value[data-field="memory"]').textContent = systemInfo.memory;
        document.querySelector('.info-value[data-field="serialNumber"]').textContent = systemInfo.serialNumber;
        document.querySelector('.info-value[data-field="osVersion"]').textContent = systemInfo.osVersion;
        document.querySelector('.info-value[data-field="bootDrive"]').textContent = systemInfo.bootDrive;
        document.querySelector('.info-value[data-field="smbiosModel"]').textContent = systemInfo.smbiosModel;
        document.querySelector('.info-value[data-field="metal"]').textContent = systemInfo.metal;
        document.querySelector('.info-value[data-field="darwinVersion"]').textContent = systemInfo.darwinVersion;

        document.querySelectorAll('.expandable').forEach(element => {
            element.style.display = 'none';
        });

        document.querySelector('.more-info').addEventListener('click', toggleExpandedInfo);

        originalSerialNumber = document.getElementById('serialNumberValue').textContent;
    };