//sergioangulorosales@gmail.com
//22-06-24
//Version con ESM6
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { src, dest, watch, series } from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import terser from "gulp-terser";
import sharp from "sharp";
const sass = gulpSass(dartSass);
/**
 * Funcion asyncrona que modifica el ancho y alto de las imagenes
 * @summary Itera en los ficheros la funcion de resize() para cambiar su alto y ancho que previamente se le indica.
 * guarda las imagenes recortadas como in fichero nuevo en la direcion de destino
 * para modificar el ancho/alto  ingresar los valores en width~~ height~~
 * @param {done} done - Recibe un promise para detener su ejecucion mas adelante
 * @return {null} No retorna un valor.
 */
export async function crop(done) {
  const inputFolder = "./src/img";
  const outputFolder = "./src/img";
  const width = [1920, 1280, 720];
  const height = [1080, 720, 480];
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  const images = fs.readdirSync(inputFolder).filter((file) => {
    return /\.(jpg)$/i.test(path.extname(file));
  });
  try {
    images.forEach((file) => {
      const inputFile = path.join(inputFolder, file);
      const baseName = path.basename(file, path.extname(file));
      const extName = path.extname(file);
      const prefix = "_";
      //1920
      const outputFile = path.join(
        outputFolder,
        `${baseName}${prefix}${width[0]}${extName}`
      );
      //1280
      const outputFile1 = path.join(
        outputFolder,
        `${baseName}${prefix}${width[1]}${extName}`
      );
      //480
      const outputFile2 = path.join(
        outputFolder,
        `${baseName}${prefix}${width[2]}${extName}`
      );
      //1920
      sharp(inputFile)
        .resize(width[0], height[0], {
          position: "centre",
          background: { r: 255, g: 255, b: 255, alpha: 0.8 },
        })
        .toFile(outputFile);
      //1280
      sharp(inputFile)
        .resize(width[1], height[1], {
          position: "centre",
          background: { r: 255, g: 255, b: 255, alpha: 0.8 },
        })
        .toFile(outputFile1);
      //480
      sharp(inputFile)
        .resize(width[2], height[2], {
          position: "centre",
          background: { r: 255, g: 255, b: 255, alpha: 0.8 },
        })
        .toFile(outputFile2);

      done();
    });
  } catch (error) {
    console.log(error);
  }
}
/**
 * Funcion asyncrona que convierte el fotmato de las imagenes
 * @summary Itera en los ficheros la funcion de ProcesarImagenes() para generar los focheros con la extencion deseada(avif,webp)
 * @param {done} done - Recibe un promise para detener su ejecucion mas adelante
 * @return {null} No retorna un valor.
 */
export async function imagenes(done) {
  const srcDir = "./src/img";
  const buildDir = "./build/img";
  const images = await glob(
    "./src/img/**/*.{jpg,png}"
  ); /*Indicamos la capeta  y los formatos que buscar*/

  images.forEach((file) => {
    const relativePath = path.relative(srcDir, path.dirname(file));
    const outputSubDir = path.join(buildDir, relativePath);
    procesarImagenes(file, outputSubDir);
  });
  done();
}
/**
 * Funcion que se encarga de procesar la imagen para su optimizacion y conversion de formato
 * @summary
 * Caundo es llamada esta funcion verifica la existencia del archivo
 * identificamos su nombre y extencion para posteriormente usarlos juntando la carpeta de destino y su nombre extencion
 * iniciamos el proceso de optimizacion creando la variable de quality 0-100
 * convertimos el fichero y le indicamos las opciones de quality junto con su formato de destino
 * lo guardamos en su formato de destino
 * @param {file} file - le pasamos el fichero
 * @param {outputSubDir} outputSubDir - lugar donde se enviara el archivo ya modificado
 * @return {null} No retorna un valor.
 */
function procesarImagenes(file, outputSubDir) {
  if (!fs.existsSync(outputSubDir)) {
    fs.mkdirSync(outputSubDir, { recursive: true });
  }
  const baseName = path.basename(file, path.extname(file));
  const extName = path.extname(file);
  const outputFile = path.join(outputSubDir, `${baseName}${extName}`);
  const outputFileWebp = path.join(outputSubDir, `${baseName}.webp`);
  const outputFileavif = path.join(outputSubDir, `${baseName}.avif`);

  const options = { quality: 80 };
  sharp(file).jpeg(options).toFile(outputFile);
  sharp(file).webp(options).toFile(outputFileWebp);
  sharp(file).avif().toFile(outputFileavif);
}
/**
 * Funcion que se encarga de compilar el js
 * @summary
 * Caundo es llamada esta funcion identifica la hoja de js
 * Comprime la hoja js
 * Guarda la hoja js minificada junto con su Sourcemap en la carpeta de destino
 * @param {done} done - Recibe un promise para detener su ejecucion mas adelante
 * @return {null} No retorna un valor.
 */
export function js(done) {
  src("src/js/*.js", { sourcemaps: true })
    .pipe(terser())
    .pipe(dest("build/js", { sourcemaps: "." }));
  done();
}
/**
 * Funcion que se encarga de compilar el css
 * @summary
 * Caundo es llamada esta funcion identifica la hoja de scss , compila la hoja a CSS.
 * Comprime la hoja CSS , si tiene un error lo muestra en consola
 * Guarda la hoja CSS minificada junto con su Sourcemap en la carpeta de destino
 * @param {done} done - Recibe un promise para detener su ejecucion mas adelante
 * @return {null} No retorna un valor.
 */
export function css(done) {
  src("./src/scss/app.scss", { sourcemaps: true })
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(dest("./build/css/", { sourcemaps: "." }));
  done();
}
/**
 * Revisa cambios y ejecuta un callback.
 * @summary Escucha los cambios de los ficheros y al detectar un cambio manda a llamar la tarea asignada y queda a la escucha de nuevos cambios
 * @param {null} null - No recibe parametros
 * @return {null} No retorna un valor.
 */
export function dev() {
  watch("src/scss/**/*.scss", css);
  watch("src/img/**/*.{png.jpg}", imagenes);
  watch("src/js/**/*.{js}", js);
}
/**
 * construye la version final del proyecto.
 * @summary usa una series para llamar la cadena de funciones que construiran la version final del proyecto.
 * @param {done} done - Recive un parametro para indicar cuando termina la funcion
 * @return {NULL} No retorna un valor.
 */
export function build(done) {
  series(crop, js, css, imagenes);
  done();
}
/**
 * Funcion por defecto
 * @summary usa una series para llamar la caden de funciones del entorno de desarollo
 * @param {NULL} NULL - No recibe ningun parametro
 * @return {NULL} No retorna un valor.
 */
export default series(imagenes, js, css, dev);
