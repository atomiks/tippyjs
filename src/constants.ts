export const NAMESPACE_PREFIX = 'tippy'

// Passive event listener config
export const PASSIVE = { passive: true }

// Popper `preventOverflow` padding
export const PADDING = 4

// Popper attributes
// In Popper v2 these will be `data-*` instead of `x-*` to adhere to HTML5 spec
export const PLACEMENT_ATTRIBUTE = 'x-placement'
export const OUT_OF_BOUNDARIES_ATTRIBUTE = 'x-out-of-boundaries'

// Classes
export const IOS_CLASS = `${NAMESPACE_PREFIX}-iOS`
export const ACTIVE_CLASS = `${NAMESPACE_PREFIX}-active`

// Selectors
export const POPPER_SELECTOR = `.${NAMESPACE_PREFIX}-popper`
export const TOOLTIP_SELECTOR = `.${NAMESPACE_PREFIX}-tooltip`
export const CONTENT_SELECTOR = `.${NAMESPACE_PREFIX}-content`
export const BACKDROP_SELECTOR = `.${NAMESPACE_PREFIX}-backdrop`
export const ARROW_SELECTOR = `.${NAMESPACE_PREFIX}-arrow`
export const ROUND_ARROW_SELECTOR = `.${NAMESPACE_PREFIX}-roundarrow`
