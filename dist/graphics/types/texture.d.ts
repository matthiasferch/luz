export type Texture = WebGLTexture & {
    target: number;
    format: number;
    type: number;
    width: number;
    height: number;
    tiling: Texture.Tiling;
    filtering: Texture.Filtering;
    useMipmaps: boolean;
};
export declare module Texture {
    enum Tiling {
        None = 0,
        Both = 1,
        Horizontal = 2,
        Vertical = 3
    }
    enum Filtering {
        None = 0,
        Linear = 1,
        Bilinear = 2,
        Trilinear = 3
    }
}
