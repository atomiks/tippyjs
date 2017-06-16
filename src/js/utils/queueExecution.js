/**
* Pushes execution of a function to end of execution queue, doing so
* just before the next repaint
* @return {Function}
*/
export default function queueExecution(fn) {
    setTimeout(() => {
        window.requestAnimationFrame(fn)
    }, 0)
}
