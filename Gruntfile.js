'use strict';

module.exports = function (grunt) {

	var pkg, bower, taskName, name;

	pkg = grunt.file.readJSON('package.json');
	bower = grunt.file.readJSON('bower.json');
	name = pkg.name.toLowerCase();

	grunt.initConfig({
		pkg: pkg,
		bowerJSON: bower,
		banner: '/*!\n' +
			' * <%= pkg.name %> v<%= pkg.version %>\n' +
			' * Website <%= pkg.website %>\n' +
			' * Copyright 2015 <%= pkg.author %>\n' +
			' * The <%= pkg.license %> License\n' +
			(
				pkg.name !== "Honoka" ?
					' * Based on Honoka (http://honokak.osaka/) by windyakin\n'
					:
					''
			) +
			' */\n' +
			'/*!\n' +
			' * Bootstrap v<%= twbs.version %> (<%= twbs.homepage %>)\n' +
			' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= twbs.author %>\n' +
			' * Licensed under the <%= twbs.license %> license\n' +
			' */\n',
		// bannerの調整
		replace: {
			// バナーの追加
			banner: {
				files: {
					'dist/css/bootstrap.css': 'dist/css/bootstrap.css',
					'dist/css/bootstrap.min.css': 'dist/css/bootstrap.min.css'
				},
				options: {
					replacements: [{
						pattern: '@charset "UTF-8";',
						replacement: '@charset "UTF-8";\n<%= banner %>'
					}]
				}
			},
			bootstrap: {
				files: {
					'dist/css/bootstrap.css': 'dist/css/bootstrap.css',
					'dist/css/bootstrap.min.css': 'dist/css/bootstrap.min.css'
				},
				options: {
					replacements: [{
						pattern: '../fonts/bootstrap/',
						replacement: '../fonts/'
					}]
				}
			}
		},
		// cssmin
		cssmin: {
			minify: {
				expand: true,
				cwd: 'dist/css/',
				src: ['bootstrap.css'],
				dest: 'dist/css/',
				ext: '.min.css',
				options: {
					advanced: false,
					keepSpecialComments: '*',
					compatibility: 'ie8',
				}
			}
		},
		// SCSSのコンパイル
		sass: {
			options: {
				sourcemap: 'none',
				unixNewlines: true,
				style: 'expanded',
				bundleExec: true,
				loadPath: ['bower_components/bootstrap-sass/assets/stylesheets/']
			},
			bootstrap: {
				files: [{
					expand: true,
					cwd: 'scss',
					src: ['**/*.scss'],
					dest: 'dist/css/',
					ext: '.css'
				}]
			},
			assets: {
				options: {
					loadPath: ['scss/']
				},
				files: [{
					expand: true,
					cwd: 'src/scss',
					src: ['**/*.scss'],
					dest: 'dist/assets/css/',
					ext: '.css'
				}]
			}
		},
		csscomb: {
			options: {
				config: 'bower_components/bootstrap/less/.csscomb.json'
			},
			bootstrap: {
				files: {
					'dist/css/bootstrap.css': ['dist/css/bootstrap.css']
				}
			},
			assets: {
				expand: true,
				cwd: 'dist/assets/css/',
				src: ['**/*.css'],
				dest: 'dist/assets/css',
				ext: '.css'
			}
		},
		autoprefixer: {
			bootstrap: {
				files: {
					'dist/css/bootstrap.css': ['dist/css/bootstrap.css']
				}
			},
			assets: {
				expand: true,
				cwd: 'dist/assets/css/',
				src: ['**/*.css'],
				dest: 'dist/assets/css',
				ext: '.css'
			}
		},
		// SCSSのLinter
		scsslint: {
			options: {
				bundleExec: true,
				config: '.scss-lint.yml',
				reporterOutput: null,
				colorizeOutput: true
			},
			bootstrap: ['scss/**/*.scss'],
			assets: ['src/scss/**/*.scss']
		},
		// clean
		clean: {
			build: {
				src: ['bower_components/**/*', 'dist/css/**/*', 'dist/js/**/*', 'dist/fonts/**/*']
			}
		},
		// bowerのインストール
		bower: {
			install: {
				options: {
				}
			}
		},
		// コピー
		copy: {
			bower: {
				files: [
					{
						cwd: 'bower_components/bootstrap/dist',
						src: [
							'js/bootstrap.js',
							'js/bootstrap.min.js',
							'fonts/*'
						],
						dest: 'dist/',
						expand: true
					}
				]
			}
		},
		// ファイル更新監視
		watch: {
			// 自動コンパイル
			bootstrap: {
				files: ['scss/**/*.scss', 'src/scss/**/*.scss'],
				tasks: ['scsslint', 'css']
			}
		},
		// テストサーバ
		connect: {
			server: {
				options: {
					port: 8000,
					hostname: '*',
					base: 'dist'
				}
			}
		},
		compress: {
			main: {
				options: {
					archive: 'data/bootstrap-' + name + '-' + pkg.version + '-dist.zip'
				},
				files: [
					{
						//CSS
						expand: true,
						cwd: "dist/css/",
						src: ["bootstrap**.css"],
						dest: name + "/css"
					},
					{
						// Font
						expand: true,
						cwd: "dist/fonts/",
						src: ["**/*"],
						dest: name + "/fonts"
					},
					{
						// JavaScript
						expand: true,
						cwd: "dist/js/",
						src: ["bootstrap.**js"],
						dest: name + "/js"
					},
					{
						// Sample html
						expand: true,
						cwd: "dist/",
						src: ["bootstrap.html"],
						dest: name
					},
					{
						// README
						src: ["README.md"],
						dest: name
					}
				]
			}
		}
	});

	// GruntFile.jsに記載されているパッケージを自動読み込み
	for (taskName in pkg.devDependencies) {
		if (taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	// 本家Bootstrapのautoprefixerの設定を読み込む
	grunt.task.registerTask('getTwbsConfig', 'Get config from bootstrap', function () {
		try {
			var configBridge = grunt.file.readJSON('bower_components/bootstrap/grunt/configBridge.json');
			var twbsPkg = grunt.file.readJSON('bower_components/bootstrap/package.json');
			grunt.verbose.ok();
		} catch (e) {
			grunt.verbose.or.write("Loading Bootstrap config...").error().error(e.message);
			grunt.fail.fatal('Do you install bower component? Try "grunt bower:install"');
		}
		grunt.config.merge({
			twbs: twbsPkg,
			autoprefixer: {
				options: {
					browsers: configBridge.config.autoprefixerBrowsers
				}
			}
		});
	});

	// テスト
	grunt.registerTask('test', ['scsslint']);

	// CSSビルド
	grunt.registerTask('css', ['sass', 'autoprefixer']);

	// 最適化
	grunt.registerTask('optimize', ['csscomb', 'cssmin:minify']);

	// 開発用
	grunt.registerTask('server', ['bower:install', 'copy:bower', 'getTwbsConfig', 'test', 'css', 'connect', 'watch']);

	// ビルドタスク
	grunt.registerTask('build', ['clean:build', 'bower:install', 'copy:bower', 'getTwbsConfig', 'test', 'css', 'optimize', 'replace:banner', 'replace:bootstrap']);

	// 配布用パッケージ作成
	// TODO build task の中に bootstrap.css を予期しないタイミングで遅延書き込みする輩がある模様 あるいは Node.js v14.17.3 の問題
	grunt.registerTask('package', ['build', 'compress:main']);

	grunt.registerTask('eatwarnings', function () {
		grunt.warn = grunt.fail.warn = function (warning) {
			grunt.log.error(warning);
		};
	});

	grunt.task.registerMultiTask(
		"replace",
		"replace",
		function () {
			for (let pair of Object.entries(this.data.files)) {
				const dest = pair[0];
				const src = pair[1];

				let content = grunt.file.read(src);

				for (let replacement of this.data.options.replacements) {
					const parts = content.split(replacement.pattern);
					content = parts.join(replacement.replacement);
				}

				grunt.file.write(dest, content);
			}
		}
	);
};
