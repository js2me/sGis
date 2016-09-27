sGis.module('controls.Rectangle', [
    'controls.PolyDrag',
    'feature.Polygon'
], function(PolyDrag, Polygon) {

    'use strict';

    /**
     * Control for drawing rectangles by dragging from corner to corner.
     * @alias sGis.controls.Rectangle
     * @extends sGis.controls.PolyDrag
     */
    class Rectangle extends PolyDrag {
        _startNewFeature(point) {
            let position = point.position;
            this._activeFeature = new Polygon([[position, position, position, position]], { crs: point.crs, symbol: this.symbol });
            this.tempLayer.add(this._activeFeature);
        }

        _updateFeature(point) {
            let coord = this._activeFeature.rings[0];
            let pointCoord = point.position;

            coord = [[coord[0], [coord[1][0], pointCoord[1]], pointCoord, [pointCoord[0], coord[3][1]]]];

            this._activeFeature.rings = coord;
        }
    }

    return Rectangle;
    
});
