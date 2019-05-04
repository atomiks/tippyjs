// Passive event listener config
export const PASSIVE = { passive: true }

// Popper `preventOverflow` padding
export const PADDING = 4

// Popper attributes
// In Popper v2 these will be `data-*` instead of `x-*` to adhere to HTML5 spec
export const PLACEMENT_ATTRIBUTE = 'x-placement'
export const OUT_OF_BOUNDARIES_ATTRIBUTE = 'x-out-of-boundaries'

// Classes
export const IOS_CLASS = `__NAMESPACE_PREFIX__-iOS`
export const ACTIVE_CLASS = `__NAMESPACE_PREFIX__-active`
export const POPPER_CLASS = `__NAMESPACE_PREFIX__-popper`
export const TOOLTIP_CLASS = `__NAMESPACE_PREFIX__-tooltip`
export const CONTENT_CLASS = `__NAMESPACE_PREFIX__-content`
export const BACKDROP_CLASS = `__NAMESPACE_PREFIX__-backdrop`
export const ARROW_CLASS = `__NAMESPACE_PREFIX__-arrow`
export const ROUND_ARROW_CLASS = `__NAMESPACE_PREFIX__-roundarrow`

// Selectors
export const POPPER_SELECTOR = `.${POPPER_CLASS}`
export const TOOLTIP_SELECTOR = `.${TOOLTIP_CLASS}`
export const CONTENT_SELECTOR = `.${CONTENT_CLASS}`
export const BACKDROP_SELECTOR = `.${BACKDROP_CLASS}`
export const ARROW_SELECTOR = `.${ARROW_CLASS}`
export const ROUND_ARROW_SELECTOR = `.${ROUND_ARROW_CLASS}`
