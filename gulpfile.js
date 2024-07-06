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

//Crear imagenes thumpnail
//Modificar el ancho y alto de la imagen
export async function crop(done) {
  const inputFolder = "src/img/gallery";
  const outputFolder = "src/img/gallery/thumb";
  const width = 250;
  const height = 180;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  const images = fs.readdirSync(inputFolder).filter((file) => {
    return /\.(jpg)$/i.test(path.extname(file));
  });
  try {
    images.forEach((file) => {
      const inputFile = path.join(inputFolder, file);
      const outputFile = path.join(outputFolder, file);
      sharp(inputFile)
        .resize(width, height, {
          position: "centre",
        })
        .toFile(outputFile);
    });

    done();
  } catch (error) {
    console.log(error);
  }
}

//Funcion para convierte los formatos de imagen a webp
export async function imagenes(done) {
  const srcDir = "./src/img";
  const buildDir = "./build/img";
  const images = await glob("./src/img/**/*{jpg,png}");

  images.forEach((file) => {
    const relativePath = path.relative(srcDir, path.dirname(file));
    const outputSubDir = path.join(buildDir, relativePath);
    procesarImagenes(file, outputSubDir);
  });
  done();
}

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

//Funcion que se encarga de minificar el codigo js y mapearlo
export function js(done) {
  src("src/js/app.js", { sourcemaps: true })
    .pipe(terser())
    .pipe(dest("build/js", { sourcemaps: "." }));
  done();
}
//Funcion que se encarga de compilar el codigo scss a codigo css
export function css(done) {
  //.pipe(sourcemaps.init())
  src("src/scss/app.scss", { sourcemaps: true })
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    //.pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("build/css", { sourcemaps: "." }));
  done();
}

//Funcion que vera los combios en los archivos y ejecutara determinada funcion
export function dev() {
  watch("src/scss/**/*.scss", css);
  watch("src/js/**/*.js", js);
  watch("src/img/**/*.{png.jpg}", imagenes);
}
// Determinamos la funcion por defecto como una serie de funciones a ejecutar.
// La funcion dev es la que esperara los cambios en archivos y hara el callback de las funciones
export function build() {
  series(js, css, imagenes);
}
export default series(crop, js, css, imagenes, dev);
//exports.default = series(css, dev);
// VERSION ESM5
// CSS y SASS
//const sass = require("gulp-sass")(require("sass"));
//const postcss = require("gulp-postcss");
//const autoprefixer = require("autoprefixer");
//const sourcemaps = require("gulp-sourcemaps");
//const cssnano = require("cssnano");
// Imagenes
//const imagemin = require("gulp-imagemin");
//const webp = require("gulp-webp");
//const avif = require("gulp-avif");
//function css(done) {
//  src("src/scss/app.scss")
//    .pipe(sourcemaps.init())
//    .pipe(sass())
//    .pipe(postcss([autoprefixer(), cssnano()]))
//    .pipe(sourcemaps.write("."))
//    .pipe(dest("build/css"));
//
//  done();
//}
//
//function imagenes() {
//  return src("src/img/**/*")
//    .pipe(imagemin({ optimizationLevel: 3 }))
//    .pipe(dest("build/img"));
//}
//
//function versionWebp() {
//  const opciones = {
//    quality: 50,
//  };
//  return src("src/img/**/*.{png,jpg}")
//    .pipe(webp(opciones))
//    .pipe(dest("build/img"));
//}
//function versionAvif() {
//  const opciones = {
//    quality: 50,
//  };
//  return src("src/img/**/*.jpg").pipe(avif(opciones)).pipe(dest("build/img"));
//}
//
//function dev() {
//  watch("src/scss/**/*.scss", css);
//  watch("src/img/**/*", imagenes);
//}
//exports.css = css;
//exports.dev = dev;
//exports.imagenes = imagenes;
//exports.versionWebp = versionWebp;
//exports.versionAvif = versionAvif;
//exports.default = series(imagenes, versionWebp, versionAvif, css, dev);
// series - Se inicia una tarea, y hasta que finaliza, inicia la siguiente
// parallel - Todas inician al mismo tiempo
