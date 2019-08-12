/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maTileMapMarker
 * @restrict 'E'
 * @scope
 *
 * @description Adds a marker to a <a ui-sref="ui.docs.ngMango.maTileMap">maTileMap</a>. If content is supplied, it will be added to the map
 * as a popup that is opened when the marker is clicked. Local scope variables that are available inside the marker popup are
 * <code>$leaflet</code>, <code>$map</code>, <code>$mapCtrl</code>, <code>$marker</code>, and <code>$markerCtrl</code>.
 * 
 * @param {LatLng|number[]|string} coordinates Coordinates (latitude/longitude) of the marker
 * @param {string=} tooltip Text to display in the marker tooltip
 * @param {expression=} on-drag Expression is evaluated when the marker been dragged (only once, when dragging has stopped).
 * You must specify <code>draggable: true</code> in the options to make the marker draggable.
 * Available locals are <code>$leaflet</code>, <code>$map</code>, <code>$marker</code>, <code>$event</code>, and <code>$coordinates</code>.
 * @param {expression=} on-click Expression is evaluated when the marker is clicked.
 * Available locals are <code>$leaflet</code>, <code>$map</code>, <code>$marker</code>, <code>$event</code>, and <code>$coordinates</code>.
 * @param {object=} options Options for the Leaflet marker instance,
 * see <a href="https://leafletjs.com/reference-1.5.0.html#marker-option" target="_blank">documentation</a>
 */

class TileMapMarkerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude']; }
    
    constructor($scope, $element, $transclude) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        
        this.mapCtrl = $scope.$mapCtrl;
    }
    
    $onChanges(changes) {
        if (!this.marker) return;
        
        if (changes.coordinates && this.coordinates) {
            this.marker.setLatLng(this.mapCtrl.parseLatLong(this.coordinates));
        }

        if (changes.tooltip && this.tooltip) {
            this.marker.bindTooltip(this.tooltip);
        }
    }

    $onInit() {
        this.marker = this.mapCtrl.leaflet.marker(this.mapCtrl.parseLatLong(this.coordinates), this.options)
            .addTo(this.$scope.$layer);

        if (this.tooltip) {
            this.marker.bindTooltip(this.tooltip);
        }
        
        if (typeof this.onDrag === 'function') {
            this.marker.on('dragend', event => {
                const locals = {$marker: this.marker, $event: event, $coordinates: this.marker.getLatLng()};
                this.$scope.$apply(() => {
                    this.onDrag(locals);
                });
            });
        }
        
        if (typeof this.onClick === 'function') {
            this.marker.on('click', event => {
                const locals = {$marker: this.marker, $event: event, $coordinates: this.marker.getLatLng()};
                this.$scope.$apply(() => {
                    this.onClick(locals);
                });
            });
        }

        this.$transclude(($clone, $scope) => {
            if ($clone.contents().length) {
                $scope.$marker = this.marker;
                $scope.$markerCtrl = this;
                this.marker.bindPopup($clone[0]);
            } else {
                $clone.remove();
                $scope.$destroy();
            }
        });
    }
    
    $onDestroy() {
        this.marker.remove();
    }
}

function tileMapMarkerDirective() {
    return {
        scope: false,
        bindToController: {
            coordinates: '<',
            options: '<?',
            tooltip: '@?',
            onDrag: '&?',
            onClick: '&?'
        },
        transclude: 'element',
        controller: TileMapMarkerController
    };
}

export default tileMapMarkerDirective;