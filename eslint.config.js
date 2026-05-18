const js = require('@eslint/js');
const pluginReact = require('eslint-plugin-react');
const globals = require('globals');

module.exports = [
	js.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.commonjs,
				...globals.node,
				...globals.es2021,
				wp: 'readonly',
				jQuery: 'readonly',
				etfpipecheck: 'readonly',
			},
			ecmaVersion: 12,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'react/no-unknown-property': ['error', { ignore: ['allowTransparency'] }],
			'func-names': 'off',
			'no-console': 'warn',
			'no-unused-vars': 'warn',
			'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/display-name': 'off',
			'no-process-exit': 'off',
			'no-unsafe-optional-chaining': 'off',
			'object-shorthand': 'warn',
			'class-methods-use-this': 'off',
		},
	},
];
