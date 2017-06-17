/**
* Pushes execution of a function to end of execution queue, doing so
* on next repaint
* @return {Function}
*/
export default function queueExecution(fn) {
    window.requestAnimationFrame(() => {
        setTimeout(fn, 0)
    })
}
