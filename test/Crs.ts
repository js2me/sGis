import "jest";
import {Crs, Projection} from "../source/Crs";
import {Coordinates} from "../source/baseTypes";

describe('sGis.Crs', () => {

    test('should find first-row projections', () => {
        let crs1 = new Crs();

        let projMap = new Map();
        projMap.set(crs1, ([x, y]: Coordinates) => { return [x,y]});
        let crs2 = new Crs(undefined, new Map(projMap));

        expect(typeof crs2.projectionTo(crs1)).toBe('function');
        expect((<Projection>crs2.projectionTo(crs1))([1,2])).toEqual([1,2]);
    });

    test('should find second-row projections', () => {
        let crs1 = new Crs();

        let projMap = new Map();
        projMap.set(crs1, ([x,y]: Coordinates) => { return [x,y]});
        let crs2 = new Crs(undefined, projMap);

        let projMap2 = new Map();
        projMap2.set(crs2, ([x, y]: Coordinates) => { return [y,x]});
        let crs3 = new Crs(undefined, projMap2);

        expect(typeof crs3.projectionTo(crs1)).toBe('function');
        expect((<Projection>crs3.projectionTo(crs1))([1,2])).toEqual([2,1]);
    });

});
