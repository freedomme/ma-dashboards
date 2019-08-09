/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maTileMapCircle
 * @restrict 'E'
 * @scope
 *
 * @description Adds a circle to a <a ui-sref="ui.docs.ngMango.maTileMap">maTileMap</a>. If content is supplied, it will be added to the map
 * as a popup that is opened when the circle is clicked. Local scope variables that are available inside the circle popup are
 * <code>$leaflet</code>, <code>$map</code>, <code>$mapCtrl</code>, <code>$circle</code>, and <code>$circleCtrl</code>.
 * 
 * @param {LatLng|number[]|string} coordinates Coordinates (latitude/longitude) of the circle
 * @param {string=} tooltip Text to display in the circle tooltip
 * @param {expression=} on-click Expression is evaluated when the circle is clicked.
 * Available locals are <code>$leaflet</code>, <code>$map</code>, <code>$circle</code>, <code>$event</code>, and <code>$coordinates</code>.
 * @param {object=} options Options for the Leaflet circle instance,
 * see <a href="https://leafletjs.com/reference-1.5.0.html#circle-option" target="_blank">documentation</a>
 */

class TileMapCircleController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude']; }
    
    constructor($scope, $element, $transclude) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
    }
    
    $onChanges(changes) {
        if (!this.circle) return;
        
        if (changes.coordinates && this.coordinates) {
            this.circle.setLatLng(this.mapCtrl.parseLatLong(this.coordinates));
        }
        
        if (changes.options && this.options) {
            this.circle.setStyle(this.options);
        }
        
        if (changes.tooltip && this.tooltip) {
            this.circle.bindTooltip(this.tooltip);
        }
    }

    $onInit() {
        this.map = this.mapCtrl.map;
        const L = this.leaflet = this.mapCtrl.leaflet;

        this.circle = L.circle(this.mapCtrl.parseLatLong(this.coordinates), this.options)
            .addTo(this.map);

        if (this.tooltip) {
            this.circle.bindTooltip(this.tooltip);
        }
        
        this.circle.on('click', event => {
            const locals = {$leaflet: L, $map: this.map, $circle: this.circle, $event: event, $coordinates: this.circle.getLatLng()};
            this.$scope.$apply(() => {
                if (event.type === 'click' && this.onClick) {
                    this.onClick(locals);
                }
            });
        });

        this.$transclude(($clone, $scope) => {
            if ($clone.contents().length) {
                $scope.$circle = this.circle;
                $scope.$circleCtrl = this;
                this.circle.bindPopup($clone[0]);
            } else {
                $scope.$destroy();
            }
        });
    }
    
    $onDestroy() {
        this.circle.remove();
    }
}

function tileMapCircleDirective() {
    return {
        scope: false,
        bindToController: {
            coordinates: '<',
            options: '<?',
            tooltip: '@?',
            onClick: '&?'
        },
        transclude: 'element',
        controller: TileMapCircleController,
        require: {
            mapCtrl: '^maTileMap'
        }
    };
}

export default tileMapCircleDirective;