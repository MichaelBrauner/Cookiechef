import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
    input: 'src/Whisk.js',
    output: {
        file: 'dist/whisk.min.js',
        format: 'cjs'
    },
    plugins: [
        uglify(),
        babel({
            exclude: 'node_modules/**',
        }),
    ],
};