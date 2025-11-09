import path from 'path';
export default {
    mode: 'production',
    entry: path.resolve('./index.ts'),
    output: {
        path: path.resolve('dist'),
        filename: '[name].bundle.js',
        library: {
            name: 'react-snap-state',
            type: 'umd'
        },
        globalObject: 'globalThis'
    },
    resolve: {
        extensions: ['.tsx','.ts','.jsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env', 
                            [
                                '@babel/preset-react', 
                                {
                                    runtime: 'automatic',
                                }
                            ],
                            '@babel/preset-typescript'
                        ]
                    }
                }
            }
        ]
    },
    externals: {react: 'react', 'react-dom': 'react-dom'}
}