import { Serializable } from '@luz/utilities';
import { Texture } from '../types/texture';
export declare class Surface extends Serializable {
    path?: string;
    data?: any;
    width: number;
    height: number;
    format: Texture.Format;
    precision: Texture.Precision;
    tiling: Texture.Tiling;
    filtering: Texture.Filtering;
    useMipmaps: boolean;
    constructor(data?: Partial<Surface>);
    static deserialize(data: Partial<Surface>): Promise<Surface>;
}
