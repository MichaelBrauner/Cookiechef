import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
    input: 'src/Whisk.js',
    output: {
        name: 'Whisk',
        file: 'dist/whisk.min.js',
        format: 'umd',
        globals: {
            'lodash': 'lodash',
        },
    },
    external: [ 'regenerator-runtime/runtime', 'lodash'],
    plugins: [
        uglify(),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
};