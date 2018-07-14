'use strict'; 

const helpers = require('../helpers'); 
const Options = require('./Options'); 

/**
 * Handler 
 * Exception handler with try/catch wrapping a given functional expression. 
 * 
 * John R. Kosinski 
 * 11 May 2016
 * 
 * Options: 
 *  logPrefix {string}
 *  onError {function}
 *  finally {function}
 *  rethrow {bool}
 *  defaultReturnValue {*}
 */
function Handler(options) {
    const _this = this; 
    const _options = options; 

    /**
     * wraps the given functional expression in a try-catch-finally, executes it, and 
     * reacts to errors according to  configured options 
     * 
     * @param {*} f 
     *  the functional expression to wrap & execute
     * @param {*} options 
     *  any options to be overridden for this particular call 
     * 
     * @returns
     *  the return value of the given expression, if any; or in the event of an error, the 
     *  configured default return value (if any) 
     */
    /* any */ this.try = (f, options) => {
        let error = null; 
        let combinedOpts = new Options(_options, options); 

        try {
            return f();
        }
        catch(e) {
            error = e;

            //basic error handling first 
            if (_this.handleError)
                _this.handleError(e, combinedOpts); 

            //get options as defined or overridden
            const onError = combinedOpts.onError(); 
            const rethrow = combinedOpts.rethrow(); 
            let returnValue = combinedOpts.defaultReturnValue(); 

            //additional error handling
            if (onError && helpers.isFunction(onError)) {
                returnValue = onError(e, combinedOpts); 
            }

            //rethrow option 
            if (rethrow) {
                throw e; 
            }

            //return default value by default
            return returnValue; 
        }
        finally {
            //finally if configured 
            const fin = combinedOpts.finally(); 
            if (fin && helpers.isFunction(fin)) {
                fin(error, combinedOpts); 
            }
        }
    };

    /**
     * default handling of errors caught; can be overridden globally 
     * 
     * @param {Error} e 
     *  the exception caught
     * @param {Options} options
     *  encapsulates exception-handling options 
     */
    this.handleError = (e, options) => {
        try {
            if (_this.handleErrorOverride) {
                _this.handleErrorOverride(e, options); 
            }
            else {
                const logPrefix = options.logPrefix(); 
                if (logPrefix) {
                    console.error(logPrefix + ': ' + e);
                    console.error(e); 
                } else {
                    console.error(e); 
                }
            }
        }
        catch(ex) {
            console.error('handleError threw exception! '); 
            console.error(ex);
        }
    }; 

    /**
     * override this to globally override the default error handling 
     * 
     * @param {Error} e 
     *  the exception caught
     * @param {Options} options
     *  encapsulates exception-handling options 
     */
    this.handleErrorOverride = null;
}

module.exports = Handler;
