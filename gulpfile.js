/* -------------------------------
 * Imports
 * ------------------------------- */
var gulp = require('gulp');
var express = require('express');
var shell = require('gulp-shell');
var del = require('del');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var fs = require('fs');
var handlebars = require('handlebars');
var gutil = require('gulp-util');

var debug = require('gulp-debug');

/* -------------------------------
 * Public tasks
 * ------------------------------- */
var distRoot = __dirname + '/dist';
var optimRoot = distRoot + '/optimized';
var srcRoot = __dirname + '/src';
var pages = [
  {
    'filename': 'doc-begin.html',
    'folder': 'doc-base',
    'lang': 'en',
    'title': 'Intent Documentation',
    'desc': 'Full documentation access',
    'navDoc': true,
    'navApi': false,
    'template': 'doc-home'
  },
  {
    'filename': 'index.html',
    'lang': 'fr',
    'title': 'API Doc - Intent Documentation',
    'desc': 'intentOS offre aux développeurs une API de données REST leur permettant d’accéder et de contribuer au suivi des activités relatives à l’exploitation du patrimoine immobilier de ses clients.',
    'navDoc': true,
    'navApi': false,
    'template': 'doc-intro'
  },
  {
    'filename': 'reference.html',
    'lang': 'en',
    'title': 'API Reference - Intent Documentation',
    'desc': 'Full documentation for API',
    'navDoc': false,
    'navApi': true,
    'template': 'api-ref'
  }
];

var displayErr;
var onError = function (err) {
  displayErr = gutil.colors.red(err);
  gutil.log(displayErr);
  gutil.beep();
  this.emit('end');
};

gulp.task('clean', ['cleanPartial'], function(cb) {
  del([
    distRoot + '/css',
    distRoot + '/images',
    distRoot + '/lib',
    distRoot + '/index.html',
    distRoot + '/o2c.html',
    distRoot + '/swagger-ui.js',
    distRoot + '/swagger-ui.min.js'
  ], cb);
});

gulp.task('build', ['clean', 'swagger-build'], function() {
  fs.createReadStream(distRoot+'/o2c.html').pipe(fs.createWriteStream(optimRoot+'/o2c.html'));
  gulp.start('buildPartial');
});

gulp.task('cleanPartial', function(cb) {
  del([
    optimRoot+'/*'
  ], cb);
});

gulp.task('buildPartial', ['cleanPartial'], function() {
  gulp.start('styles', 'images', 'scripts', 'html');
});

gulp.task('watch', function() {
  gulp.watch(srcRoot+'/custom/less/**/*.less', ['styles']);
  gulp.watch(srcRoot+'/custom/scripts/**/*.js', ['scripts']);
  gulp.watch(srcRoot+'/custom/images/**/*', ['images']);
  gulp.watch(srcRoot+'/custom/template/**/*.handlebars', ['html']);
});

gulp.task('serve', function() {
  var app = express();

  //app.use('/', express.static(optimRoot+'/'));

  //app.use('/api-reference', express.static(optimRoot+'/html/api-ref.html'));
  app.use('/documentation', express.static(optimRoot+'/'));
  //app.use('/doc', express.static(optimRoot+'/html/doc.html'));

  //Routes for API swagger
  app.use('/api-docs', express.static(distRoot+'/api-docs.json'));
  app.use('/api-docs/datahub-events', express.static(distRoot+'/datahub-events.json'));
  app.use('/api-docs/datahub-tags', express.static(distRoot+'/datahub-tags.json'));
  app.use('/api-docs/datahub-streams', express.static(distRoot+'/datahub-streams.json'));

  var server = app.listen(3000, function() {
    console.log('Running on port 3000');
  });
});

gulp.task('default', ['buildPartial']);

/* -------------------------------
 * Private tasks
 * ------------------------------- */
gulp.task('swagger-build', shell.task([
  'npm run-script build'
]));

gulp.task('styles', function() {
  return gulp.src(srcRoot+'/custom/less/base.less')
    .pipe(less())
    .on('error', onError)
    .pipe(gulp.dest(distRoot+'/css'))
    .on('end', function() {
      return gulp.src([distRoot+'/css/reset.css', distRoot+'/css/base.css', distRoot+'/css/screen.css'])
        .pipe(minifyCSS())
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(optimRoot+'/css/'));
    });
});

gulp.task('images', function() {
  return gulp.src(srcRoot+'/custom/images/**/*')
    .pipe(gulp.dest(distRoot+'/images'))
    .on('end', function() {
      return gulp.src(distRoot+'/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(optimRoot+'/images'));
    });
});

gulp.task('scripts', function() {
  return gulp.src([
      distRoot+'/lib/shred.bundle.js',
      distRoot+'/lib/jquery-1.8.0.min.js',
      distRoot+'/lib/jquery.slideto.min.js',
      distRoot+'/lib/jquery.wiggle.min.js',
      distRoot+'/lib/jquery.ba-bbq.min.js',
      distRoot+'/lib/handlebars-1.0.0.js',
      distRoot+'/lib/underscore-min.js',
      distRoot+'/lib/backbone-min.js',
      distRoot+'/lib/swagger.js',
      distRoot+'/swagger-ui.js',
      distRoot+'/lib/highlight.7.3.pack.js',
      distRoot+'/lib/swagger-oauth.js',
      srcRoot+'/custom/scripts/doc.js'
    ])
    .pipe(concat('api.js'))
    .pipe(uglify())
    .pipe(gulp.dest(optimRoot))
});

gulp.task('html', function() {
  var headerTpl, contentTpl, indexTpl, footerTpl, html;

  pages.forEach(function(page) {
    headerTpl = handlebars.compile(fs.readFileSync(srcRoot+'/custom/template/header.handlebars').toString());
    contentTpl = handlebars.compile(fs.readFileSync(srcRoot+'/custom/template/pages/'+page.template+'.handlebars').toString());
    footerTpl = handlebars.compile(fs.readFileSync(srcRoot+'/custom/template/footer.handlebars').toString());
    indexTpl = handlebars.compile(fs.readFileSync(srcRoot+'/custom/template/index.handlebars').toString());
    html = indexTpl({
      'lang': page.lang,
      'title': page.title,
      'desc': page.desc,
      'header': headerTpl({
        navDoc: page.navDoc,
        navApi: page.navApi
      }),
      'content': contentTpl(),
      'footer': footerTpl()
    });

    fs.writeFileSync(optimRoot+'/'+page.filename, html);
  });
});