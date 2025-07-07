<p align="center">
		<picture>
			<img src="https://i.imgur.com/dJpyzuS.png" />
		</picture><br>
	<b>Herramienta para mostrar la información de macOS de una manera más linda.
<p align="center">
	<a href="https://github.com/plvxt/xtabout/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/v/release/plvxt/xtabout?label=release&sort=semver"></a>
	<a href="https://github.com/plvxt/xtabout/releases"><img alt="GitHub all releases" src="https://img.shields.io/github/downloads/plvxt/xtabout/total?label=downloads"></a>
</p>

## ¿Qué información muestra?
- Modelo completo del procesador
- Tarjeta de video
- Memoria RAM
- Número de serie
- Versión de macOS
- Disco de arranque
- SMBIOS
- Versión Metal
- Versión Darwin
- Compilación
- Versión de XTabout


## Capturas de pantalla
<p align="center">
		<picture>
			<img src="https://i.imgur.com/Dz0f2y9.png" />
		</picture></p>

## Compilar
Para hacer tu propia compilación de este proyecto es tan sencillo como seguir estos pasos:
1. Tener instalado [Node.js](https://nodejs.org/en/download) y [git](https://git-scm.com/downloads/mac) en tu equipo
2. Abrir una terminal en el directorio en que vas a trabajar
3. Clonar el proyecto con `git clone https://github.com/plvxt/XTabout.git`
4. Ejecutar el comando `npm install` para instalar las dependencias
5. Ejecutar el comando `npm run build` para compilarlo
6. Verificar la imagen DMG en el directorio `/dist`

*(Si deseas ejecutarlo sin compilar, ejecuta `npm start` en lugar de compilarlo)*
