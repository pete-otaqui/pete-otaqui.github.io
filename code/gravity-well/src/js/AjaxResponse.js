
/**
 * AjaxResponse objects contain Number status, Boolean ok,
 * String responseText, String responseXML and Object
 * responseData
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires AjaxRequest
 */
AjaxResponse = base2.Base.extend({
    status : 0,
    ok : false,
    responseText : null,
    responseXML : null,
    responseData : null
})
