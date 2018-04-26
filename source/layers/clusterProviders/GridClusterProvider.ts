import {FeatureGroup} from '../../features/FeatureGroup';
import {Bbox} from '../../Bbox';
import {Feature} from "../../features/Feature";
import {copyArray, error} from '../../utils/utils';

export interface IClusterProvider {
    features?: Feature[];
    size?: number;
    resolution?: number;
}

export interface FeatureCluster extends Feature {
    indexX?: number;
    indexY?: number;
}

export class GridClusterProvider {
    private _features: Feature[];
    private _size: number;
    private _resolution: number;
    private _clusters: FeatureGroup[];
    private _cache:  { [key: string]: FeatureGroup[]; };

    constructor({ size = 44 }: IClusterProvider = {}) {
        this._features = [];
        this._size = size;
        this._resolution = 9444;
        this._clusters = [];
        this._cache = {};
    }

    private _groupByIndex(features: Feature[], bbox: Bbox): FeatureGroup[] {
        const groups: { [key: string]: FeatureCluster[] } = {};
        const f = (feature: FeatureCluster) => [feature.indexX, feature.indexY];

        features.forEach((feature: FeatureCluster) => {
            const group = JSON.stringify(f(feature));
            groups[group] = groups[group] || [];
            groups[group].push(feature);
        });

        return Object.keys(groups).map( (group) => {
            return new FeatureGroup(groups[group], { crs: bbox.crs });
        })
    }

    private _pythagoras(p1: FeatureGroup, p2: FeatureGroup): number {
        return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
    }

    private _compareGroupsByDistance(featureGroups: FeatureGroup[], bbox: Bbox): FeatureGroup[] {
        const groups = copyArray(featureGroups);
        const clusters: FeatureGroup[] = [];

        for (let i = 0; i < groups.length; i++) {
            let cluster: Feature[] = groups[i].features;
            for (let j = i + 1; j < groups.length; j++) {
                if (this._pythagoras(groups[i], groups[j]) < this._size * this._resolution) {
                    cluster = cluster.concat(groups[j].features);
                    groups.splice(j, 1);
                }
            }

            if (
                clusters.length > 0 &&
                this._pythagoras(
                    clusters[clusters.length - 1],
                    new FeatureGroup(cluster, { crs: bbox.crs }),
                ) < this._size * this._resolution
            ) {
                clusters[clusters.length - 1] = new FeatureGroup(
                    clusters[clusters.length - 1].features.concat(cluster),
                    { crs: bbox.crs },
                );
            } else clusters.push(new FeatureGroup(cluster, { crs: bbox.crs }));
        }
        return clusters;
    }

    private _checkDistance(groups: FeatureGroup[]): boolean {
        let flag: boolean = false;

        for (let i = 0; i < groups.length; i++) {
            if(flag) break;
            for (let j = i + 1; j < groups.length; j++) {
                if(flag) break;
                if (this._pythagoras(groups[i], groups[j]) < this._size * this._resolution) flag = true;
            }
        }
        return flag;
    }

    getClusters(bbox: Bbox, resolution: number): FeatureGroup[] {
        if (this._cache[resolution]) this._clusters = this._cache[resolution];

        if (
            this._resolution !== resolution &&
            !this._cache[resolution] ||
            this._clusters.length === 0
        ) {
            this._resolution = resolution;
            const indexedFeatures = this._features.map(feature => {
                const point = feature.projectTo(bbox.crs);
                const indexX = Math.round(point.centroid[0] / (this._size * this._resolution));
                const indexY = Math.round(point.centroid[1] / (this._size * this._resolution));
                return Object.assign(feature, { indexX, indexY });
            });

            let flag: boolean = true;
            let clusters: FeatureGroup[] = this._groupByIndex(indexedFeatures, bbox);

            while (flag) {
                const comparedClusters = this._compareGroupsByDistance(clusters, bbox);
                clusters = comparedClusters;
                flag = this._checkDistance(comparedClusters);
            }

            this._cache = {
                ...this._cache,
                [resolution]: this._clusters,
            }
            this._clusters = clusters;
        }

        return this._clusters;
    }

    add(features: Feature | Feature[]): void {
        this._cache = {}
        this._clusters = [];
        const toAdd = Array.isArray(features) ? features : [features];
        if (toAdd.length === 0) return;
        toAdd.forEach(f => {
            if (this._features.indexOf(f) !== -1) error(new Error(`Feature ${f} is already in the GridClusterProvider`));
        });
        this._features = this._features.concat(toAdd);
    }

    remove(features: Feature | Feature[]): void {
        this._cache = {}
        this._clusters = [];
        const toRemove = Array.isArray(features) ? features : [features];
        if (toRemove.length === 0) return;
        toRemove.forEach(f => {
            let index = this._features.indexOf(f);
            if (index === -1) error(new Error(`Feature ${f} is not in the GridClusterProvider`));
            this._features.splice(index, 1);
        });
    }
}
