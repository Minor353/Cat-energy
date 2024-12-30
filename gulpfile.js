import gulp from "gulp";
import plumber from "gulp-plumber";
import sourcemap from "gulp-sourcemaps";
import sass from "gulp-dart-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";
import rename from "gulp-rename";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import imagemin, { mozjpeg, optipng, svgo } from "gulp-imagemin";
import webp from "gulp-webp";
import svgstore from "gulp-svgstore";
import del from "del";
import browserSync from "browser-sync";
import replace from "gulp-replace";

const sync = browserSync.create();

// Styles
const styles = () => {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(replace("../../img/", "../img/"))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};
export { styles };

// HTML
const html = () => {
  return gulp.src("source/*.html").pipe(htmlmin({ collapseWhitespace: true })).pipe(gulp.dest("build"));
};
export { html };

// Scripts
const scripts = () => {
  return gulp
    .src("source/js/script.js")
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
};
export { scripts };

// Images
const optimizeImages = () => {
  return gulp
    .src("source/img/**/*.{png,jpg,svg}")
    .pipe(
      imagemin([
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo(),
      ])
    )
    .pipe(gulp.dest("build/img"));
};
export { optimizeImages };

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}").pipe(gulp.dest("build/img"));
};
export { copyImages };

// WebP
const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}").pipe(webp({ quality: 90 })).pipe(gulp.dest("build/img"));
};
export { createWebp };

// Sprite
const sprite = () => {
  return gulp
    .src("source/img/icons/*.svg")
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};
export { sprite };

// Copy
const copy = (done) => {
  gulp
    .src(["source/fonts/*.{woff2,woff}", "source/*.ico", "source/apple.png", "source/favicon.png", "source/favicon.svg",  "source/img/**/*.svg", "!source/img/icons/*.svg"], {
      base: "source",
    })
    .pipe(gulp.dest("build"));
  done();
};
export { copy };

// Clean
const clean = () => {
  return del("build");
};
export { clean };

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};
export { server };

// Reload
const reload = (done) => {
  sync.reload();
  done();
};
export { reload };

// Watcher
const watcher = () => {
  gulp.watch("source/sass/**/*.sass", gulp.series(styles));
  gulp.watch("source/js/script.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
};
export { watcher };

// Build
const build = gulp.series(clean, copy, optimizeImages, gulp.parallel(styles, html, scripts, sprite, createWebp));
export { build };

// Default
const dev = gulp.series(clean, copy, copyImages, gulp.parallel(styles, html, scripts, sprite, createWebp), gulp.series(server, watcher));
export default dev;
