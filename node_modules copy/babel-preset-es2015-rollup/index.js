var relative = require( 'require-relative' );

var baseLocation = require.resolve( 'babel-preset-es2015' );
var plugins = require( baseLocation ).plugins.slice();

var commonjsPlugin = relative( 'babel-plugin-transform-es2015-modules-commonjs', baseLocation );

var i = plugins.length;
while ( i-- ) {
	var plugin = plugins[i];
	if ( plugin === commonjsPlugin || plugin[0] === commonjsPlugin ) {
		plugins.splice( i, 1 );
	}
}

plugins.push( require( 'babel-plugin-external-helpers' ) );

module.exports = { plugins: plugins };
