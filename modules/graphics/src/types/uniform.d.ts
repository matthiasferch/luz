import { Texture } from './texture';
export type Uniform = WebGLActiveInfo & {
    location: WebGLUniformLocation;
};
export declare module Uniform {
    type Value = number | Float32Array | Texture;
    interface Block {
        name: string;
        index: number;
        binding: number;
        offsets: Record<string, number>;
    }
}
