export type Texture = WebGLTexture & {
    target: number;
    width: number;
    height: number;
    dataType: number;
    dataFormat: number;
    components: number;
    useMipmaps: boolean;
    data?: any;
};
export declare namespace Texture {
    type Precision = 8 | 24 | 32;
    type Format = 'Color' | 'Alpha' | 'Depth';
    type Tiling = 'None' | 'Repeat' | 'Mirror';
    type Filtering = 'None' | 'Linear' | 'Bilinear' | 'Trilinear';
}
