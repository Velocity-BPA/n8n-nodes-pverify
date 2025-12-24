const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.svg')
    .pipe(dest('dist/nodes'));
}

function buildPng() {
  return src('nodes/**/*.png')
    .pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
exports['build:png'] = buildPng;
exports.default = buildIcons;
