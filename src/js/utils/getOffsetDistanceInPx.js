import { DEFAULT_SETTINGS } from '../core/constants'

/**
* Returns the distance taking into account the default distance due to
* the transform: translate setting in CSS
* @param {Number} distance
* @return {String}
*/
export default function getOffsetDistanceInPx(distance) {
    return -(distance - DEFAULT_SETTINGS.distance) + 'px'
}
